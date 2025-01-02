import Database from '@tauri-apps/plugin-sql'

export function useConnection() {
  const url = ref('')
  const db = ref<Database>()
  const isPending = ref(false)

  const isInvalidate = computed(() => !url.value)

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

  return {
    db,
    url,
    isInvalidate,
    isPending,
    connect,
    close,
  }
}
