const SQL: Record<string, Record<string, string>> = {
  ShowTables: {
    mysql: 'SHOW TABLES;',
  },
}

export function useTables(value: MaybeRef<string>) {
  const store = storeToRefs(useConnectionStore())
  const url = computed(() => unref(value))
  const db = computed(() => store.cursors.value[url.value]?.interface)
  const tables = ref<string[]>([])
  const isReady = computed(() => !!unref(db))

  const backend = computed(() => {
    if (url.value.startsWith('mysql'))
      return 'mysql'
    if (url.value.startsWith('postgres'))
      return 'postgres'
    return 'mysql'
  })

  watchOnce(isReady, async (value) => {
    if (!value)
      return
    const sql = SQL.ShowTables![backend.value]!
    const data: Record<string, string>[] = await unref(db)!.select(sql)
    tables.value = data.map(item => Object.values(item)[0] as string)
  })

  return tables
}
