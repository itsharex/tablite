interface MysqlStructure {
  Field: string
  Type: string
}

interface SqliteStructure {
  name: string
  type: string
}

export interface Structure {
  columnName: string
  dataType: string
}

interface MysqlSchema {
  TABLE_CATALOG: string
  TABLE_SCHEMA: string
  TABLE_NAME: string
  TABLE_TYPE: string
  ENGINE: string
  VERSION: number
  TABLE_ROWS: number
  TABLE_COMMENT: string
  TABLE_COLLATION: string
}

type QueryStructureResults = MysqlStructure[] | SqliteStructure[]
type QuerySchemaResults = MysqlSchema

type QueryStatisticsResults = {
  is_unique: 'TRUE' | 'FALSE'
  column_name: string
}[]

function normalizeStructure(value: QueryStructureResults): Structure[] {
  return value.map((item: any) => ({
    columnName: item.Field ?? item.name,
    dataType: item.Type ?? item.type,
  }))
}

function normalizeSchema(value: QuerySchemaResults) {
  return {
    tableCatalog: value.TABLE_CATALOG,
    tableSchema: value.TABLE_SCHEMA,
    tableType: value.TABLE_TYPE,
    tableCollation: value.TABLE_COLLATION,
  }
}

function useCursorBackend(cursor: ComputedRef<Database | undefined>) {
  return computed(() => cursor.value?.path.split(':')[0] ?? 'mysql')
}

function parseConnectionURL(value: string) {
  if (value.startsWith('mysql')) {
    const matches = value.match(ConnectionPattern.MYSQL) ?? []
    const [_, username, password, host, port, database, queries] = matches
    return { username, password, host, port, database: database ?? '', queries }
  }

  if (value.startsWith('sqlite')) {
    const database = new URL(value).pathname.split('/').filter(Boolean)[0] ?? ''
    return { database }
  }

  return { database: '' }
}

export function useTable(tableName: MaybeRef<string>, cursorInstance: MaybeRef<Database | undefined> | undefined) {
  const table = computed(() => unref(tableName))
  const cursor = computed(() => unref(cursorInstance))
  const limit = ref(300)
  const offset = ref(0)
  const count = ref(0)
  const data = ref<any[]>([])
  const structure = ref<Structure[]>([])
  const schema = ref<Partial<ReturnType<typeof normalizeSchema>>>({})
  const isLoading = ref([false, false])
  const primaryKeys = ref<string[]>([])
  const backend = useCursorBackend(cursor)
  const where = ref('')

  async function queryTableSchema(value: string) {
    if (backend.value === 'mysql')
      return cursor.value?.select<any>(`SELECT * FROM information_schema.tables WHERE TABLE_NAME = '${value}';`)
    return [{ TABLE_TYPE: backend.value }]
  }

  async function setup() {
    try {
      if (table.value && cursor.value) {
        isLoading.value[0] = true
        const { database } = parseConnectionURL(cursor.value.path)
        const results = await Promise.all([
          cursor.value?.select<QueryStructureResults>(Sql.DESCRIBE_TABLE(table.value)[backend.value]!),
          cursor.value?.select<{ count: number }[]>(`SELECT COUNT(*) as count FROM \`${table.value}\`;`),
          queryTableSchema(table.value),
          cursor.value?.select<QueryStatisticsResults>(Sql.QUERY_UNIQUE_COLUMNS(database, table.value)[backend.value]!),
        ])
        structure.value = normalizeStructure(results[0] ?? [])
        count.value = results[1]?.[0]?.count ?? 0
        schema.value = normalizeSchema(results[2]?.[0])
        primaryKeys.value = results[3].filter(({ is_unique }) => is_unique === 'TRUE').map(({ column_name }) => column_name) ?? []
      }
    }
    finally {
      isLoading.value[0] = false
    }
  }

  async function execute() {
    if (table.value && cursor.value) {
      try {
        isLoading.value[1] = true
        data.value = await cursor.value?.select<any[]>(`SELECT * FROM \`${table.value}\` ${where.value} LIMIT ${limit.value} OFFSET ${offset.value};`) ?? []
      }
      catch {
        data.value = []
      }
      finally {
        isLoading.value[1] = false
      }
    }
  }

  return {
    data,
    schema,
    structure,
    limit,
    offset,
    count,
    primaryKeys,
    backend,
    where,
    isLoading: computed(() => isLoading.value.some(Boolean)),
    setup,
    execute,
  }
}

export function useTables(cursorInstance: MaybeRef<Database | undefined> | undefined, options: { immediate?: boolean } = { immediate: true }) {
  const cursor = computed(() => unref(cursorInstance))
  const tables = ref<string[]>([])
  const isLoading = ref(false)
  const isReady = computed(() => !!cursor.value)
  const backend = useCursorBackend(cursor)

  async function execute() {
    try {
      isLoading.value = true
      const sql = Sql.SHOW_TABLES()[backend.value]!
      const data: Record<string, string>[] = await cursor.value?.select(sql) ?? []

      if (backend.value === 'mysql')
        tables.value = data.map(item => Object.values(item)[0] as string)
      if (backend.value === 'sqlite')
        tables.value = data.map(({ tbl_name }) => tbl_name as string)
    }
    finally {
      isLoading.value = false
    }
  }

  if (options.immediate) {
    watchImmediate(isReady, (value) => {
      if (value)
        execute()
    })
  }

  return {
    tables,
    isLoading,
    execute,
  }
}
