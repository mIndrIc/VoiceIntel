// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

// Tauri command to get recording status
#[tauri::command]
fn get_app_info() -> String {
    "VoiceIntel v0.1.0".to_string()
}

// Command to trigger recording from hotkey
#[tauri::command]
fn trigger_recording(window: tauri::Window) {
    window.emit("start-recording", ()).unwrap();
}

// Command to copy text to clipboard
#[tauri::command]
async fn copy_to_clipboard(app: tauri::AppHandle, text: String) -> Result<(), String> {
    use tauri_plugin_clipboard_manager::ClipboardExt;
    app.clipboard()
        .write_text(text)
        .map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .setup(|app| {
            // Register global shortcut (Ctrl+Shift+V)
            #[cfg(desktop)]
            {
                use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};
                
                let shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyV);
                let app_handle = app.handle().clone();
                
                app.global_shortcut().on_shortcut(shortcut, move |_app, _shortcut, _event| {
                    if let Some(window) = app_handle.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                        let _ = window.emit("start-recording", ());
                    }
                })?;
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_app_info,
            trigger_recording,
            copy_to_clipboard
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
