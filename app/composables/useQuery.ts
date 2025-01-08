export function useQuery(id: MaybeRef<string>) {
  const name = ref('')
  const code = ref('')
  const store = useConnectionStore()
  const { cursors, connections } = storeToRefs(store)
  const cnxId = computed(() => unref(id))
  const cur = computed(() => cursors.value[cnxId.value])
  const data = ref<any>()
  const error = ref()
  const isLoading = ref(false)

  async function findCurOrCreate() {
    if (cur.value?.instance)
      return cur.value.instance
    const cnx = connections.value.find(e => e.id === cnxId.value)
    if (!cnx?.url)
      return
    await store.connect(cnx.url)
    return cur.value?.instance
  }

  async function execute() {
    if (!code.value)
      return

    try {
      isLoading.value = true
      const instance = await findCurOrCreate()
      if (!instance)
        return
      data.value = await instance.execute(code.value)
    }
    catch (e) {
      error.value = e
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    name,
    code,
    data,
    error,
    isLoading,
    execute,
  }
}
