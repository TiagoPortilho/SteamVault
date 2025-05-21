mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::salvar_configuracoes,
            commands::carregar_configuracoes,
            commands::get_player_game_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
