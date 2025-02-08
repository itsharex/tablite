function defineQuery(mysql: string = '', postgres: string = '', sqlite: string = ''): Record<string, string> {
  return {
    mysql,
    postgres,
    sqlite,
  }
}

export const Sql = {
  PLACEHOLDER: () => defineQuery('?', '$1', '$1'),
  SHOW_TABLES: () => defineQuery('SHOW TABLES;', 'SHOW TABLES;', 'SELECT * FROM sqlite_master WHERE type = \'table\';'),
  DESCRIBE_TABLE: (value: string) => defineQuery(`DESCRIBE ${value};`, 'SHOW TABLES;', `PRAGMA table_info(${value});`),
  QUERY_UNIQUE_COLUMNS: (database: string, table: string) => defineQuery(`SELECT CASE non_unique WHEN 0 THEN'TRUE'ELSE'FALSE'END AS is_unique,column_name as column_name FROM information_schema.statistics WHERE table_schema = '${database}' AND table_name = '${table}' ORDER BY seq_in_index ASC;`, 'SHOW TABLES;', `SELECT CASE il."unique" WHEN 1 THEN 'TRUE' ELSE 'FALSE' END AS is_unique, ii.name AS 'column_name' FROM sqlite_master AS m, pragma_index_list (m.name) AS il, pragma_index_info (il.name) AS ii WHERE m.name = "${table}";`),

  EQUALS: (value: string) => defineQuery(`= \'${value}\'`, `= \'${value}\'`, `= \'${value}\'`),
  NOT_EQUALS: (value: string) => defineQuery(`!= \'${value}\'`, `!= \'${value}\'`, `!= \'${value}\'`),
  GREATER_THAN_OR_EQUALS: (value: string) => defineQuery(`>= \'${value}\'`, `>= \'${value}\'`, `>= \'${value}\'`),
  GREATER_THAN: (value: string) => defineQuery(`> \'${value}\'`, `> \'${value}\'`, `> \'${value}\'`),
  LESS_THAN_OR_EQUALS: (value: string) => defineQuery(`<= \'${value}\'`, `<= \'${value}\'`, `<= \'${value}\'`),
  LESS_THAN: (value: string) => defineQuery(`< \'${value}\'`, `< \'${value}\'`, `< \'${value}\'`),
  IN: (value: string) => defineQuery(`IN (\'${value}\')`, `IN (\'${value}\')`, `IN (\'${value}\')`),
  LIKE: (value: string) => defineQuery(`LIKE \'${value}\'`, `LIKE \'${value}\'`, `LIKE \'${value}\'`),
  ILIKE: (value: string) => defineQuery(`ILIKE \'${value}\'`, `ILIKE \'${value}\'`, `ILIKE \'${value}\'`),
  CONTAINS: (value: string) => defineQuery(`LIKE \'%${value}%\'`, `LIKE \'%${value}%\'`, `LIKE \'%${value}%\'`),
}

export const ConnectionPattern = {
  // eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/no-misleading-capturing-group
  MYSQL: /mysql:\/\/([^:]+):(.*)@([^:/]+):(\d+)\/([^?]+)(\?.*)?/,
}

export const SQL_PROMPT: Record<string, (topK: number, tableInfo: string, input: string, dialect?: string) => string> = {
  mysql: (topK: number, tableInfo: string, input: string) => MYSQL_PROMPT(topK) + PROMPT_SUFFIX(tableInfo, input),
  sqlite: (topK: number, tableInfo: string, input: string) => SQLITE_PROMPT(topK) + PROMPT_SUFFIX(tableInfo, input),
  postgres: (topK: number, tableInfo: string, input: string) => POSTGRES_PROMPT(topK) + PROMPT_SUFFIX(tableInfo, input),
  default: (topK: number, tableInfo: string, input: string, dialect = 'mysql') => DEFAULT_TEMPLATE(dialect, topK) + PROMPT_SUFFIX(tableInfo, input),
}

function DEFAULT_TEMPLATE(dialect: string, topK: number) {
  return `Given an input question, first create a syntactically correct ${dialect} query to run, then look at the results of the query and return the answer. Unless the user specifies in his question a specific number of examples he wishes to obtain, always limit your query to at most ${topK} results. You can order the results by a relevant column to return the most interesting examples in the database.

Never query for all the columns from a specific table, only ask for a the few relevant columns given the question.

Pay attention to use only the column names that you can see in the schema description. Be careful to not query for columns that do not exist. Also, pay attention to which column is in which table.

Use the following format:

Question: Question here
SQLQuery: SQL Query to run

`
}

