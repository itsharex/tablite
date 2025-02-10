import { FunctionCallingMode, GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { remark } from 'remark'
import { visit } from 'unist-util-visit'

interface UseText2SqlOptions {
  limit?: MaybeRef<number>
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

    const model = ai.getGenerativeModel({
      model: 'gemini-2.0-flash',

      tools: [{
        functionDeclarations: [fnd],
      }],

      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingMode.ANY,
        },
      },
    })

    const prompt = [
      'Return the names of any SQL tables that are relevant to the user question.',
      'The tables are:\n',
      ...includes.value,
    ].join('\n')

    const result = await model.generateContent([prompt, q])
    const call = result.response.functionCalls()?.[0]

    const defaults = includes.value.slice(0, 25)

    if (!call)
      return defaults

    const args = ((call.args as any).includes ?? []) as { name: string }[]
    const tables = args.map(({ name }) => name)

    return tables.length ? tables : defaults
  }

  async function execute(q?: string) {
    const _q = q ?? question.value
    if (_q && googleAPIKey.value && includes.value.length) {
      isLoading.value = true
      const ai = new GoogleGenerativeAI(googleAPIKey.value)
      const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' })
      const releventTables = (await filterReleventTables(ai, _q)) ?? []
      const tableInfo = (await Promise.all(releventTables.map(i => querySchema(i, cursor.value)))).filter(Boolean).join('\n\n')
      const prompt = SQL_PROMPT[backend.value]?.(unref(options.limit) ?? 5, tableInfo, _q, backend.value)
      if (!prompt)
        return
      const { response } = await model.generateContent(prompt)
      sql.value = parseConentInCodeBlock(response.text())
      isLoading.value = false
    }
  }

  return {
    includes,
    question,
    sql,
    apiKey,
    isLoading,
    execute,
  }
}
