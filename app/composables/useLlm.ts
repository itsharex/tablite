import type OpenAI from 'openai'
import { createFetch, type UseFetchOptions } from '@vueuse/core'

const _GOOGLE_AI_MODELS = GOOGLE_AI_MODELS.map(({ model }) => model)
const _DEEPSEEK_MODELS = DEEPSEEK_MODELS.map(({ model }) => model)
const _OPENROUTER_MODELS = OPENROUTER_MODELS.map(({ model }) => model)

const _MODELS = [
  ..._GOOGLE_AI_MODELS,
  ..._DEEPSEEK_MODELS,
  ..._OPENROUTER_MODELS,
]

export function useLlm(model: MaybeRef<string>) {
  let _apiKey = ''
  let _baseURL = ''
  const _model = computed(() => unref(model))

  const store = useSettingsStore()
  const { googleAPIKey, deepseekApiKey, openrouterApiKey } = storeToRefs(store)

  const openai = computed(() => {
    if (_GOOGLE_AI_MODELS.includes(_model.value) && googleAPIKey.value && googleAPIKey.value.startsWith('AIzaSy')) {
      _apiKey = googleAPIKey.value
      _baseURL = OpenaiEndpoint.GOOGLE
    }

    if (_DEEPSEEK_MODELS.includes(_model.value) && deepseekApiKey.value && deepseekApiKey.value.startsWith('sk-')) {
      _apiKey = deepseekApiKey.value
      _baseURL = OpenaiEndpoint.DEEPSEEK
    }

    if (_OPENROUTER_MODELS.includes(_model.value) && openrouterApiKey.value && openrouterApiKey.value.startsWith('sk-')) {
      _apiKey = openrouterApiKey.value
      _baseURL = OpenaiEndpoint.OPENROUTER
    }

    return createFetch({
      baseUrl: _baseURL,

      options: {
        beforeFetch({ options }: any) {
          if (!options.headers)
            options.headers = {}
          if (_apiKey)
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
        create(body: MaybeRef<Record<string, any> & { stream?: boolean }> = {}, options: UseFetchOptions = {}) {
          const payload = computed(() => ({ model: _model.value, ...unref(body) }))
          const response = openai.value<OpenAI.Chat.ChatCompletion>('/chat/completions', options).post(payload)
          if (!payload.value.stream)
            return response.json()
          return response
        },
      },
    },
  }
}
