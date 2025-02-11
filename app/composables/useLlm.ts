import { createFetch } from '@vueuse/core'

const _GOOGLE_AI_MODELS = GOOGLE_AI_MODELS.map(({ model }) => model)
const _DEEPSEEK_MODELS = DEEPSEEK_MODELS.map(({ model }) => model)

const _MODELS = [
  ..._GOOGLE_AI_MODELS,
  ..._DEEPSEEK_MODELS,
]

interface ChatCompletionsResponse {
  choices: {
    finish_reason: string
    index: 0
    message: {
      content: string
      role: 'assistant'

      tool_calls: {
        function: {
          arguments: string
          name: string
        }
        id: string
        type: string
      }[]
    }
  }[]

  model: string
  object: string

  usage: {
    completion_tokens: number
    prompt_tokens: number
    total_tokens: number
  }
}

export function useLlm(model: MaybeRef<string>) {
  let _apiKey = ''
  let _baseURL = ''
  const _model = computed(() => unref(model))

  const store = useSettingsStore()
  const { googleAPIKey, deepseekApiKey } = storeToRefs(store)

  const openai = computed(() => {
    if (!_MODELS.includes(_model.value))
      return

    if (_GOOGLE_AI_MODELS.includes(_model.value) && googleAPIKey.value && googleAPIKey.value.startsWith('AIzaSy')) {
      _apiKey = googleAPIKey.value
      _baseURL = 'https://generativelanguage.googleapis.com/v1beta/openai'
    }

    if (_DEEPSEEK_MODELS.includes(_model.value) && googleAPIKey.value && googleAPIKey.value.startsWith('sk-')) {
      _apiKey = deepseekApiKey.value
      _baseURL = 'https://api.deepseek.com/v1'
    }

    if (!_apiKey)
      return

    return createFetch({
      baseUrl: _baseURL,

      options: {
        async beforeFetch({ options }: any) {
          if (!options.headers)
            options.headers = {}
          options.headers.Authorization = `Bearer ${_apiKey}`

          return { options }
        },
      },
    })
  })

  return {
    chat: {
      completions: {
        async create(body: Record<string, any> = {}) {
          if (!openai.value)
            return
          const { data } = await openai.value<ChatCompletionsResponse>('/chat/completions').post({ model: _model.value, ...body }).json()
          return data.value
        },
      },
    },
  }
}
