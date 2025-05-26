mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::salvar_configuracoes,
            commands::carregar_configuracoes,
            commands::get_player_game_info,
            commands::sync_games_from_steam,
            commands::get_all_games,
            commands::search_games_by_name,
            commands::side_games,
            commands::get_game_details,
            commands::mark_game_as_finished,
            commands::unmark_game_as_finished,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
