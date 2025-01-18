export interface Query {
  title: string
  content: string
  createdAt?: number
  updatedAt?: number
}

function startsWithIgnoreCase(source: string | undefined, value: string | string[]) {
  if (!source)
    return false

  const targets = Array.isArray(value) ? value : [value]
  const src = source.toUpperCase()
  for (const v of targets) {
    const r = src.startsWith(v)
    if (r)
      return true
  }

  return false
}

function parseQueryContent(value?: string) {
  if (!value)
    return ''

  try {
    return atob(value)
  }
  catch {
    return ''
  }
}

export function useQuery(cursorInstance: MaybeRef<Database | undefined> | undefined, initialValue: MaybeRef<Query>) {
  const title = ref(unref(initialValue)?.title ?? '')
  const code = ref(parseQueryContent(unref(initialValue).content))
  const cursor = computed(() => unref(cursorInstance))
  const timeToExecute = ref(0)
  const data = ref<any>()
  const error = ref()
  const isLoading = ref(false)
  const limit = ref(50)

  watch(initialValue, (value) => {
    const v = unref(value)
    title.value = v.title ?? ''
    code.value = parseQueryContent(v.content)
  })

  const sql = computed(() => code.value.split(';').map(e => e.trim()).filter(Boolean).at(-1))
  const isSelect = computed(() => startsWithIgnoreCase(sql.value, ['SELECT', 'DESCRIBE', 'PRAGMA', 'SHOW']))
  const operation = computed(() => isSelect.value ? 'select' : 'execute')

  function queryLimiter(sql: string) {
    if (sql.toUpperCase().includes('SELECT')) {
      if (sql.toUpperCase().includes('LIMIT'))
        return sql
      return [sql, 'LIMIT', limit.value].join(' ')
    }
    return sql
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
    title,
    code,
    data,
    error,
    limit,
    timeToExecute,
    isSelect,
    isLoading,
    execute,
  }
}
