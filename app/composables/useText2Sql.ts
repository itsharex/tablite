import { FunctionCallingMode, GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { destr } from 'destr'
import { remark } from 'remark'
import { visit } from 'unist-util-visit'
import { toast } from 'vue-sonner'

interface UseText2SqlOptions {
  limit?: MaybeRef<number>
}

export enum GenerationStatus {
  PENDING,
  RUNNING,
  SUCCEEDED,
  FAILED,
}

interface GenerationStep {
  title: string
  description?: string
  status: GenerationStatus
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

async function querySchemaPrompt(value: string, cursor?: Database) {
  if (value && cursor) {
    const [v0, v1] = await Promise.all([
      queryCreateTableSQL(value, cursor),
      cursor?.select<Record<string, any>[]>(`SELECT * FROM \`${value}\` LIMIT 3;`) ?? [],
    ])

    const cols = Object.keys(v1[0] ?? {})
    const rows: string[] = [cols.join('\t')]

    for (const i of v1) {
      rows.push(cols.map(k => String(i[k])).join('\t'))
    }

    return [
      v0,
      '\n/*',
      '3 rows from t_inf_app_application table:',
      rows.join('\n'),
      '*/',
    ].join('\n')
  }
}

function parseConentInCodeBlock(value?: string) {
  if (!value)
    return ''

  let code = ''
  const ast = remark.parse(value)

  visit(ast, 'code', (node) => {
    code = node.value
    return false
  })

  return code
}

export function useText2Sql(cursorInstance: MaybeRef<Database | undefined> | undefined, options: UseText2SqlOptions = {}) {
  const store = useSettingsStore()
  const { googleAPIKey, deepseekApiKey, model } = storeToRefs(store)

  const question = ref<string>('')
  const cursor = computed(() => unref(cursorInstance))
  const includes = ref<string[]>([])
  const backend = useCursorBackend(cursor)
  const sql = ref('')
  const isLoading = ref(false)
  const apiKey = computed(() => [deepseekApiKey.value, googleAPIKey.value].filter(Boolean).length)
  const steps = ref<GenerationStep[]>([])
  const output = ref('')
  const llm = useLlm(model)
  const retries = ref(3)

  async function filterReleventTables(q: string) {
    if (includes.value.length < 25)
      return includes.value

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
                enum: includes.value,
              },
            },
          },
          required: ['rows'],
        },
      },
    }

    const prompt = usePromptTemplate(RELEVANT_TABLES_PROMPT, { tableNames: includes.value.join('\n') })
    const defaults = includes.value.slice(0, 25)

    for (let i = 0; i < retries.value; i++) {
      const { choices } = await llm.chat.completions.create({
        messages: [
          { role: 'user', content: prompt.value },
          { role: 'user', content: q },
        ],
        tools: [tool],
        tool_choice: 'required',
      })

      const [call] = choices[0].message.tool_calls

      if (!call)
        continue

      const args: string[] = call.function.arguments
      const rows = destr<{ rows: string[] }>(args).rows ?? []

      if (rows.length)
        return rows
    }

    return defaults
  }

  async function execute(q?: string) {
    steps.value = []
    const _q = q ?? question.value
    if (_q && !isLoading.value && googleAPIKey.value && includes.value.length) {
      isLoading.value = true
      nextStep('Engine Priming', `Initialze ${model.value}`)
      nextStep('Semantic Table Indexing', 'Analyzing relevent tables ')
      const releventTables = (await filterReleventTables(_q)) ?? []
      nextStep('Metadata Topology Parsing', 'Quering schemas')
      const tableInfo = (await Promise.all(releventTables.map(i => querySchemaPrompt(i, cursor.value)))).filter(Boolean).join('\n\n')
      const template = SQL_PROMPT?.[backend.value] ?? SQL_PROMPT.default as string
      const prompt = usePromptTemplate(template, { tableInfo, input: _q, topK: unref(options.limit) ?? 5, dialect: backend.value })
      if (!prompt.value)
        return
      nextStep('Context Aware', 'Generate sql from model output')

      for (let i = 0; i < retries.value; i++) {
        const { choices } = (await llm.chat.completions.create({ messages: [{ role: 'user', content: prompt.value }] })) ?? {}
        output.value = choices?.[0]?.message.content ?? ''
        sql.value = parseConentInCodeBlock(output.value)
        if (sql.value)
          break
      }

      isLoading.value = false

      if (!sql.value && output.value) {
        toast('unexpected EOF while parsing', { description: output.value })
        abortWithStatus()
      }
    }
  }

  function nextStep(title: string, description?: string, status = GenerationStatus.RUNNING) {
    if (steps.value.length > 0)
      steps.value.at(-1)!.status = GenerationStatus.SUCCEEDED
    steps.value.push({ title, description, status })
  }

  function abortWithStatus(status = GenerationStatus.FAILED) {
    steps.value.at(-1)!.status = status
  }

  return {
    includes,
    question,
    sql,
    output,
    apiKey,
    isLoading,
    steps,
    execute,
  }
}
