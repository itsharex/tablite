import { useSqlAgent } from './useAgent'

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

export function useText2Sql(cursorInstance: MaybeRef<Database | undefined> | undefined, options: UseText2SqlOptions = {}) {
  const store = useSettingsStore()
  const { model } = storeToRefs(store)

  const question = ref<string>('')
  const cursor = computed(() => unref(cursorInstance))
  const includes = ref<string[]>([])
  const sql = ref('')
  const steps = ref<GenerationStep[]>([])

  const { isLoading, error, execute } = useSqlAgent(cursor, {
    usableTableNames: includes,
    limit: options.limit,
    beforeInitialzeModel: () => nextStep('Engine Priming', `Initialze ${model.value}`),
    beforeQueryRelevantTables: () => nextStep('Semantic Table Indexing', 'Analyzing relevent tables'),
    beforeQueryPrompt: () => nextStep('Metadata Topology Parsing', 'Quering schemas'),
    beforeQuerySqlStatement: () => nextStep('Context Aware', 'Generate code from model output'),
  })

  watch(isLoading, (v) => {
    if (!v)
      steps.value = []
  })

  function nextStep(title: string, description?: string, status = GenerationStatus.RUNNING) {
    if (steps.value.length > 0)
      steps.value.at(-1)!.status = GenerationStatus.SUCCEEDED
    steps.value.push({ title, description, status })
  }

  function abortWithStatus(status = GenerationStatus.FAILED) {
    if (steps.value.length > 0)
      steps.value.at(-1)!.status = status
  }

  return {
    includes,
    question,
    sql,
    isLoading,
    steps,

    async execute(q?: string) {
      steps.value = []
      const _q = q ?? question.value

      if (_q && !isLoading.value && model.value && includes.value.length)
        sql.value = await execute(_q)

      if (error.value)
        abortWithStatus()
    },
  }
}
