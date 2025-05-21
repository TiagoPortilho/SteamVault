use tauri::api::dialog::FileDialogBuilder;
use std::fs;
use serde::{Serialize, Deserialize};
use tauri::api::path::app_config_dir;

/// Comando para selecionar o diretório da Steam
#[tauri::command]
pub fn ler_steam_dir() -> Option<String> {
    let (tx, rx) = std::sync::mpsc::channel();

    FileDialogBuilder::new()
        .set_title("Select Steam folder")
        .pick_folder(move |folder_path| {
            if let Some(path) = folder_path {
                tx.send(path.display().to_string()).ok();
            }
        });

    rx.recv().ok()
}

/// Estrutura de configuração
#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    pub api_key: String,
    pub steam_id: String,
}

/// Salva as configurações no arquivo JSON
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
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let json = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(&config_path, json).map_err(|e| e.to_string())?;

    Ok(())
}

/// Carrega as configurações do arquivo JSON
#[tauri::command]
pub fn carregar_configuracoes() -> Result<Config, String> {
    let config_dir = app_config_dir(&tauri::Config::default())
        .ok_or("Não foi possível encontrar o diretório de configuração")?;
    let config_path = config_dir.join("steamvault_config.json");

    if config_path.exists() {
        let data = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
        let config: Config = serde_json::from_str(&data).map_err(|e| e.to_string())?;
        Ok(config)
    } else {
        Err("Arquivo de configuração não encontrado".to_string())
    }
}
