import { hash } from 'ohash'

export interface Connection {
  url: string
  alias?: string
  tags?: string[]
}

interface Cursor {
  instance: Database
}

export const useConnectionStore = defineStore('connection', () => {
  const isLoading = ref(false)
  const cursors = ref<Record<string, Cursor>>({})
  const connections = useTauriStorage<Connection[]>('connections', [], 'data.json')

  async function connect(url: string) {
    isLoading.value = true

    try {
      const db = await Database.load(unref(url))
      const id = findCnxOrCreate(url)

      if (cursors.value[id]?.instance)
        return id
      cursors.value[id] = { instance: db }
      return id
    }
    finally {
      isLoading.value = false
    }
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
    isLoading,
    connect,
  }
})
