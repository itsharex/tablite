use tauri::{command, State};
use crate::{DbInstances, Error};

#[command]
pub async fn load(db_instances: State<'_, DbInstances>, db: String) -> Result<String, Error> {
    let pool = sqlx::AnyPool::connect(&db).await?;
    db_instances.0.write().await.insert(db.clone(), pool);
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
pub async fn close(db_instances: State<'_, DbInstances>, db: Option<String>) -> Result<bool, Error> {
    let instances = db_instances.0.read().await;

    let pools = if let Some(db) = db {
        vec![db]
    } else {
        instances.keys().cloned().collect()
    };

    for pool in pools {
        let db = instances.get(&pool).ok_or(Error::DatabaseNotLoaded(pool))?;
        db.close().await;
    }

    Ok(true)
}
