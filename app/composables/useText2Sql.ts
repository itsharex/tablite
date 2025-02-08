import { GoogleGenerativeAI } from '@google/generative-ai'

interface UseText2SqlOptions {
  limit?: MaybeRef<number>
}

async function querySchema(value: string, cursor?: Database) {
  const [v0, v1] = await Promise.all([
    cursor?.select<{ 'Create Table': string }[]>(`SHOW CREATE TABLE \`${value}\``) ?? [],
    cursor?.select<Record<string, any>[]>(`SELECT * FROM \`${value}\` LIMIT 3;`) ?? [],
  ])

  const cols = Object.keys(v1[0] ?? {})
  const rows: string[] = []

  for (const i of v1) {
    rows.push(cols.map(k => String(i[k])).join('\t'))
  }

  return [
    v0[0]?.['Create Table'],
    '\n/*\n3 rows from t_inf_app_application table:',
    cols.join('\t'),
    rows.join('\n'),
    '\n',
  ].join('\n')
}

let ai: GoogleGenerativeAI | undefined

export function useText2Sql(cursorInstance: MaybeRef<Database | undefined> | undefined, options: UseText2SqlOptions = {}) {
  const question = ref<string>('')
  const cursor = computed(() => unref(cursorInstance))
  const tables = ref<string[]>([])
  const backend = useCursorBackend(cursor)
  const answer = ref('')
  const apiKey = ref('')

  async function execute(q?: string) {
    const _q = q ?? question.value
    if (_q && apiKey.value && tables.value.length) {
      const tableInfo = (await Promise.all(tables.value.map(i => querySchema(i, cursor.value)))).filter(Boolean).join('\n\n')
      if (!ai)
        ai = new GoogleGenerativeAI(apiKey.value)
      const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' })
      const prompt = SQL_PROMPT[backend.value]?.(unref(options.limit) ?? 5, tableInfo, question.value, backend.value)
      if (!prompt)
        return
      const result = await model.generateContent(prompt)
      const response = await result.response
      answer.value = response.text()
    }
  }

  return {
    apiKey,
    tables,
    question,
    answer,
    execute,
  }
}
