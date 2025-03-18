export async function generateTableSchemaPromptWithIndexRows(tables: string[], cursor?: Database) {
  if (!cursor)
    return []
  return await Promise.all(tables.map(t => (async () => {
    if (t && cursor) {
      const [v0, v1] = await Promise.all([
        queryCreateTableSQL(t, cursor),
        cursor?.select<Record<string, any>[]>(`SELECT * FROM \`${t}\` LIMIT 3;`) ?? [],
      ])

      const cols = Object.keys(v1[0] ?? {})
      const rows: string[] = [cols.join('\t')]

      for (const i of v1) {
        rows.push(cols.map(k => String(i[k])).join('\t'))
      }

      return [
        v0,
        '\n/*',
        `3 rows from ${t} table:`,
        rows.join('\n'),
        '*/',
      ].join('\n')
    }
  })()))
}
