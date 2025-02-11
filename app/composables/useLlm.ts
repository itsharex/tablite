import OpenAI from 'openai'

const MODELS = Object.keys(Model)

export function useLlm(model: MaybeRef<string>) {
  let _apiKey = ''
  let _baseURL = ''
  const _model = computed(() => unref(model))

  const store = useSettingsStore()
  const { googleAPIKey, deepseekApiKey } = storeToRefs(store)

  return computed(() => {
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

    return new OpenAI({
      apiKey: _apiKey,
      baseURL: _baseURL,
      dangerouslyAllowBrowser: true,
    })
  })
}
