export function normalizeQueryValue(value: any, dataType: string = '') {
  const _dataType = dataType.split('(')[0]?.toLocaleLowerCase()
  if (!_dataType)
    return `'${value}'`

  if (['float', 'double', 'tinyint', 'smallint', 'int', 'mediumint', 'bigint', 'boolean'].includes(_dataType))
    return value
  if (['tinyblob', 'mediumblob', 'blob', 'longblob'].includes(_dataType))
    return value

  return `'${value}'`
}

export function parseConnectionURL(url?: string): { database: string } & Record<string, any> {
  if (!url)
    return { database: '' }

  if (url.startsWith('mysql')) {
    const matches = url.match(ConnectionPattern.MYSQL) ?? []
    const [_, username, password, host, port, database, queries] = matches
    return { username, password, host, port, database: database ?? '', queries }
  }

  if (url.startsWith('sqlite')) {
    const [database] = url?.split('/').pop()?.split('.') ?? []
    return { database: database ?? '' }
  }

  return { database: url }
}

export async function queryCreateTableSQL(value: string, cursor?: Database): Promise<string> {
  if (value && cursor) {
    const backend = cursor?.path.split(':')[0] ?? 'mysql'
    const sql = Sql.SHOW_CREATE_TABLE(value)[backend]
    if (!sql)
      return ''
    const [row] = await cursor?.select<any[]>(sql) ?? []
    if (backend === 'sqlite')
      return row.sql
    return row['Create Table']
  }

  return ''
}
