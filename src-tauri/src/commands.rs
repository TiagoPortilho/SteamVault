use std::fs;
use serde::{Serialize, Deserialize};
use tauri::api::path::app_config_dir;
use reqwest;
use sqlx::{SqlitePool, Result as SqlxResult};

#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    pub api_key: String,
    pub steam_id: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Game {
    pub appid: u32,
    pub name: String,
    pub playtime_minutes: u32,
    pub fully_achieved: bool,
}

#[tauri::command]
pub fn carregar_configuracoes() -> Result<Config, String> {
    println!("Iniciando carregamento de configurações...");
    let config_dir = app_config_dir(&tauri::Config::default())
        .ok_or("Não foi possível encontrar o diretório de configuração".to_string())?;
    println!("Diretório de config encontrado: {:?}", config_dir);

    let config_path = config_dir.join("steamvault_config.json");
    println!("Caminho completo do arquivo de config: {:?}", config_path);

    let data = fs::read_to_string(&config_path)
        .map_err(|e| {
            println!("Erro ao ler arquivo de config: {}", e);
            format!("Erro lendo arquivo config: {}", e)
        })?;

    println!("Arquivo de config lido com sucesso.");

    let config = serde_json::from_str(&data)
        .map_err(|e| {
            println!("Erro ao parsear JSON do config: {}", e);
            format!("Erro parseando JSON: {}", e)
        })?;

    println!("Configurações carregadas: {:?}", config);

    Ok(config)
}

#[tauri::command]
pub fn salvar_configuracoes(api_key: String, steam_id: String) -> Result<(), String> {
    println!("Salvando configurações...");
    let config = Config { api_key, steam_id };

    let config_dir = app_config_dir(&tauri::Config::default())
        .ok_or("Não foi possível encontrar o diretório de configuração".to_string())?;
    println!("Diretório de config para salvar: {:?}", config_dir);

    let config_path = config_dir.join("steamvault_config.json");
    println!("Caminho do arquivo config para salvar: {:?}", config_path);

    if let Some(parent) = config_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| {
                println!("Erro criando diretório: {}", e);
                format!("Erro criando diretório: {}", e)
            })?;
    }

    let json = serde_json::to_string_pretty(&config)
        .map_err(|e| {
            println!("Erro serializando config: {}", e);
            format!("Erro serializando config: {}", e)
        })?;

    fs::write(&config_path, json)
        .map_err(|e| {
            println!("Erro escrevendo arquivo: {}", e);
            format!("Erro escrevendo arquivo: {}", e)
        })?;

    println!("Configurações salvas com sucesso.");

    Ok(())
}

#[tauri::command]
pub async fn get_player_game_info(api_key: String, steam_id: String) -> Result<Vec<Game>, String> {
    println!("Buscando jogos do player via API Steam...");
    let url = format!(
        "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key={}&steamid={}&include_appinfo=1&include_played_free_games=1",
        api_key, steam_id
    );
    println!("URL da requisição: {}", url);

    let client = reqwest::Client::new();
    let res = client.get(&url).send().await
        .map_err(|e| {
            println!("Erro ao fazer requisição: {}", e);
            e.to_string()
        })?;

    println!("Status da resposta: {}", res.status());
    if !res.status().is_success() {
        return Err(format!("Failed to fetch owned games: {}", res.status()));
    }

    let json: serde_json::Value = res.json().await
        .map_err(|e| {
            println!("Erro ao parsear JSON da resposta: {}", e);
            e.to_string()
        })?;

    let games = json["response"]["games"]
        .as_array()
        .ok_or_else(|| {
            let err = "Não encontrou array games na resposta".to_string();
            println!("{}", err);
            err
        })?;

    println!("Número de jogos encontrados: {}", games.len());

    let mut result = Vec::new();

    for game in games {
        let appid = game["appid"].as_u64().unwrap_or(0) as u32;
        let name = game["name"].as_str().unwrap_or("").to_string();
        let playtime = game["playtime_forever"].as_u64().unwrap_or(0) as u32;

        println!("Processando jogo: {} (appid: {})", name, appid);

        let ach_url = format!(
            "https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key={}&steamid={}&appid={}",
            api_key, steam_id, appid
        );

        let ach_res = client.get(&ach_url).send().await;

        let fully_achieved = match ach_res {
            Ok(resp) if resp.status().is_success() => {
                let ach_json = resp.json::<serde_json::Value>().await.unwrap_or_default();
                if let Some(achievements) = ach_json["playerstats"]["achievements"].as_array() {
                    let all_achieved = achievements.iter().all(|a| a["achieved"].as_i64() == Some(1));
                    println!("Todas conquistas obtidas para {}? {}", name, all_achieved);
                    all_achieved
                } else {
                    println!("Sem achievements encontrados para o jogo {}", name);
                    false
                }
            }
            Err(e) => {
                println!("Erro ao obter achievements para {}: {}", name, e);
                false
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

    println!("Busca de jogos concluída, total: {}", result.len());
    Ok(result)
}

#[tauri::command]
pub async fn sync_games_from_steam() -> Result<String, String> {
    println!("Iniciando sincronização de jogos com Steam...");
    let config = carregar_configuracoes()?;
    println!("Configurações carregadas: {:?}", config);

    let api_key = config.api_key;
    let steam_id = config.steam_id;

    let games = get_player_game_info(api_key, steam_id).await?;
    println!("Jogos obtidos para sincronização: {}", games.len());

    let pool = connect_db().await.map_err(|e| {
        println!("Erro conectando ao banco de dados: {}", e);
        e.to_string()
    })?;

    sync_games(&pool, games).await.map_err(|e| {
        println!("Erro sincronizando jogos no banco: {}", e);
        e.to_string()
    })?;

    println!("Sincronização concluída com sucesso.");
    Ok("Jogos sincronizados com sucesso".to_string())
}

pub async fn connect_db() -> SqlxResult<SqlitePool> {
    println!("Conectando ao banco de dados SQLite...");
    let pool = SqlitePool::connect("sqlite:../prisma/database/db.sqlite").await?;
    println!("Conectado ao banco de dados com sucesso.");
    Ok(pool)
}

pub async fn sync_games(pool: &SqlitePool, games: Vec<Game>) -> SqlxResult<()> {
    println!("Sincronizando jogos no banco de dados...");

    sqlx::query("DELETE FROM Game").execute(pool).await?;
    println!("Tabela Game limpa.");

    for game in games {
        println!("Inserindo jogo: {} (appid: {})", game.name, game.appid);
        sqlx::query(
            r#"
            INSERT INTO Game (appid, name, playtimeMinutes, fullyAchieved)
            VALUES (?, ?, ?, ?)
            "#,
        )
        .bind(game.appid)
        .bind(game.name)
        .bind(game.playtime_minutes)
        .bind(game.fully_achieved as i32)
        .execute(pool)
        .await?;
    }

    println!("Todos os jogos foram inseridos no banco de dados.");
    Ok(())
}
