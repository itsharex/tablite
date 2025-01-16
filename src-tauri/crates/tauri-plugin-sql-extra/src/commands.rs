use crate::{DbInstances, DbPool, Error};
use serde_json::Value as JsonValue;
use std::collections::HashMap;
use tauri::{command, State};

#[command]
pub async fn load(db_instances: State<'_, DbInstances>, db: String) -> Result<String, Error> {
    let pool = DbPool::connect(&db).await?;
    db_instances.0.write().await.insert(db.clone(), pool);
    Ok(db)
}

#[command]
pub async fn execute(
    db_instances: State<'_, DbInstances>,
    db: String,
    query: String,
) -> Result<&str, Error> {
    let instances = db_instances.0.read().await;
    let db = instances.get(&db).ok_or(Error::DatabaseNotLoaded(db))?;
    let _ = db.execute(query.as_str()).await?;
    Ok("Ok")
}

#[command]
pub async fn select(
    db_instances: State<'_, DbInstances>,
    db: String,
    query: String,
) -> Result<Vec<HashMap<String, JsonValue>>, Error> {
    let instances = db_instances.0.read().await;

    let pool = instances.get(&db).ok_or(Error::DatabaseNotLoaded(db))?;
    pool.select(&query).await
}

#[command]
pub async fn close(
    db_instances: State<'_, DbInstances>,
    db: Option<String>,
) -> Result<bool, Error> {
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
