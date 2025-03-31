import { generateText, streamText, tool } from 'ai'
import { format } from 'sql-formatter'
import { z } from 'zod'

interface UseText2SqlOptions {
  tables: MaybeRef<string[]>
  cursor: MaybeRef<Database>
}

export function useRelativeTables(tables: MaybeRef<string[]> = []) {
  const queries = computed(() => ({ tableNames: unref(tables).join('\n') }))
  const prompt = usePromptTemplate(RELEVANT_TABLES_PROMPT, queries)

  const execute: AgentNode = async ({ model, messages }) => {
    let data: string[] = []
    const question = messages[0]!.content
    if (!unref(tables).length || !question)
      return []
    await generateText({
      model,
      toolChoice: 'required',
      messages: [
        { role: 'user', content: prompt.value },
        { role: 'user', content: question as string },
      ],

      tools: {
        table: tool({
          description: 'Get relevant tables from a given list',
          parameters: z.object({
            rows: z.array(z.enum(unref(tables) as [string, ...string[]])).describe('Name list of table in SQL database'),
          }).required(),
          execute: async ({ rows }) => {
            data = rows
            return { rows }
          },
        }),
      },
    })
    return data
  }

  return {
    execute: withRetries(execute),
  }
}

export function useSchemasPrompt(cursor: MaybeRef<Database>) {
  const backend = useCursorBackend(cursor)

  const execute: AgentNode = async ({ messages }: { messages: any[] }) => {
    const question = messages[0]!.content
    const tables = messages.at(-1)!.content
    if (!question)
      return ''
    const schemas = await generateTableSchemaPromptWithIndexRows(tables, unref(cursor))
    const template = SQL_PROMPT?.[backend.value] ?? SQL_PROMPT.default as string

    return usePromptTemplate(template, {
      tableInfo: schemas.filter(Boolean).join('\n\n'),
      input: question,
      topK: 5,
      dialect: backend.value,
    }).value
  }

  return {
    execute,
  }
}

export function useGenerateSqlStatement() {
  const execute: AgentNode = async ({ model, messages }) => {
    const question = messages[0]!.content
    if (!question)
      return ''
    const { text } = await generateText({
      model,
      messages: [messages.at(-1)!],
    })

    return text
  }

  return {
    execute: withRetries(execute),
  }
}

export function useSqlFormatter() {
  const execute: AgentNode = async ({ model, messages }) => {
    const md = messages.at(-1)!.content
    const prompt = usePromptTemplate(SQL_VALIDATE_PROMPT, { notFormattedQuery: md })
    return streamText({
      model,
      prompt: prompt.value ?? '',
    })
  }

  return {
    execute: withRetries(execute),
  }
}

export function useText2Sql(options: UseText2SqlOptions) {
  const prompt = ref('')
  const { model } = useAiProvider()
  const data = ref('')
  const isLoading = ref(false)
  const { step, steps, register, next } = useSteps()

  register([
    { title: 'Engine Priming', description: 'Initialze model' },
    { title: 'Semantic Table Indexing', description: 'Analyzing relevent tables' },
    { title: 'Metadata Topology Parsing', description: 'Quering schemas' },
    { title: 'Context Aware', description: 'Generate code from model output' },
  ])

  async function execute() {
    isLoading.value = true
    next()

    const { messages } = await createAgent(model.value!)
      .next(useRelativeTables(options.tables).execute, { after: next })
      .next(useSchemasPrompt(options.cursor).execute, { after: next })
      .next(useGenerateSqlStatement().execute)
      .next(useSqlFormatter().execute)
      .execute([{ role: 'user', content: prompt.value }])

    const result: any = messages.at(-1)!.content

    for await (const textPart of result.textStream) {
      isLoading.value = false
      data.value += textPart
    }

    data.value = format(data.value, {
      language: 'sql',
      tabWidth: 2,
      keywordCase: 'upper',
    })
  }

  return {
    prompt,
    data,
    step,
    steps,
    isLoading,
    execute,
  }
}
