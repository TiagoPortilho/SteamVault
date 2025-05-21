use std::fs;
use serde::{Serialize, Deserialize};
use tauri::api::path::app_config_dir;
use reqwest;

#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    pub api_key: String,
    pub steam_id: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Game {
  appid: u32,
  name: String,
  playtime_minutes: u32,
  fully_achieved: bool,
}

#[tauri::command]
pub fn salvar_configuracoes(api_key: String, steam_id: String) -> Result<(), String> {
    let config = Config {
        api_key,
        steam_id,
    };

    let config_dir = app_config_dir(&tauri::Config::default())
        .ok_or("Não foi possível encontrar o diretório de configuração")?;
    let config_path = config_dir.join("steamvault_config.json");

    if let Some(parent) = config_path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Erro criando diretório: {}", e))?;
    }

    let json = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Erro serializando config: {}", e))?;
    fs::write(&config_path, json)
        .map_err(|e| format!("Erro escrevendo arquivo: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn carregar_configuracoes() -> Result<Config, String> {
    let config_dir = app_config_dir(&tauri::Config::default())
        .ok_or("Não foi possível encontrar o diretório de configuração")?;
    let config_path = config_dir.join("steamvault_config.json");

    if config_path.exists() {
        let data = fs::read_to_string(&config_path)
            .map_err(|e| format!("Erro lendo arquivo config: {}", e))?;
        let config: Config = serde_json::from_str(&data)
            .map_err(|e| format!("Erro parseando JSON: {}", e))?;
        Ok(config)
    } else {
        Err("Arquivo de configuração não encontrado".to_string())
    }
}

#[tauri::command]
pub async fn get_player_game_info(api_key: String, steam_id: String) -> Result<Vec<Game>, String> {
    println!("Buscando jogos para steam_id: {}", steam_id);
    println!("Usando API Key: {}", api_key);
    let url = format!(
        "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key={}&steamid={}&include_appinfo=1&include_played_free_games=1",
        api_key, steam_id
    );
    println!("Buscando URL: {}", url);
    let client = reqwest::Client::new();

    let res = client.get(&url).send().await.map_err(|e| e.to_string())?;
    if !res.status().is_success() {
        return Err(format!("Failed to fetch owned games: {}", res.status()));
    }

    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;

    let games = match json["response"]["games"].as_array() {
        Some(games) => games,
        None => return Ok(vec![]), // Retorna lista vazia se não houver jogos
    };

    let mut result = Vec::new();

    for game in games {
        println!("Verificando jogo");
        let appid = game["appid"].as_u64().unwrap_or(0) as u32;
        let name = game["name"].as_str().unwrap_or("").to_string();
        let playtime = game["playtime_forever"].as_u64().unwrap_or(0) as u32;

        let ach_url = format!(
            "https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key={}&steamid={}&appid={}",
            api_key, steam_id, appid
        );

        let ach_res = client.get(&ach_url).send().await;

        let fully_achieved = match ach_res {
            Ok(resp) if resp.status().is_success() => {
                let ach_json: serde_json::Value = resp.json().await.unwrap_or_default();
                if let Some(achievements) = ach_json["playerstats"]["achievements"].as_array() {
                    achievements.iter().all(|a| a["achieved"].as_i64() == Some(1))
                } else {
                    false
                }
            }
            _ => false,
        };

        result.push(Game {
            appid,
            name,
            playtime_minutes: playtime,
            fully_achieved,
        });
    }

    Ok(result)
}
