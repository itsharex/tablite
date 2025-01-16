mod commands;
mod error;

pub use error::Error;

use sqlx::AnyPool;
use std::collections::HashMap;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, RunEvent, Runtime};
use tokio::sync::RwLock;

#[derive(Default)]
pub struct DbInstances(pub RwLock<HashMap<String, AnyPool>>);

fn run_async_command<F: std::future::Future>(cmd: F) -> F::Output {
    if tokio::runtime::Handle::try_current().is_ok() {
        tokio::task::block_in_place(|| tokio::runtime::Handle::current().block_on(cmd))
    } else {
        tauri::async_runtime::block_on(cmd)
    }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("sql-extra")
        .invoke_handler(tauri::generate_handler![
            commands::load,
            commands::execute,
            commands::select,
            commands::close
        ])
        .setup(|app, _| {
            run_async_command(async move {
                let instances = DbInstances::default();
                let lock = instances.0.write().await;
                drop(lock);

                app.manage(instances);

                Ok(())
            })
        })
        .on_event(|app, event| {
            if let RunEvent::Exit = event {
                run_async_command(async move {
                    let instances = &*app.state::<DbInstances>();
                    let instances = instances.0.read().await;
                    for value in instances.values() {
                        value.close().await;
                    }
                });
            }
        })
        .build()
}
