import type Database from '@tauri-apps/plugin-sql'

function startsWithIgnoreCase(source: string | undefined, value: string) {
  if (!source)
    return false
  return source.toUpperCase().startsWith(value.toUpperCase())
}

export function useQuery(cursorInstance: MaybeRef<Database | undefined> | undefined) {
  const name = ref('')
  const code = ref('')
  const cursor = computed(() => unref(cursorInstance))
  const data = ref<any>()
  const error = ref()
  const isLoading = ref(false)

  const sql = computed(() => code.value.trim().split(';').filter(Boolean).at(-1))
  const isSelect = computed(() => startsWithIgnoreCase(sql.value, 'SELECT'))
  const operation = computed(() => isSelect.value ? 'select' : 'execute')

  async function execute() {
    if (!code.value)
      return

    try {
      if (!cursor.value || !sql.value)
        return
      isLoading.value = true
      data.value = await cursor.value[operation.value](sql.value)
      error.value = undefined
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
    isSelect,
    isLoading,
    execute,
  }
}
