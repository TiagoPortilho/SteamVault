// commands.rs
use tauri::api::dialog::FileDialogBuilder;

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