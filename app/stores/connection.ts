import Database from '@tauri-apps/plugin-sql'
import { v4 as uuid } from 'uuid'

interface Connection {
  id: string
  url: string
}

interface Cursor {
  instance: Database
  url: string
}

export const useConnectionStore = defineStore('connection', () => {
  const cursors = ref<Record<string, Cursor>>({})
  const connections = useTauriStorage<Connection[]>('connections', [])

  async function connect(url: string) {
    const db = await Database.load(unref(url))
    const id = findCnxOrCreate(url)
    if (cursors.value[id]?.instance)
      return id
    cursors.value[id] = { instance: db, url }
    return id
  }

  function findCnxOrCreate(url: string) {
    const id = uuid()
    const exists = connections.value.find(e => e.url === url)
    if (exists?.id)
      return exists.id
    connections.value.push({ id, url })
    return id
  }

  return {
    cursors,
    connections,
    connect,
  }
})
