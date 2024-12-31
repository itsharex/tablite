import Database from '@tauri-apps/plugin-sql'

export function useDatabase(url: MaybeRef<string>) {
  const db = ref<Database>()
  const isPending = ref(false)

  const backend = computed(() => {
    const [protocol] = unref(url).split('://')
    return protocol
  })

  async function connect() {
    isPending.value = true
    const value = await Database.load(unref(url))
    isPending.value = false
    db.value = value
    return value
  }

  async function close() {
    await db.value?.close()
  }

  connect()

  return {
    db,
    backend,
    isPending,
    connect,
    close,
  }
}
