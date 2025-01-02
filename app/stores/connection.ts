import Database from '@tauri-apps/plugin-sql'
import { v4 as uuid } from 'uuid'

interface Connection {
  id: string
  url: string
}

interface Cursor {
  interface: Database
}

export const useConnectionStore = defineStore('connection', () => {
  const cursors = ref<Record<string, Cursor>>({})
  const connections = useTauriStorage<Connection[]>('connections', [])

  async function connect(url: string) {
    const db = await Database.load(unref(url))
    const id = findOrCreateCnx(url)
    cursors.value[id] = { interface: db }
    return id
  }

  function findOrCreateCnx(url: string) {
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
