import type Database from '@tauri-apps/plugin-sql'

interface UseTablesOptions {
  backend: MaybeRef<string | undefined>
}

const SQL: Record<string, Record<string, string>> = {
  ShowTables: {
    mysql: 'SHOW TABLES;',
  },
}

export function useTables(db: MaybeRef<Database | undefined>, options: UseTablesOptions) {
  const tables = ref<string[]>([])
  const isReady = computed(() => !!unref(db))

  watchOnce(isReady, async (value) => {
    if (!value)
      return
    const backend = unref(options.backend) ?? 'mysql'
    const sql = SQL.ShowTables![backend]!
    const data: Record<string, string>[] = await unref(db)!.select(sql)
    tables.value = data.map(item => Object.values(item)[0] as string)
  })

  return tables
}
