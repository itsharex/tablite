import { FunctionCallingMode, GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
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

async function querySchema(value: string, cursor?: Database) {
  if (value && cursor) {
    const [v0, v1] = await Promise.all([
      cursor?.select<{ 'Create Table': string }[]>(`SHOW CREATE TABLE \`${value}\``) ?? [],
      cursor?.select<Record<string, any>[]>(`SELECT * FROM \`${value}\` LIMIT 3;`) ?? [],
    ])

    const cols = Object.keys(v1[0] ?? {})
    const rows: string[] = [cols.join('\t')]

    for (const i of v1) {
      rows.push(cols.map(k => String(i[k])).join('\t'))
    }

    return [
      v0[0]?.['Create Table'],
      '\n/*',
      '3 rows from t_inf_app_application table:',
      rows.join('\n'),
      '*/',
    ].join('\n')
  }
}

export function useText2Sql(cursorInstance: MaybeRef<Database | undefined> | undefined, options: UseText2SqlOptions = {}) {
  const store = useSettingsStore()
  const { googleAPIKey } = storeToRefs(store)

  const question = ref<string>('')
  const cursor = computed(() => unref(cursorInstance))
  const includes = ref<string[]>([])
  const backend = useCursorBackend(cursor)
  const sql = ref('')
  const isLoading = ref(false)
  const apiKey = computed(() => googleAPIKey.value)
  const steps = ref<GenerationStep[]>([])
  const model = ref('gemini-2.0-flash')
  const output = ref('')

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

  async function filterReleventTables(ai: GoogleGenerativeAI, q: string) {
    if (includes.value.length < 25)
      return includes.value

    const fnd = {
      name: 'Table',
      parameters: {
        type: SchemaType.OBJECT,
        description: 'Table in SQL database.',
        properties: {
          includes: {
            type: SchemaType.ARRAY,
            description: 'Names of table in SQL database.',
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: {
                  type: SchemaType.STRING,
                  enum: includes.value,
                },
              },
              required: [
                'name',
              ],
            },
          },
        },
        required: ['includes'],
      },
    }

    const _m = ai.getGenerativeModel({
      model: model.value,

      tools: [{
        functionDeclarations: [fnd],
      }],

      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingMode.ANY,
        },
      },
    })

    const prompt = usePromptTemplate(RELEVANT_TABLES_PROMPT, { tableNames: includes.value.join('\n') })
    const result = await _m.generateContent([prompt.value, q])
    const call = result.response.functionCalls()?.[0]

    const defaults = includes.value.slice(0, 25)

    if (!call)
      return defaults

    const args = ((call.args as any).includes ?? []) as { name: string }[]
    const tables = args.map(({ name }) => name)

    return tables.length ? tables : defaults
  }

  async function execute(q?: string) {
    steps.value = []
    const _q = q ?? question.value
    if (_q && !isLoading.value && googleAPIKey.value && includes.value.length) {
      isLoading.value = true
      nextStep('Engine Priming', `Initialze ${model.value}`)
      const ai = new GoogleGenerativeAI(googleAPIKey.value)
      const _m = ai.getGenerativeModel({ model: model.value })
      nextStep('Semantic Table Indexing', 'Analyzing relevent tables ')
      const releventTables = (await filterReleventTables(ai, _q)) ?? []
      nextStep('Metadata Topology Parsing', 'Quering schemas')
      const tableInfo = (await Promise.all(releventTables.map(i => querySchema(i, cursor.value)))).filter(Boolean).join('\n\n')
      const template = SQL_PROMPT?.[backend.value] ?? SQL_PROMPT.default as string
      const prompt = usePromptTemplate(template, { tableInfo, input: _q, topK: unref(options.limit) ?? 5, dialect: backend.value })
      if (!prompt.value)
        return
      nextStep('Context Aware', 'Generate sql from model output')
      const { response } = await _m.generateContent(prompt.value)
      output.value = response.text()
      sql.value = parseConentInCodeBlock(output.value)
      isLoading.value = false

      if (sql.value)
        return

      toast('unexpected EOF while parsing', { description: output.value })
      abortWithStatus()
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
