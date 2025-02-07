<script setup lang="ts">
import { platform } from '@tauri-apps/plugin-os'
import { hash } from 'ohash'
import CircleStack from '~icons/heroicons/circle-stack'
import CodeBracket from '~icons/heroicons/code-bracket'

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

const tabs = [
  { key: 'id-tables', icon: CircleStack },
  { key: 'id-queries', icon: CodeBracket },
]

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
  <div class="h-screen flex flex-col" :class="[IS_MACOS ? '-mt-12' : '-mt-8']">
    <div class="w-full p-2 flex-shrink-0 bg-zinc-50" :class="[IS_MACOS ? 'h-12' : 'h-8']">
      <div class="flex items-center h-full box-border" :class="{ 'pl-[72px]': IS_MACOS }">
        <Button v-if="IS_MACOS" variant="ghost" size="sm" class="z-[101] font-semibold px-4 uppercase align-middle hover:bg-zinc-200/50" @click="router.replace({ name: 'index' })">
          <span>TABLITE</span>
          <span class="-translate-y-px">/</span>
          <span class="text-zinc-600/50">{{ db }}</span>
        </Button>

        <div v-else class="z-[101] cursor-pointer flex items-center text-xs gap-1.5" @click="router.replace({ name: 'index' })">
          <img src="/images/tablite.png" class="w-5 select-none">
          <span>Tablite</span>
        </div>
      </div>
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
