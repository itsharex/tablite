import { hash } from 'ohash'

export const useSettingsStore = defineStore('settings', () => {
  const language = ref('en-US')
  const id = useRouteParams<string>('id')
  const { connections } = storeToRefs(useConnectionStore())

  const model = useTauriStorage<string>('default_model', '', 'data.json')
  const googleAPIKey = useTauriStorage<string>('google_api_key', '', 'data.json')
  const deepseekApiKey = useTauriStorage<string>('deekseek_api_key', '', 'data.json')
  const openrouterApiKey = useTauriStorage<string>('openrouter_api_key', '', 'data.json')

  const index = computed(() => connections.value.findIndex(({ url }) => hash(url) === id.value))

  const cnx = computed({
    get() {
      return connections.value[index.value]
    },
    set(value) {
      if (value)
        connections.value[index.value] = value
    },
  })

  const alias = computed({
    get() {
      return cnx.value?.alias
    },
    set(value) {
      cnx.value = { ...cnx.value!, alias: value ?? '' }
    },
  })

  const tags = computed({
    get() {
      return cnx.value?.tags
    },
    set(value) {
      cnx.value = { ...cnx.value!, tags: value ?? [] }
    },
  })

  return {
    language,
    alias,
    tags,
    model,
    googleAPIKey,
    deepseekApiKey,
    openrouterApiKey,
  }
})
