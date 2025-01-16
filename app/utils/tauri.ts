import { invoke } from '@tauri-apps/api/core'

export class Database {
  path: string

  constructor(path: string) {
    this.path = path
  }

  static async load(path: string) {
    const _path = await invoke<string>('plugin:sql-extra|load', {
      db: path,
    })

    return new Database(_path)
  }

  execute() {}

  async select<T>(query: string) {
    const result = await invoke<T>('plugin:sql-extra|select', {
      db: this.path,
      query,
    })

    return result
  }

  close() {}
}
