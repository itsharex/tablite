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
    const driver = useCursorDriver(cursor)
    const sql = Sql.SHOW_CREATE_TABLE(value)[driver.value]
    if (!sql)
      return ''
    const [row] = await cursor?.select<any[]>(sql) ?? []
    if (driver.value === 'sqlite')
      return row.sql
    return row['Create Table']
  }

  return ''
}

export async function queryPrimaryKeys(database: string, table: string, cursor?: Database): Promise<string[]> {
  if (!cursor)
    return []

  const driver = useCursorDriver(cursor).value

  if (driver === 'sqlite') {
    const cols = await cursor?.select<any[]>(`PRAGMA table_info(${table});`) ?? []
    return cols.filter(({ pk }) => pk === 1).map(({ name }) => name)
  }

  const cols = await cursor?.select<any[]>(`SELECT CASE non_unique WHEN 0 THEN'TRUE'ELSE'FALSE'END AS is_unique,column_name as column_name FROM information_schema.statistics WHERE table_schema = '${database}' AND table_name = '${table}' ORDER BY seq_in_index ASC;`) ?? []
  return cols.filter(({ is_unique }) => is_unique === 'TRUE').map(({ column_name }) => column_name)
}
