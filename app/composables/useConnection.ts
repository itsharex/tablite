export function useConnection(initialValue: string = '') {
  const url = ref(initialValue)
  const isPending = ref(false)
  const store = useConnectionStore()

  const isInvalidate = computed(() => !url.value)

  async function connect() {
    isPending.value = true
    const id = await store.connect(url.value)
    isPending.value = false
    return id
  }

  return {
    url,
    isInvalidate,
    isPending,
    connect,
  }
}
