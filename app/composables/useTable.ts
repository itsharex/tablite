import type Database from '@tauri-apps/plugin-sql'

interface MysqlStructure {
  Field: string
  Type: string
}

interface Structure {
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

type QueryStructureResults = MysqlStructure[]
type QuerySchemaResults = MysqlSchema

function normalizeStructure(value: QueryStructureResults): Structure[] {
  return value.map(item => ({
    columnName: item.Field,
    dataType: item.Type,
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

export function useTable(tableName: MaybeRef<string>, cursorInstance: MaybeRef<Database | undefined> | undefined) {
  const table = computed(() => unref(tableName))
  const cursor = computed(() => unref(cursorInstance))
  const limit = ref(50)
  const offset = ref(0)
  const count = ref(0)
  const data = ref<any[]>([])
  const structure = ref<Structure[]>([])
  const schema = ref<Partial<ReturnType<typeof normalizeSchema>>>({})
  const isLoading = ref([false, false])

  async function setup() {
    try {
      if (table.value && cursor.value) {
        isLoading.value[0] = true
        const results = await Promise.all([
          cursor.value?.select<QueryStructureResults>(`DESCRIBE ${table.value};`),
          cursor.value?.select<{ count: number }[]>(`SELECT COUNT(*) as count FROM \`${table.value}\`;`),
          cursor.value?.select<any>(`SELECT * FROM information_schema.tables WHERE TABLE_NAME = '${table.value}';`),
        ])
        structure.value = normalizeStructure(results[0] ?? [])
        count.value = results[1]?.[0]?.count ?? 0
        schema.value = normalizeSchema(results[2]?.[0])
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
        data.value = await cursor.value?.select<any[]>(`SELECT * FROM \`${table.value}\` LIMIT ? OFFSET ?;`, [limit.value, offset.value]) ?? []
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
    isLoading: computed(() => isLoading.value.some(Boolean)),
    setup,
    execute,
  }
}

export function useTables(cursorInstance: MaybeRef<Database | undefined> | undefined) {
  const cursor = computed(() => unref(cursorInstance))
  const tables = ref<string[]>([])
  const isLoading = ref(false)
  const isReady = computed(() => !!cursor.value)

  async function execute() {
    try {
      const sql = Sql.SHOW_TABLES!.mysql
      const data: Record<string, string>[] = await cursor.value?.select(sql) ?? []
      tables.value = data.map(item => Object.values(item)[0] as string)
    }
    finally {
      isLoading.value = false
    }
  }

  watchImmediate(isReady, (value) => {
    if (value)
      execute()
  })

  return {
    tables,
    isLoading,
    execute,
  }
}
