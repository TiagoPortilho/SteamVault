mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::ler_steam_dir,
            commands::salvar_configuracoes,
            commands::carregar_configuracoes
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
