use crate::Error;
use serde_json::Value as JsonValue;
use sqlx::{any::AnyValueRef, TypeInfo, Value, ValueRef};

pub fn to_json(v: AnyValueRef) -> Result<JsonValue, Error> {
    if v.is_null() {
        return Ok(JsonValue::Null);
    }

    let res = match v.type_info().name() {
        "CHAR" | "VARCHAR" | "TINYTEXT" | "TEXT" | "MEDIUMTEXT" | "LONGTEXT" | "ENUM" => {
            if let Ok(v) = ValueRef::to_owned(&v).try_decode() {
                JsonValue::String(v)
            } else {
                JsonValue::Null
            }
        }
        "FLOAT" | "REAL" => {
            if let Ok(v) = ValueRef::to_owned(&v).try_decode::<f32>() {
                JsonValue::from(v)
            } else {
                JsonValue::Null
            }
        }
        "DOUBLE" => {
            if let Ok(v) = ValueRef::to_owned(&v).try_decode::<f64>() {
                JsonValue::from(v)
            } else {
                JsonValue::Null
            }
        }
        "TINYINT" | "SMALLINT" | "INT" | "MEDIUMINT" | "BIGINT" => {
            if let Ok(v) = ValueRef::to_owned(&v).try_decode::<i64>() {
                JsonValue::Number(v.into())
            } else {
                JsonValue::Null
            }
        }
        "BOOLEAN" => {
            if let Ok(v) = ValueRef::to_owned(&v).try_decode() {
                JsonValue::Bool(v)
            } else {
                JsonValue::Null
            }
        }
        "DATE" | "TIME" | "DATETIME" | "TIMESTAMP" => {
            if let Ok(v) = ValueRef::to_owned(&v).try_decode() {
                JsonValue::String(v)
            } else {
                JsonValue::Null
            }
        }
        "TINIYBLOB" | "MEDIUMBLOB" | "BLOB" | "LONGBLOB" => {
            if let Ok(v) = ValueRef::to_owned(&v).try_decode::<Vec<u8>>() {
                JsonValue::Array(v.into_iter().map(|n| JsonValue::Number(n.into())).collect())
            } else {
                JsonValue::Null
            }
        }
        "NULL" => JsonValue::Null,
        _ => return Err(Error::UnsupportedDatatype(v.type_info().name().to_string())),
    };

    Ok(res)
}
