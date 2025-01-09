import type Database from '@tauri-apps/plugin-sql'

export function useQuery(cursorInstance: MaybeRef<Database | undefined> | undefined) {
  const name = ref('')
  const code = ref('')
  const cursor = computed(() => unref(cursorInstance))
  const data = ref<any>()
  const error = ref()
  const isLoading = ref(false)

  async function execute() {
    if (!code.value)
      return

    try {
      if (!cursor.value)
        return
      isLoading.value = true
      data.value = await cursor.value.execute(code.value)
    }
    catch (e) {
      error.value = e
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    name,
    code,
    data,
    error,
    isLoading,
    execute,
  }
}
