interface Update {
  enable: boolean
  sql: string
}

interface UseTableChangesOptions {
  structure?: MaybeRef<Structure[]>
  afterDisvard?: () => void
}

export function useTableChanges(value: MaybeRef<string>, options: UseTableChangesOptions = {}) {
  const changes = ref<Record<string, any>>({})
  const updates = ref<Update[]>([])
  const inserts = ref<Record<string, any>[]>([])
  const deletes = ref<string[]>([])
  const table = toRef(value)
  const structure = toRef(options.structure ?? [])

  const dataTypeMap = computed(() => {
    const map: Record<string, string> = {}

    structure.value.forEach(({ columnName, dataType }) => {
      map[columnName] = dataType
    })

    return map
  })

  watchEffect(() => {
    const sqls: string[] = []

    for (const _t in changes.value) {
      const tc = changes.value[_t]
      for (const _k in tc) {
        try {
          const json = JSON.parse(_k)
          const where = Object.entries(json).map(([k, v]) => `${k} = ${normalizeQueryValue(v, dataTypeMap.value[k])}`).join(' AND ')
          const setter = Object.entries((tc[_k] ?? {}) as Record<string, any[]>).map(([k, [_, v]]) => `${k} = ${normalizeQueryValue(v, dataTypeMap.value[k])}`).join(', ')
          sqls.push(`UPDATE \`${_t}\` SET ${setter} WHERE ${where}`)
        }
        catch {
          continue
        }
      }
    }

    for (const _n of inserts.value) {
      const keys = Object.keys(_n)
      sqls.push(`INSERT INTO \`${table.value}\` (${keys.join(', ')}) VALUES (${keys.map(k => normalizeQueryValue(_n[k], dataTypeMap.value[k])).join(', ')})`)
    }

    for (const _d of deletes.value) {
      try {
        const json = JSON.parse(_d)
        const where = Object.entries(json).map(([k, v]) => `${k} = ${normalizeQueryValue(v, dataTypeMap.value[k])}`).join(' AND ')
        sqls.push(`DELETE FROM \`${table.value}\` WHERE ${where}`)
      }
      catch {
        continue
      }
    }

    updates.value = sqls.map(sql => ({ enable: true, sql }))
  })

  function disvard() {
    clear()
    options.afterDisvard?.()
  }

  function clear() {
    changes.value = table.value ? { [table.value]: {} } : {}
    updates.value = []
    inserts.value = []
    deletes.value = []
  }

  return {
    changes,
    updates,
    inserts,
    deletes,
    disvard,
    clear,
  }
}
