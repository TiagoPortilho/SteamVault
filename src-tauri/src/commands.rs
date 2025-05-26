use std::fs;
use serde::{Serialize, Deserialize};
use tauri::api::path::app_config_dir;
use reqwest;
use sqlx::{SqlitePool, Result as SqlxResult};
use sqlx::FromRow;

#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Game {
    pub appid: i32,
    pub name: String,
    pub playtime_minutes: i32,
    pub fully_achieved: bool,
    pub trophies: Option<String>,
    pub finished: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    pub api_key: String,
    pub steam_id: String,
}

#[tauri::command]
pub fn carregar_configuracoes() -> Result<Config, String> {
    let config_dir = app_config_dir(&tauri::Config::default())
        .ok_or("Não foi possível encontrar o diretório de configuração".to_string())?;
    let config_path = config_dir.join("steamvault_config.json");
    let data = fs::read_to_string(&config_path)
        .map_err(|e| format!("Erro lendo arquivo config: {}", e))?;
    let config = serde_json::from_str(&data)
        .map_err(|e| format!("Erro parseando JSON: {}", e))?;
    Ok(config)
}

#[tauri::command]
pub fn salvar_configuracoes(api_key: String, steam_id: String) -> Result<(), String> {
    let config = Config { api_key, steam_id };
    let config_dir = app_config_dir(&tauri::Config::default())
        .ok_or("Não foi possível encontrar o diretório de configuração".to_string())?;
    let config_path = config_dir.join("steamvault_config.json");

    if let Some(parent) = config_path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Erro criando diretório: {}", e))?;
    }

    let json = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Erro serializando config: {}", e))?;

    fs::write(&config_path, json).map_err(|e| format!("Erro escrevendo arquivo: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn get_player_game_info(api_key: String, steam_id: String) -> Result<Vec<Game>, String> {
    let url = format!(
        "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key={}&steamid={}&include_appinfo=1&include_played_free_games=1",
        api_key, steam_id
    );

    let client = reqwest::Client::new();
    let res = client.get(&url).send().await.map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        return Err(format!("Failed to fetch owned games: {}", res.status()));
    }

    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    let games = json["response"]["games"]
        .as_array()
        .ok_or_else(|| "Não encontrou array games na resposta".to_string())?;

    let mut result = Vec::new();

    for game in games {
        let appid = game["appid"].as_u64().unwrap_or(0) as i32;
        let name = game["name"].as_str().unwrap_or("").to_string();
        let playtime = game["playtime_forever"].as_u64().unwrap_or(0) as i32;

        let ach_url = format!(
            "https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key={}&steamid={}&appid={}",
            api_key, steam_id, appid
        );

        let ach_res = client.get(&ach_url).send().await;

        let (fully_achieved, trophies_string) = match ach_res {
            Ok(resp) if resp.status().is_success() => {
                let ach_json = resp.json::<serde_json::Value>().await.unwrap_or_default();
                if let Some(achievements) = ach_json["playerstats"]["achievements"].as_array() {
                    let total = achievements.len();
                    let achieved = achievements.iter().filter(|a| a["achieved"].as_i64() == Some(1)).count();

                    let all_achieved = achieved == total && total > 0;
                    let trophies_str = format!("{}/{}", achieved, total);

                    (all_achieved, Some(trophies_str))
                } else {
                    (false, None)
                }
            }
            _ => (false, None),
        };

        result.push(Game {
            appid,
            name,
            playtime_minutes: playtime,
            fully_achieved,
            trophies: trophies_string,
            finished: None, 
        });
    }

    Ok(result)
}

#[tauri::command]
pub async fn sync_games_from_steam() -> Result<String, String> {
    let config = carregar_configuracoes()?;
    let api_key = config.api_key;
    let steam_id = config.steam_id;

    let games = get_player_game_info(api_key, steam_id).await?;

    let pool = connect_db().await.map_err(|e| e.to_string())?;

    sync_games(&pool, games).await.map_err(|e| e.to_string())?;

    Ok("Jogos sincronizados com sucesso".to_string())
}

pub async fn connect_db() -> SqlxResult<SqlitePool> {
    SqlitePool::connect("sqlite:../prisma/database/db.sqlite").await
}

pub async fn sync_games(pool: &SqlitePool, games: Vec<Game>) -> SqlxResult<()> {
    // Limpa a tabela antes
    sqlx::query("DELETE FROM Game").execute(pool).await?;

    for game in games {
        sqlx::query(
            r#"
            INSERT INTO Game (appid, name, playtime_minutes, fully_achieved, trophies, finished)
            VALUES (?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(game.appid)
        .bind(game.name)
        .bind(game.playtime_minutes)
        .bind(game.fully_achieved as i32)
        .bind(game.trophies.clone())
        .bind(game.finished)
        .execute(pool)
        .await?;
    }

    Ok(())
}

#[tauri::command]
pub async fn get_all_games() -> Result<Vec<Game>, String> {
    let pool = connect_db().await.map_err(|e| e.to_string())?;

    let games = sqlx::query_as::<_, Game>(
        "SELECT appid, name, playtime_minutes, fully_achieved, trophies, finished FROM Game ORDER BY playtime_minutes DESC"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(games)
}

#[tauri::command]
pub async fn search_games_by_name(search: String) -> Result<Vec<Game>, String> {
    let pool = connect_db().await.map_err(|e| e.to_string())?;
    let game_name = format!("%{}%", search);

    let games = sqlx::query_as::<_, Game>(
        "SELECT appid, name, playtime_minutes, fully_achieved, trophies, finished FROM Game WHERE name LIKE ? ORDER BY playtime_minutes DESC"
    )
    .bind(game_name)
    .fetch_all(&pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(games)
}

#[tauri::command]
pub async fn side_games() -> Result<Vec<Game>, String> {
    let pool = connect_db().await.map_err(|e| e.to_string())?;

    let games = sqlx::query_as::<_, Game>(
        "SELECT appid, name, playtime_minutes, fully_achieved, trophies, finished FROM Game ORDER BY name ASC"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(games)
}

#[tauri::command]
pub async fn get_game_details(appid: i32) -> Result<Game, String> {
    let pool = connect_db().await.map_err(|e| e.to_string())?;

    let game = sqlx::query_as::<_, Game>(
        "SELECT appid, name, playtime_minutes, fully_achieved, trophies, finished FROM Game WHERE appid = ?"
    )
    .bind(appid)
    .fetch_one(&pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(game)
}

#[tauri::command]
pub async fn mark_game_as_finished(appid: u32) -> Result<(), String> {
    let pool = connect_db().await.map_err(|e| e.to_string())?;

    sqlx::query(
        "UPDATE Game SET finished = 1 WHERE appid = ?"
    )
    .bind(appid)
    .execute(&pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn unmark_game_as_finished(appid: u32) -> Result<(), String> {
    let pool = connect_db().await.map_err(|e| e.to_string())?;

    sqlx::query(
        "UPDATE Game SET finished = 0 WHERE appid = ?"
    )
    .bind(appid)
    .execute(&pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}



