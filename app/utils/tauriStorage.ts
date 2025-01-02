import type { StorageLikeAsync } from '@vueuse/core'
import { LazyStore } from '@tauri-apps/plugin-store'

export function createTrauriStorage(path: string): StorageLikeAsync {
  const store = new LazyStore(path)

  return {
    async getItem(key) {
      const value = await store.get<string>(key) ?? ''
      return value
    },

    async setItem(key, value) {
      await store.set(key, value)
    },

    async removeItem(key) {
      await store.delete(key)
    },
  }
}
