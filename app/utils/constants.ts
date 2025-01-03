function defineQuery(mysql: string = '', postgres: string = '', sqlite: string = '') {
  return {
    mysql,
    postgres,
    sqlite,
  }
}

export const Sql = {
  PLACEHOLDER: defineQuery('?', '$1', '$1'),
  SHOW_TABLES: defineQuery('SHOW TABLES;', 'SHOW TABLES;', 'SHOW TABLES;'),
}
