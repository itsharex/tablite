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
