export const useSettingsStore = defineStore('settings', () => {
  const language = ref('en-US')
  const googleAPIKey = useTauriStorage<string>('google_api_key', '', 'data.json')

  return {
    language,
    googleAPIKey,
  }
})
