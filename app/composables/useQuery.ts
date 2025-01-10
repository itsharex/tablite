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
  const timeToExecute = ref(0)
  const data = ref<any>()
  const error = ref()
  const isLoading = ref(false)

  const sql = computed(() => code.value.trim().split(';').filter(Boolean).at(-1))
  const isSelect = computed(() => startsWithIgnoreCase(sql.value, 'SELECT'))
  const operation = computed(() => isSelect.value ? 'select' : 'execute')

  function queryLimiter(sql: string) {
    if (sql.toUpperCase().includes('LIMIT'))
      return sql
    return [sql, 'LIMIT', 50].join(' ')
  }

  async function execute() {
    if (!code.value)
      return

    try {
      if (!cursor.value || !sql.value)
        return
      isLoading.value = true
      const start = performance.now()
      data.value = await cursor.value[operation.value](queryLimiter(sql.value))
      timeToExecute.value = Math.trunc(performance.now() - start)
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
    timeToExecute,
    isSelect,
    isLoading,
    execute,
  }
}
