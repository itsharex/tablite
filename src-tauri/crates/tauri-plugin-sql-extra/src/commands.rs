use tauri::command;

#[command]
pub async fn load(db: String) -> Result<String, String> {
    Ok(db)
}

#[command]
pub async fn execute(db: String) -> Result<String, String> {
    Ok(db)
}

#[command]
pub async fn select(db: String) -> Result<String, String> {
    Ok(db)
}

#[command]
pub async fn close(db: String) -> Result<String, String> {
    Ok(db)
}
