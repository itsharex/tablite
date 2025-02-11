import { createFetch, useFetch } from '@vueuse/core'

const MODELS = Object.keys(Model)

interface ChatCompletionsResponse {
  choices: {
    finish_reason: string
    index: 0
    message: {
      content: string
      role: 'assistant'
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
    if (!MODELS.includes(_model.value))
      return

    if (Model[_model.value]?.group === 'Google AI' && googleAPIKey.value && googleAPIKey.value.startsWith('AIzaSy')) {
      _apiKey = googleAPIKey.value
      _baseURL = 'https://generativelanguage.googleapis.com/v1beta/openai'
    }

    if (Model[_model.value]?.group === 'DeepSeek' && googleAPIKey.value && googleAPIKey.value.startsWith('sk-')) {
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
