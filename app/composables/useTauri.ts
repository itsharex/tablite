export function useTauriStorage<T = unknown>(key: string, initialValue: MaybeRefOrGetter<T>) {
  return useStorageAsync(key, initialValue, createTrauriStorage('store.json'))
}
