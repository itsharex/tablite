interface MysqlStructure {
  Field: string
  Type: string
}

interface Structure {
  columnName: string
  dataType: string
}

type QueryStructureResults = MysqlStructure[]

function normalizeStructure(value: QueryStructureResults): Structure[] {
  return value.map(item => ({
    columnName: item.Field,
    dataType: item.Type,
  }))
}

export function useTable(name: MaybeRef<string>, id: MaybeRef<string>) {
  const store = useConnectionStore()
  const { cursors } = storeToRefs(store)
  const table = computed(() => unref(name))
  const cnxId = computed(() => unref(id))
  const cur = computed(() => cursors.value[cnxId.value])
  const limit = ref(100)
  const offset = ref(0)
  const data = ref<any[]>([])
  const structure = ref<Structure[]>([])

  async function execute() {
    if (table.value && cnxId.value) {
      const sql = `SELECT * FROM ${table.value} LIMIT ? OFFSET ?;`

      try {
        const results = await Promise.all([
          cur.value?.instance.select<QueryStructureResults>(`DESCRIBE ${table.value};`),
          cur.value?.instance.select<any[]>(sql, [limit.value, offset.value]),
        ])
        structure.value = normalizeStructure(results[0] ?? [])
        data.value = results[1] ?? []
      }
      catch {
        data.value = []
      }
    }
  }

  return {
    data,
    structure,
    execute,
  }
}

export function useTables(value: MaybeRef<string>) {
  const store = useConnectionStore()
  const { cursors, connections } = storeToRefs(store)
  const cnxId = computed(() => unref(value))
  const cur = computed(() => cursors.value[cnxId.value])
  const tables = ref<string[]>([])

  const backend = computed(() => {
    if (cur.value?.url.startsWith('mysql'))
      return 'mysql'
    if (cur.value?.url.startsWith('postgres'))
      return 'postgres'
    return 'mysql'
  })

  async function findCurOrCreate() {
    if (cur.value?.instance)
      return cur.value.instance
    const cnx = connections.value.find(e => e.id === cnxId.value)
    if (!cnx?.url)
      return
    await store.connect(cnx.url)
    return cur.value?.instance
  }

  async function execute() {
    const instance = await findCurOrCreate()
    if (!instance)
      return
    const sql = Sql.SHOW_TABLES![backend.value]!
    const data: Record<string, string>[] = await instance.select(sql)
    tables.value = data.map(item => Object.values(item)[0] as string)
  }

  watchImmediate(connections, () => {
    execute()
  })

  return {
    tables,
  }
}
