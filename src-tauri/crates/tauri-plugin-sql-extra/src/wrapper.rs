use crate::{decode, Error};
use serde_json::Value as JsonValue;
use sqlx::{AnyPool, Column, Executor, MySql, Pool, Postgres, Row, Sqlite};
use std::collections::HashMap;

pub enum DbPool {
    Sqlite(Pool<Sqlite>),
    MySql(Pool<MySql>),
    Postgres(Pool<Postgres>),
    Any(AnyPool),
}

impl DbPool {
    pub(crate) async fn connect(conn_url: &str) -> Result<Self, Error> {
        match conn_url
            .split_once(':')
            .ok_or_else(|| Error::InvalidDbUrl(conn_url.to_string()))?
            .0
        {
            "sqlite" => Ok(Self::Sqlite(Pool::connect(conn_url).await?)),
            "mysql" => Ok(Self::MySql(Pool::connect(conn_url).await?)),
            "postgres" => Ok(Self::Postgres(Pool::connect(conn_url).await?)),
            "any" => Ok(Self::Any(Pool::connect(conn_url).await?)),
            _ => Err(Error::InvalidDbUrl(format!(
                "{conn_url} - No database driver enabled!"
            ))),
        }
    }

    pub(crate) async fn execute(&self, query: &str) -> Result<(), Error> {
        Ok(match self {
            DbPool::Sqlite(pool) => {
                pool.execute(query).await?;
            }
            DbPool::MySql(pool) => {
                pool.execute(query).await?;
            }
            DbPool::Postgres(pool) => {
                pool.execute(query).await?;
            }
            DbPool::Any(pool) => {
                pool.execute(query).await?;
            }
        })
    }

    pub(crate) async fn select(
        &self,
        query: &str,
        _values: Vec<JsonValue>,
    ) -> Result<Vec<HashMap<String, JsonValue>>, Error> {
        Ok(match self {
            DbPool::Sqlite(pool) => {
                let mut query = sqlx::query(query);
                for value in _values {
                    if value.is_null() {
                        query = query.bind(None::<JsonValue>);
                    } else if value.is_string() {
                        query = query.bind(value.as_str().unwrap().to_owned())
                    } else if let Some(number) = value.as_number() {
                        query = query.bind(number.as_f64().unwrap_or_default())
                    } else {
                        query = query.bind(value);
                    }
                }
                let rows = pool.fetch_all(query).await?;

                let mut values = Vec::new();

                for row in rows {
                    let mut value = HashMap::new();
                    for (i, column) in row.columns().iter().enumerate() {
                        let v = row.try_get_raw(i)?;
                        let v: JsonValue = decode::sqlite::to_json(v)?;
                        value.insert(column.name().to_string(), v);
                    }

                    values.push(value);
                }

                values
            }
            DbPool::MySql(pool) => {
                let mut query = sqlx::query(query);
                for value in _values {
                    if value.is_null() {
                        query = query.bind(None::<JsonValue>);
                    } else if value.is_string() {
                        query = query.bind(value.as_str().unwrap().to_owned())
                    } else if let Some(number) = value.as_number() {
                        query = query.bind(number.as_f64().unwrap_or_default())
                    } else {
                        query = query.bind(value);
                    }
                }
                let rows = pool.fetch_all(query).await?;

                let mut values = Vec::new();

                for row in rows {
                    let mut value = HashMap::new();
                    for (i, column) in row.columns().iter().enumerate() {
                        let v = row.try_get_raw(i)?;
                        let v: JsonValue = decode::mysql::to_json(v)?;
                        value.insert(column.name().to_string(), v);
                    }

                    values.push(value);
                }

                values
            }
            DbPool::Postgres(pool) => {
                let mut query = sqlx::query(query);
                for value in _values {
                    if value.is_null() {
                        query = query.bind(None::<JsonValue>);
                    } else if value.is_string() {
                        query = query.bind(value.as_str().unwrap().to_owned())
                    } else if let Some(number) = value.as_number() {
                        query = query.bind(number.as_f64().unwrap_or_default())
                    } else {
                        query = query.bind(value);
                    }
                }
                let rows = pool.fetch_all(query).await?;

                let mut values = Vec::new();

                for row in rows {
                    let mut value = HashMap::new();
                    for (i, column) in row.columns().iter().enumerate() {
                        let v = row.try_get_raw(i)?;
                        let v: JsonValue = decode::postgres::to_json(v)?;
                        value.insert(column.name().to_string(), v);
                    }

                    values.push(value);
                }

                values
            }
            DbPool::Any(pool) => {
                let mut query = sqlx::query(query);
                for value in _values {
                    if value.is_string() {
                        query = query.bind(value.as_str().unwrap().to_owned())
                    } else if let Some(number) = value.as_number() {
                        query = query.bind(number.as_f64().unwrap_or_default())
                    } else {
                        query = query.bind(value.as_str().unwrap().to_owned());
                    }
                }
                let rows = pool.fetch_all(query).await?;

                let mut values = Vec::new();

                for row in rows {
                    let mut value = HashMap::new();
                    for (i, column) in row.columns().iter().enumerate() {
                        let v = row.try_get_raw(i)?;
                        let v: JsonValue = decode::any::to_json(v)?;
                        value.insert(column.name().to_string(), v);
                    }

                    values.push(value);
                }

                values
            }
        })
    }

    pub(crate) async fn close(&self) {
        match self {
            DbPool::Sqlite(pool) => pool.close().await,
            DbPool::MySql(pool) => pool.close().await,
            DbPool::Postgres(pool) => pool.close().await,
            DbPool::Any(pool) => pool.close().await,
        }
    }
}
