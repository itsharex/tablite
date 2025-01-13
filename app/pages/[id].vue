<script setup lang="ts">
import type Database from '@tauri-apps/plugin-sql'
import { hash } from 'ohash'
import CircleStack from '~icons/heroicons/circle-stack'
import CodeBracket from '~icons/heroicons/code-bracket'
import Squares2x2 from '~icons/heroicons/squares-2x2-solid'

definePageMeta({
  keepalive: true,
})

const route = useRoute()
const router = useRouter()
const id = useRouteParams<string>('id')
const store = useConnectionStore()
const { cursors, connections } = storeToRefs(store)
const cursor = computed(() => cursors.value[id.value])
const instance = ref<Database | undefined>(undefined)

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
  <div class="h-screen -mt-7 flex">
    <div class="w-[70px] flex flex-col justify-between items-center flex-shrink-0 border-r pt-12 pb-4 bg-zinc-800 border-r-zinc-200">
      <div class="flex flex-col items-center gap-2 flex-1">
        <div v-for="tab in tabs" :key="tab.key" class="flex items-center cursor-pointer justify-center size-11 mx-auto rounded-md" :class="[route.name === tab.key ? 'text-white bg-white/15' : 'text-white/50 hover:text-white/75']" @click="router.replace({ name: tab.key })">
          <component :is="tab.icon" class="flex-shrink-0 size-5" />
        </div>
      </div>

      <div class="flex-shrink-0">
        <div class="flex items-center cursor-pointer justify-center size-11 mx-auto text-white/50 hover:text-white/75" @click="router.replace({ name: 'index' })">
          <Squares2x2 class="size-5" />
        </div>
      </div>
    </div>

    <NuxtPage />
  </div>
</template>
