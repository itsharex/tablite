export const useSettingsStore = defineStore('settings', () => {
  const language = ref('en-US')
  const model = useTauriStorage<string>('default_model', '', 'data.json')
  const googleAPIKey = useTauriStorage<string>('google_api_key', '', 'data.json')
  const deepseekApiKey = useTauriStorage<string>('deekseek_api_key', '', 'data.json')
  const openrouterApiKey = useTauriStorage<string>('openrouter_api_key', '', 'data.json')

  return {
    language,
    model,
    googleAPIKey,
    deepseekApiKey,
    openrouterApiKey,
  }
})
