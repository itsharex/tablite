<script setup lang="ts">
import { platform } from '@tauri-apps/plugin-os'
import { hash } from 'ohash'
import CircleStack from '~icons/heroicons/circle-stack'
import CodeBracket from '~icons/heroicons/code-bracket'
import Cog6Tooth from '~icons/heroicons/cog-6-tooth'

definePageMeta({
  keepalive: true,
})

const IS_MACOS = platform() === 'macos'

const route = useRoute()
const router = useRouter()
const id = useRouteParams<string>('id')
const store = useConnectionStore()
const { cursors, connections } = storeToRefs(store)
const cursor = computed(() => cursors.value[id.value])
const instance = ref<Database | undefined>(undefined)
const db = computed(() => parseConnectionURL(instance.value?.path).database)
const { isFullscreen } = useTauriWindow()

const tabs = computed(() => [
  cursor.value ? { key: 'id-tables', icon: CircleStack } : undefined,
  cursor.value ? { key: 'id-queries', icon: CodeBracket } : undefined,
  { key: 'id-settings', icon: Cog6Tooth },
].filter(Boolean) as any[])

async function findCursorOrCreate() {
  if (cursor.value?.instance)
    return cursor.value.instance
  const cnx = connections.value.find(e => hash(e.url) === id.value)
  if (!cnx?.url)
    return
  await store.connect(cnx.url)
  return cursor.value?.instance
}

const abort = watchImmediate(connections, async (cnxs) => {
  if (cnxs.length) {
    instance.value = await findCursorOrCreate()
    abort()
  }
})

provide('__TABLITE:CURSOR', instance)

preloadRouteComponents({ name: 'id-queries' })
</script>

<template>
  <div class="h-screen flex flex-col" :class="[IS_MACOS ? '-mt-12' : '-mt-20']">
    <Separator v-if="!IS_MACOS" class="mt-8 z-[101]" />
    <div class="w-full p-2 flex justify-between items-center flex-shrink-0 h-12">
      <div class="flex items-center h-full box-border" :class="{ 'pl-[72px]': IS_MACOS && !isFullscreen }">
        <Button variant="ghost" size="sm" class="z-[101] font-semibold px-4 uppercase align-middle hover:bg-zinc-200/50" @click="router.replace({ name: 'index' })">
          <span>TABLITE</span>
          <span v-if="db" class="-translate-y-px">/</span>
          <span v-if="db" class="text-zinc-600/50">{{ db }}</span>
        </Button>
      </div>

      <AsssistantPopover />
    </div>

    <Separator />

    <div class="flex flex-1 h-0">
      <div class="flex flex-col items-center flex-shrink-0 border-r border-r-zinc-200 bg-zinc-100">
        <div v-for="tab in tabs" :key="tab.key" class="flex items-center cursor-pointer justify-center relative" :class="[route.name === tab.key ? 'bg-zinc-200 text-zinc-600' : 'text-zinc-600/50 hover:text-zinc-600']" @click="router.replace({ name: tab.key })">
          <component :is="tab.icon" class="flex-shrink-0 size-[18px] m-4" />
          <div v-if="route.name === tab.key" class="absolute top-0 bottom-0 left-0 w-0.5 bg-zinc-800" />
        </div>
      </div>

      <NuxtPage />
    </div>
  </div>
</template>