function MYSQL_PROMPT(topK: number) {
  return `You are a MySQL expert. Given an input question, first create a syntactically correct MySQL query to run, then look at the results of the query and return the answer to the input question.
Unless the user specifies in the question a specific number of examples to obtain, query for at most ${topK} results using the LIMIT clause as per MySQL. You can order the results to return the most informative data in the database.
Never query for all columns from a table. You must query only the columns that are needed to answer the question. Wrap each column name in backticks (\`) to denote them as delimited identifiers.
Pay attention to use only the column names you can see in the tables below. Be careful to not query for columns that do not exist. Also, pay attention to which column is in which table.
Pay attention to use CURDATE() function to get the current date, if the question involves "today".

Use the following format:

Question: Question here
SQLQuery: SQL Query to run

`
}

function SQLITE_PROMPT(topK: number) {
  return `You are a SQLite expert. Given an input question, first create a syntactically correct SQLite query to run, then look at the results of the query and return the answer to the input question.
Unless the user specifies in the question a specific number of examples to obtain, query for at most ${topK} results using the LIMIT clause as per SQLite. You can order the results to return the most informative data in the database.
Never query for all columns from a table. You must query only the columns that are needed to answer the question. Wrap each column name in double quotes (") to denote them as delimited identifiers.
Pay attention to use only the column names you can see in the tables below. Be careful to not query for columns that do not exist. Also, pay attention to which column is in which table.
Pay attention to use date('now') function to get the current date, if the question involves "today".

Use the following format:

Question: Question here
SQLQuery: SQL Query to run

`
}

function POSTGRES_PROMPT(topK: number) {
  return `You are a PostgreSQL expert. Given an input question, first create a syntactically correct PostgreSQL query to run, then look at the results of the query and return the answer to the input question.
Unless the user specifies in the question a specific number of examples to obtain, query for at most ${topK} results using the LIMIT clause as per PostgreSQL. You can order the results to return the most informative data in the database.
Never query for all columns from a table. You must query only the columns that are needed to answer the question. Wrap each column name in double quotes (") to denote them as delimited identifiers.
Pay attention to use only the column names you can see in the tables below. Be careful to not query for columns that do not exist. Also, pay attention to which column is in which table.
Pay attention to use CURRENT_DATE function to get the current date, if the question involves "today".

Use the following format:

Question: Question here
SQLQuery: SQL Query to run

`
}

function PROMPT_SUFFIX(tableInfo: string, input: string) {
  return `Only use the following tables:
${tableInfo}

Question: ${input}
SQLQuery:`
}

