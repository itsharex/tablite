export function useConnection(initialValue: string = '') {
  const url = ref(initialValue)
  const store = useConnectionStore()

  const isInvalidate = computed(() => !url.value)

  function connect() {
    return store.connect(url.value)
  }

  return {
    url,
    isInvalidate,
    connect,
  }
}
