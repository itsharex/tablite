import type { UseFetchOptions } from '@vueuse/core'
import type OpenAI from 'openai'
import { useFetch } from '@vueuse/core'

const _GOOGLE_AI_MODELS = GOOGLE_AI_MODELS.map(({ model }) => model)
const _DEEPSEEK_MODELS = DEEPSEEK_MODELS.map(({ model }) => model)
const _OPENROUTER_MODELS = OPENROUTER_MODELS.map(({ model }) => model)

export function useLlm(model: MaybeRef<string>) {
  const _model = computed(() => unref(model))

  const store = useSettingsStore()
  const { googleAPIKey, deepseekApiKey, openrouterApiKey } = storeToRefs(store)

  const openai = computed(() => {
    let _apiKey = ''
    let _endpoint = ''

    if (_GOOGLE_AI_MODELS.includes(_model.value) && googleAPIKey.value && googleAPIKey.value.startsWith('AIzaSy')) {
      _apiKey = googleAPIKey.value
      _endpoint = OpenaiEndpoint.GOOGLE
    }

    if (_DEEPSEEK_MODELS.includes(_model.value) && deepseekApiKey.value && deepseekApiKey.value.startsWith('sk-')) {
      _apiKey = deepseekApiKey.value
      _endpoint = OpenaiEndpoint.DEEPSEEK
    }

    if (_OPENROUTER_MODELS.includes(_model.value) && openrouterApiKey.value && openrouterApiKey.value.startsWith('sk-')) {
      _apiKey = openrouterApiKey.value
      _endpoint = OpenaiEndpoint.OPENROUTER
    }

    return {
      endpoint: _endpoint,
      apiKey: _apiKey,
    }
  })

  return {
    chat: {
      completions: {
        create(body: MaybeRef<Record<string, any> & { stream?: boolean }> = {}, options: UseFetchOptions = {}) {
          const payload = computed(() => ({ model: _model.value, ...unref(body) }))
          const url = computed(() => `${openai.value.endpoint}/chat/completions`)

          return useFetch<OpenAI.Chat.ChatCompletion>(url, {
            beforeFetch({ options }: any) {
              if (!options.headers)
                options.headers = {}
              if (openai.value.apiKey)
                options.headers.Authorization = `Bearer ${openai.value.apiKey}`
              return { options }
            },
            ...options,
          }).post(payload).json()
        },
      },
    },
  }
}
