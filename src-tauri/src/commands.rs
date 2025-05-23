use std::fs;
use serde::{Serialize, Deserialize};
use tauri::api::path::app_config_dir;
use reqwest;
use std::process::Command;

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
pub fn carregar_configuracoes() -> Result<Config, String> {
    println!("carregar_configuracoes: iniciando");
    let config_dir = app_config_dir(&tauri::Config::default());
    if config_dir.is_none() {
        println!("carregar_configuracoes: não encontrou diretório de configuração");
        return Err("Não foi possível encontrar o diretório de configuração".into());
    }
    let config_dir = config_dir.unwrap();
    let config_path = config_dir.join("steamvault_config.json");
    println!("carregar_configuracoes: caminho do arquivo config: {:?}", config_path);

    if config_path.exists() {
        let data = fs::read_to_string(&config_path);
        if data.is_err() {
            println!("carregar_configuracoes: erro lendo arquivo config: {:?}", data.as_ref().err());
            return Err(format!("Erro lendo arquivo config: {}", data.unwrap_err()));
        }
        let data = data.unwrap();
        println!("carregar_configuracoes: arquivo lido, conteúdo: {}", data);

        let config: Result<Config, _> = serde_json::from_str(&data);
        if config.is_err() {
            println!("carregar_configuracoes: erro parseando JSON: {:?}", config.as_ref().err());
            return Err(format!("Erro parseando JSON: {}", config.unwrap_err()));
        }
        let config = config.unwrap();
        println!("carregar_configuracoes: configuração carregada com sucesso: {:?}", config);
        Ok(config)
    } else {
        println!("carregar_configuracoes: arquivo de configuração não encontrado");
        Err("Arquivo de configuração não encontrado".to_string())
    }
}

#[tauri::command]
pub fn salvar_configuracoes(api_key: String, steam_id: String) -> Result<(), String> {
    println!("salvar_configuracoes: iniciando");
    let config = Config { api_key, steam_id };

    let config_dir = app_config_dir(&tauri::Config::default());
    if config_dir.is_none() {
        println!("salvar_configuracoes: não encontrou diretório de configuração");
        return Err("Não foi possível encontrar o diretório de configuração".into());
    }
    let config_dir = config_dir.unwrap();
    let config_path = config_dir.join("steamvault_config.json");
    println!("salvar_configuracoes: caminho do arquivo config: {:?}", config_path);

    if let Some(parent) = config_path.parent() {
        let res = fs::create_dir_all(parent);
        if res.is_err() {
            println!("salvar_configuracoes: erro criando diretório: {:?}", res.as_ref().err());
            return Err(format!("Erro criando diretório: {}", res.unwrap_err()));
        }
    }

    let json = serde_json::to_string_pretty(&config);
    if json.is_err() {
        println!("salvar_configuracoes: erro serializando config: {:?}", json.as_ref().err());
        return Err(format!("Erro serializando config: {}", json.unwrap_err()));
    }
    let json = json.unwrap();

    let res = fs::write(&config_path, json);
    if res.is_err() {
        println!("salvar_configuracoes: erro escrevendo arquivo: {:?}", res.as_ref().err());
        return Err(format!("Erro escrevendo arquivo: {}", res.unwrap_err()));
    }

    println!("salvar_configuracoes: configurações salvas com sucesso");
    Ok(())
}

#[tauri::command]
pub async fn atualizar_jogos_do_steam() -> Result<Vec<Game>, String> {
    println!("atualizar_jogos_do_steam: iniciando");
    let config = carregar_configuracoes()?;
    println!("atualizar_jogos_do_steam: configuração carregada: {:?}", config);

    let games = get_player_game_info(config.api_key.clone(), config.steam_id.clone()).await?;
    println!("atualizar_jogos_do_steam: jogos recebidos: {:?}", games);

    let prisma_client_path = "../../prisma";

    for game in &games {
        let sql = format!(
            "INSERT OR REPLACE INTO Game (appid, name, playtimeMinutes, fullyAchieved) VALUES ({}, '{}', {}, {});",
            game.appid,
            game.name.replace("'", "''"),
            game.playtime_minutes,
            if game.fully_achieved { 1 } else { 0 }
        );
        println!("atualizar_jogos_do_steam: executando SQL: {}", sql);
        
        let output = Command::new("npx")
            .current_dir(prisma_client_path)
            .arg("prisma")
            .arg("db")
            .arg("execute")
            .arg("--script")
            .arg(&sql)
            .output();

        if output.is_err() {
            println!("atualizar_jogos_do_steam: erro executando comando Prisma: {:?}", output.as_ref().err());
            return Err(format!("Erro executando comando Prisma: {}", output.unwrap_err()));
        }
        let output = output.unwrap();

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            println!("atualizar_jogos_do_steam: erro ao inserir no banco: {}", stderr);
            return Err(format!("Erro ao inserir no banco: {}", stderr));
        }

        println!("atualizar_jogos_do_steam: inserção de jogo {} concluída", game.appid);
    }

    println!("atualizar_jogos_do_steam: finalizado com {} jogos inseridos", games.len());
    Ok(games)
}

