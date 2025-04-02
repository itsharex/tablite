import { hash } from 'ohash'

export function useProvideContext(id: MaybeRef<string>) {
  const store = useConnectionStore()
  const { cursors, connections } = storeToRefs(store)
  const cursor = computed(() => cursors.value[unref(id)])
  const instance = ref<Database>()
  const useTablesReturn = useTables(instance)
  const driver = useCursorDriver(instance)

  watchEffect(async () => {
    if (connections.value.length)
      instance.value = await findCursorOrCreate()
  })

  async function findCursorOrCreate() {
    if (cursor.value?.instance)
      return cursor.value.instance
    const cnx = connections.value.find(e => hash(e.url) === unref(id))
    if (!cnx?.url)
      return
    await store.connect(cnx.url)
    return cursor.value?.instance
  }

  provide('__TABLITE:CURSOR', instance)
  provide('__TABLITE:DRIVER', driver)
  provide('__TABLITE:USE_TABLES', useTablesReturn)

  return {
    cursor: instance,
  }
}

export function useContext() {
  const cursor = inject<Ref<Database>>('__TABLITE:CURSOR')!
  const driver = inject<Ref<string>>('__TABLITE:DRIVER')!
  const useTablesReturn = inject<ReturnType<typeof useTables>>('__TABLITE:USE_TABLES')!

  return {
    cursor,
    driver,
    useTablesReturn,
  }
}
