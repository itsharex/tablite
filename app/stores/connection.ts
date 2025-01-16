import { hash } from 'ohash'

interface Connection {
  url: string
}

interface Cursor {
  instance: Database
}

export const useConnectionStore = defineStore('connection', () => {
  const cursors = ref<Record<string, Cursor>>({})
  const connections = useTauriStorage<Connection[]>('connections', [], 'data.json')

  async function connect(url: string) {
    const db = await Database.load(unref(url))
    const id = findCnxOrCreate(url)
    if (cursors.value[id]?.instance)
      return id
    cursors.value[id] = { instance: db }
    return id
  }

  function findCnxOrCreate(url: string) {
    const id = hash(url)
    const exists = connections.value.find(e => e.url === url)
    if (exists?.url)
      return hash(url)
    connections.value.push({ url })
    return id
  }

  return {
    cursors,
    connections,
    connect,
  }
})
