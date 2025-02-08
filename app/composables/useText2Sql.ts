import { GoogleGenerativeAI } from '@google/generative-ai'
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
  const question = ref<string>('')
  const cursor = computed(() => unref(cursorInstance))
  const tables = ref<string[]>([])
  const backend = useCursorBackend(cursor)
  const answer = ref('')
  const apiKey = ref('')
  const isLoading = ref(false)

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

  async function execute(q?: string) {
    const _q = q ?? question.value
    if (_q && apiKey.value && tables.value.length) {
      const ai = new GoogleGenerativeAI(apiKey.value)
      isLoading.value = true
      const tableInfo = (await Promise.all(tables.value.map(i => querySchema(i, cursor.value)))).filter(Boolean).join('\n\n')
      const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' })
      const prompt = SQL_PROMPT[backend.value]?.(unref(options.limit) ?? 5, tableInfo, _q, backend.value)
      if (!prompt)
        return
      const result = await model.generateContent(prompt)
      const response = await result.response
      answer.value = parseConentInCodeBlock(response.text())
      isLoading.value = false
    }
  }

  return {
    apiKey,
    tables,
    question,
    answer,
    isLoading,
    execute,
  }
}
