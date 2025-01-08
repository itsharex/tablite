import { getCurrentWindow } from '@tauri-apps/api/window'

export function useTauriStorage<T = unknown>(key: string, initialValue: MaybeRefOrGetter<T>, file: string = 'store.json') {
  return useStorageAsync(key, initialValue, createTrauriStorage(file))
}

export function useTauriWindow() {
  const window = ref(getCurrentWindow())
  const isFullscreen = ref(false)

  async function setup() {
    isFullscreen.value = await window.value.isFullscreen()
  }

  setup()

  return {
    window,
    isFullscreen,
  }
}
