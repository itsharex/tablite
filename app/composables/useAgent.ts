import { destr } from 'destr'
import { format } from 'sql-formatter'
import { toast } from 'vue-sonner'

interface UseSqlAgentOptions {
  usableTableNames: MaybeRef<string[]>
  limit: MaybeRef<number>
  beforeInitialzeModel: () => void
  beforeQueryRelevantTables: () => void
  beforeQueryPrompt: () => void
  beforeQuerySqlStatement: () => void
  beforeQuerySqlValidation: () => void
}

async function queryCreateTableSQL(value: string, cursor?: Database): Promise<string> {
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

export function useSqlAgent(cursorInstance: MaybeRef<Database | undefined> | undefined, options: Partial<UseSqlAgentOptions> = {}) {
  const store = useSettingsStore()
  const { model } = storeToRefs(store)

  const retries = ref(3)
  const output = ref('')
  const usableTableNames = computed(() => unref(options.usableTableNames) ?? [])
  const cursor = computed(() => unref(cursorInstance))
  const llm = useLlm(model)
  const includes = ref<string[]>([])
  const backend = useCursorBackend(cursor)
  const prompt = ref('')
  const isLoading = ref(false)
  const error = ref('')
  const question = ref('')

  async function queryRelevantTables() {
    if (usableTableNames.value.length < 5) {
      includes.value = usableTableNames.value
      return
    }

    const tool = {
      type: 'function',
      function: {
        name: 'Table',
        description: 'Get relevant tables from a given list',
        parameters: {
          type: 'object',
          properties: {
            rows: {
              type: 'array',
              description: 'Name list of table in SQL database',
              items: {
                type: 'string',
                enum: usableTableNames.value,
              },
            },
          },
          required: ['rows'],
        },
      },
    }

    const prompt = usePromptTemplate(RELEVANT_TABLES_PROMPT, { tableNames: usableTableNames.value.join('\n') })
    const defaults = usableTableNames.value.slice(0, 25)

    for (let i = 0; i < retries.value; i++) {
      if (!isLoading.value)
        return

      const { data } = await llm.chat.completions.create({
        messages: [
          { role: 'user', content: prompt.value },
          { role: 'user', content: question.value },
        ],
        tools: [tool],
        tool_choice: 'required',
      })

      const [call] = data.value?.choices[0].message.tool_calls

      if (!call)
        continue

      const args: string[] = call.function.arguments
      const rows = destr<{ rows: string[] }>(args).rows ?? []

      if (rows.length) {
        includes.value = rows
        return
      }
    }

    includes.value = defaults
  }

  async function queryPrompt() {
    if (!isLoading.value)
      return

    const prompts = await Promise.all(includes.value.map(t => (async () => {
      if (t && cursor.value) {
        const [v0, v1] = await Promise.all([
          queryCreateTableSQL(t, cursor.value),
          cursor.value?.select<Record<string, any>[]>(`SELECT * FROM \`${t}\` LIMIT 3;`) ?? [],
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

    const template = SQL_PROMPT?.[backend.value] ?? SQL_PROMPT.default as string

    prompt.value = usePromptTemplate(template, {
      tableInfo: prompts.filter(Boolean).join('\n\n'),
      input: question.value,
      topK: unref(options.limit) ?? 5,
      dialect: backend.value,
    }).value
  }

  async function querySqlStatement() {
    for (let i = 0; i < retries.value; i++) {
      if (!isLoading.value)
        return

      const { data } = await llm.chat.completions.create({ messages: [{ role: 'user', content: prompt.value }] })
      output.value = data.value?.choices?.[0]?.message.content ?? ''
      if (output.value)
        break
    }
  }

  async function querySqlValidation() {
    let _error = ''

    const prompt = usePromptTemplate(SQL_VALIDATE_PROMPT, { notFormattedQuery: unref(output.value) })

    for (let i = 0; i < retries.value; i++) {
      if (!isLoading.value)
        return

      const { data } = (await llm.chat.completions.create({ messages: [{ role: 'user', content: prompt.value }] })) ?? {}
      const sql = data.value.choices?.[0]?.message.content ?? ''

      if (!sql)
        continue

      try {
        output.value = format(sql, {
          language: 'sql',
          tabWidth: 2,
          keywordCase: 'upper',
        })

        _error = ''
        break
      }
      catch (e) {
        _error = e as string
        continue
      }
    }

    error.value = _error
  }

  async function execute(input: MaybeRef<string>) {
    prompt.value = ''
    output.value = ''
    includes.value = []
    question.value = unref(input)
    isLoading.value = true

    try {
      options.beforeInitialzeModel?.()
      options.beforeQueryRelevantTables?.()
      await queryRelevantTables()
      options.beforeQueryPrompt?.()
      await queryPrompt()
      options.beforeQuerySqlStatement?.()
      await querySqlStatement()
      options.beforeQuerySqlValidation?.()
      await querySqlValidation()
    }
    catch (errors: any) {
      error.value = errors
      output.value = ''

      if (Array.isArray(errors)) {
        errors.forEach(({ error }: any) => {
          toast(error.status, { description: error.message })
        })
      }

      else {
        toast('NETWORK_ERROR', { description: 'An error occurred trying to load the resource' })
      }
    }
    finally {
      isLoading.value = false
    }

    return output.value
  }

  return {
    error,
    output,
    isLoading,
    execute,
  }
}
