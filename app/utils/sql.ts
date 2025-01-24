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