#[tauri::command]
pub async fn get_player_game_info(api_key: String, steam_id: String) -> Result<Vec<Game>, String> {
    println!("get_player_game_info: iniciando para steam_id: {}", steam_id);
    println!("get_player_game_info: usando api_key: {}", api_key);
    let url = format!(
        "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key={}&steamid={}&include_appinfo=1&include_played_free_games=1",
        api_key, steam_id
    );
    println!("get_player_game_info: URL chamada: {}", url);

    let client = reqwest::Client::new();
    let res = client.get(&url).send().await;
    if res.is_err() {
        println!("get_player_game_info: erro na requisição: {:?}", res.as_ref().err());
        return Err(res.err().unwrap().to_string());
    }
    let res = res.unwrap();

    if !res.status().is_success() {
        println!("get_player_game_info: status HTTP não é sucesso: {}", res.status());
        return Err(format!("Failed to fetch owned games: {}", res.status()));
    }
    println!("get_player_game_info: requisição bem-sucedida");

    let json: Result<serde_json::Value, _> = res.json().await;
    if json.is_err() {
        println!("get_player_game_info: erro parseando JSON da resposta: {:?}", json.as_ref().err());
        return Err(json.unwrap_err().to_string());
    }
    let json = json.unwrap();

    let games = match json["response"]["games"].as_array() {
        Some(games) => games,
        None => {
            println!("get_player_game_info: não encontrou array games na resposta");
            return Ok(vec![]);
        }
    };
    println!("get_player_game_info: número de jogos recebidos: {}", games.len());

    let mut result = Vec::new();

    for game in games {
        let appid = game["appid"].as_u64().unwrap_or(0) as u32;
        let name = game["name"].as_str().unwrap_or("").to_string();
        let playtime = game["playtime_forever"].as_u64().unwrap_or(0) as u32;

        println!("get_player_game_info: buscando conquistas para jogo {} - {}", appid, name);

        let ach_url = format!(
            "https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key={}&steamid={}&appid={}",
            api_key, steam_id, appid
        );

        let ach_res = client.get(&ach_url).send().await;

        let fully_achieved = match ach_res {
            Ok(resp) if resp.status().is_success() => {
                let ach_json = resp.json::<serde_json::Value>().await.unwrap_or_default();
                if let Some(achievements) = ach_json["playerstats"]["achievements"].as_array() {
                    achievements.iter().all(|a| a["achieved"].as_i64() == Some(1))
                } else {
                    false
                }
            }
            _ => {
                println!("get_player_game_info: falha ao buscar conquistas para jogo {}", appid);
                false
            }
        };

        result.push(Game {
            appid,
            name,
            playtime_minutes: playtime,
            fully_achieved,
        });
    }

    println!("get_player_game_info: finalizado com {} jogos", result.len());
    Ok(result)
}

#[tauri::command]
pub async fn sync_games_from_steam() -> Result<String, String> {
    println!("sync_games_from_steam: iniciando");
    let config = carregar_configuracoes()?;
    let api_key = config.api_key;
    let steam_id = config.steam_id;
    println!("sync_games_from_steam: configurações carregadas");

    let games = get_player_game_info(api_key, steam_id).await?;
    println!("sync_games_from_steam: jogos recebidos: {}", games.len());

    let sql_script = generate_insert_sql(&games);
    println!("sync_games_from_steam: script SQL gerado:\n{}", sql_script);

    let output = Command::new("npx")
        .current_dir("../")
        .args([
            "prisma",
            "db",
            "execute",
            "--script",
            &sql_script,
            "--url",
            "file:./prisma/database/db.sqlite",
        ])
        .output();

    if output.is_err() {
        println!("sync_games_from_steam: erro executando Prisma: {:?}", output.as_ref().err());
        return Err(format!("Erro executando Prisma: {}", output.unwrap_err()));
    }
    let output = output.unwrap();

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        println!("sync_games_from_steam: erro Prisma: {}", stderr);
        return Err(format!("Erro Prisma: {}", stderr));
    }

    println!("sync_games_from_steam: sincronização concluída com {} jogos", games.len());
    Ok(format!("{} jogos sincronizados", games.len()))
}

fn generate_insert_sql(games: &Vec<Game>) -> String {
    let mut sql = String::new();
    sql.push_str("DELETE FROM Game;\n");
    for game in games {
        sql.push_str(&format!(
            "INSERT INTO Game (appid, name, playtimeMinutes, fullyAchieved) VALUES ({}, '{}', {}, {});\n",
            game.appid,
            game.name.replace("'", "''"),
            game.playtime_minutes,
            if game.fully_achieved { 1 } else { 0 }
        ));
    }
    sql
}