export const SQL_KEYWORDS = [
  'ACCESSIBLE',
  'ADD',
  'ALL',
  'ALTER',
  'ANALYZE',
  'AND',
  'AS',
  'ASC',
  'ASENSITIVE',
  'BEFORE',
  'BETWEEN',
  'BIGINT',
  'BINARY',
  'BLOB',
  'BOTH',
  'BY',
  'CALL',
  'CASCADE',
  'CASE',
  'CHANGE',
  'CHAR',
  'CHARACTER',
  'CHECK',
  'COLLATE',
  'COLUMN',
  'CONDITION',
  'CONSTRAINT',
  'CONTINUE',
  'CONVERT',
  'CREATE',
  'CROSS',
  'CUBE',
  'CUME_DIST',
  'CURRENT_DATE',
  'CURRENT_TIME',
  'CURRENT_TIMESTAMP',
  'CURRENT_USER',
  'CURSOR',
  'DATABASE',
  'DATABASES',
  'DAY_HOUR',
  'DAY_MICROSECOND',
  'DAY_MINUTE',
  'DAY_SECOND',
  'DEC',
  'DECIMAL',
  'DECLARE',
  'DEFAULT',
  'DELAYED',
  'DELETE',
  'DENSE_RANK',
  'DESC',
  'DESCRIBE',
  'DETERMINISTIC',
  'DISTINCT',
  'DISTINCTROW',
  'DIV',
  'DOUBLE',
  'DROP',
  'DUAL',
  'EACH',
  'ELSE',
  'ELSEIF',
  'EMPTY',
  'ENCLOSED',
  'ESCAPED',
  'EXCEPT',
  'EXISTS',
  'EXIT',
  'EXPLAIN',
  'FALSE',
  'FETCH',
  'FIRST_VALUE',
  'FLOAT',
  'FLOAT4',
  'FLOAT8',
  'FOR',
  'FORCE',
  'FOREIGN',
  'FROM',
  'FULLTEXT',
  'FUNCTION',
  'GENERATED',
  'GET',
  'GRANT',
  'GROUP',
  'GROUPING',
  'GROUPS',
  'HAVING',
  'HIGH_PRIORITY',
  'HOUR_MICROSECOND',
  'HOUR_MINUTE',
  'HOUR_SECOND',
  'IF',
  'IGNORE',
  'IN',
  'INDEX',
  'INFILE',
  'INNER',
  'INOUT',
  'INSENSITIVE',
  'INSERT',
  'INT',
  'INT1',
  'INT2',
  'INT3',
  'INT4',
  'INT8',
  'INTEGER',
  'INTERVAL',
  'INTO',
  'IO_AFTER_GTIDS',
  'IO_BEFORE_GTIDS',
  'IS',
  'ITERATE',
  'JOIN',
  'JSON_TABLE',
  'KEY',
  'KEYS',
  'KILL',
  'LAG',
  'LAST_VALUE',
  'LATERAL',
  'LEAD',
  'LEADING',
  'LEAVE',
  'LEFT',
  'LIKE',
  'LIMIT',
  'LINEAR',
  'LINES',
  'LOAD',
  'LOCALTIME',
  'LOCALTIMESTAMP',
  'LOCK',
  'LONG',
  'LONGBLOB',
  'LONGTEXT',
  'LOOP',
  'LOW_PRIORITY',
  'MASTER_BIND',
  'MASTER_SSL_VERIFY_SERVER_CERT',
  'MATCH',
  'MAXVALUE',
  'MEDIUMBLOB',
  'MEDIUMINT',
  'MEDIUMTEXT',
  'MEMBER',
  'MIDDLEINT',
  'MINUTE_MICROSECOND',
  'MINUTE_SECOND',
  'MOD',
  'MODIFIES',
  'NATURAL',
  'NOT',
  'NO_WRITE_TO_BINLOG',
  'NTH_VALUE',
  'NTILE',
  'NULL',
  'NUMERIC',
  'OF',
  'ON',
  'ONLY',
  'OPTIMIZE',
  'OPTIMIZER_COSTS',
  'OPTION',
  'OPTIONALLY',
  'OR',
  'ORDER',
  'OUT',
  'OUTER',
  'OUTFILE',
  'OVER',
  'PARTITION',
  'PERCENT_RANK',
  'PERSIST',
  'PERSIST_ONLY',
  'PRECISION',
  'PRIMARY',
  'PROCEDURE',
  'PURGE',
  'RANGE',
  'RANK',
  'READ',
  'READS',
  'READ_WRITE',
  'REAL',
  'RECURSIVE',
  'REF_SYSTEM_ID',
  'REFERENCES',
  'REGEXP',
  'RELEASE',
  'RENAME',
  'REPEAT',
  'REPLACE',
  'REQUIRE',
  'RESIGNAL',
  'RESTRICT',
  'RETURN',
  'REVOKE',
  'RIGHT',
  'RLIKE',
  'ROW',
  'ROWS',
  'ROW_NUMBER',
  'SCHEMA',
  'SCHEMAS',
  'SECOND_MICROSECOND',
  'SELECT',
  'SENSITIVE',
  'SEPARATOR',
  'SET',
  'SHOW',
  'SIGNAL',
  'SMALLINT',
  'SPATIAL',
  'SPECIFIC',
  'SQL',
  'SQLEXCEPTION',
  'SQLSTATE',
  'SQLWARNING',
  'SQL_BIG_RESULT',
  'SQL_CALC_FOUND_ROWS',
  'SQL_SMALL_RESULT',
  'SSL',
  'STARTING',
  'STORED',
  'STRAIGHT_JOIN',
  'SYSTEM',
  'TABLE',
  'TERMINATED',
  'THEN',
  'TINYBLOB',
  'TINYINT',
  'TINYTEXT',
  'TO',
  'TRAILING',
  'TRIGGER',
  'TRUE',
  'UNDO',
  'UNION',
  'UNIQUE',
  'UNLOCK',
  'UNSIGNED',
  'UPDATE',
  'USAGE',
  'USE',
  'USING',
  'UTC_DATE',
  'UTC_TIME',
  'UTC_TIMESTAMP',
  'VALUES',
  'VARBINARY',
  'VARCHAR',
  'VARCHARACTER',
  'VARYING',
  'VIRTUAL',
  'WHEN',
  'WHERE',
  'WHILE',
  'WINDOW',
  'WITH',
  'WRITE',
  'XOR',
  'YEAR_MONTH',
  'ZEROFILL',
]
