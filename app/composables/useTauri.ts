import { load } from '@tauri-apps/plugin-store'

interface Connection {
  url: string
}

export function useTauriStore() {
  const connections = ref<Connection[]>([])

  async function read() {
    const file = await load('store.json')
    const store = await Promise.all([
      file.get<Connection[]>('connections'),
    ])

    connections.value = store[0] ?? []
  }

  read()

  return {
    connections,
  }
}
