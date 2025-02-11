import { getCurrentWindow } from '@tauri-apps/api/window'

export function useTauriStorage<T = unknown>(key: string, initialValue: MaybeRefOrGetter<T>, file: string) {
  return useStorageAsync(key, initialValue, createTrauriStorage(file))
}

export function useTauriWindow() {
  const window = ref(getCurrentWindow())
  const isFullscreen = ref(false)

  let unlisten: any

  onMounted(async () => {
    unlisten = await window.value.listen('tauri://resize', async () => {
      isFullscreen.value = await window.value.isFullscreen()
    })
  })

  onUnmounted(() => {
    unlisten?.()
  })

  return {
    window,
    isFullscreen,
  }
}
