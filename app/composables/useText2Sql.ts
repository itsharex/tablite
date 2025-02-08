import { GoogleGenerativeAI } from '@google/generative-ai'

interface UseText2SqlOptions {
  limit?: MaybeRef<number>
}

async function querySchema(value: string, cursor?: Database) {
  const results = await cursor?.select<{ 'Create Table': string }[]>(`SHWO CREATE TABLE \`${value}\``) ?? []
  return results[0]?.['Create Table']
}

let ai: GoogleGenerativeAI | undefined

export function useText2Sql(cursorInstance: MaybeRef<Database | undefined> | undefined, options: UseText2SqlOptions = {}) {
  const question = ref<string>('')
  const cursor = computed(() => unref(cursorInstance))
  const tables = ref<string[]>([])
  const backend = useCursorBackend(cursor)
  const answer = ref('')
  const apiKey = ref('')

  async function execute() {
    if (question.value && apiKey.value) {
      const tableInfo = (await Promise.all(tables.value.map(i => querySchema(i, cursor.value)))).filter(Boolean).join(' ')
      if (!ai)
        ai = new GoogleGenerativeAI('')
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
