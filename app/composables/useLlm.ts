import type OpenAI from 'openai'
import { createFetch } from '@vueuse/core'

const _GOOGLE_AI_MODELS = GOOGLE_AI_MODELS.map(({ model }) => model)
const _DEEPSEEK_MODELS = DEEPSEEK_MODELS.map(({ model }) => model)

const _MODELS = [
  ..._GOOGLE_AI_MODELS,
  ..._DEEPSEEK_MODELS,
]

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

    if (_DEEPSEEK_MODELS.includes(_model.value) && deepseekApiKey.value && deepseekApiKey.value.startsWith('sk-')) {
      _apiKey = deepseekApiKey.value
      _baseURL = 'https://api.deepseek.com/v1'
    }

    if (!_apiKey)
      return

    return createFetch({
      baseUrl: _baseURL,

      options: {
        beforeFetch({ options }: any) {
          if (!options.headers)
            options.headers = {}
          options.headers.Authorization = `Bearer ${_apiKey}`

          return { options }
        },

        onFetchError(ctx) {
          if (ctx.data)
            ctx.error = ctx.data
          return ctx
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
          const { data, error } = await openai.value<OpenAI.Chat.ChatCompletion>('/chat/completions').post({ model: _model.value, ...body }).json()
          if (error.value)
            throw error.value
          return data.value
        },
      },
    },
  }
}
