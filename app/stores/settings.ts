export const useSettingsStore = defineStore('settings', () => {
  const language = ref('en-US')
  const model = ref('gemini-2.0-flash')
  const googleAPIKey = useTauriStorage<string>('google_api_key', '', 'data.json')
  const deepseekApiKey = useTauriStorage<string>('deekseek_api_key', '', 'data.json')

  return {
    language,
    model,
    googleAPIKey,
    deepseekApiKey,
  }
})
