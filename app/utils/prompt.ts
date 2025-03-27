interface GenerateTableSchemaPromptWithIndexRowsOptions {
  limit?: number
}

export async function generateTableSchemaPromptWithIndexRows(tables: string[], cursor?: Database, options: GenerateTableSchemaPromptWithIndexRowsOptions = {}) {
  if (!cursor)
    return []

  return await Promise.all(tables.map(t => (async () => {
    if (t && cursor) {
      const limit = options.limit ?? 3
      const [v0, v1] = await Promise.all([
        queryCreateTableSQL(t, cursor),
        cursor?.select<Record<string, any>[]>(`SELECT * FROM \`${t}\` LIMIT ${limit};`) ?? [],
      ])

      const cols = Object.keys(v1[0] ?? {})
      const rows: string[] = [cols.join('\t')]

      for (const i of v1) {
        rows.push(cols.map(k => String(i[k])).join('\t'))
      }

      return [
        v0,
        '\n/*',
        `${limit} rows from ${t} table:`,
        rows.join('\n'),
        '*/',
      ].join('\n')
    }
  })()))
}
