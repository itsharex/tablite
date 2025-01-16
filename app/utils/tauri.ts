import { invoke } from '@tauri-apps/api/core'

export class Database {
  static async load(path: string) {
    return await invoke('plugin:sql-extra|load', { db: path })
  }

  execute() {}

  select() {}

  close() {}
}
