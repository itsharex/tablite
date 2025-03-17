export const useAssistantStore = defineStore('assistant', () => {
  const system = ref('')

  return {
    system,
  }
})
