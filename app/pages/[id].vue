<script setup lang="ts">
import CodeBracket from '~icons/heroicons/code-bracket'
import TableCells from '~icons/heroicons/table-cells'

const route = useRoute()
const router = useRouter()

const tabs = [
  { key: 'id-tables', icon: TableCells },
  { key: 'id-queries', icon: CodeBracket },
]
</script>

<template>
  <div class="h-screen -mt-7 flex">
    <div class="w-[70px] flex flex-col gap-2.5 flex-shrink-0 border-r py-12 border-r-zinc-200">
      <div v-for="tab in tabs" :key="tab.key" class="flex items-center justify-center size-10 mx-auto rounded-md" :class="[route.name === tab.key ? 'text-zinc-600 bg-zinc-200' : 'text-zinc-600/50 hover:text-zinc-600']" @click="router.replace({ name: tab.key })">
        <component :is="tab.icon" class="flex-shrink-0 size-5" />
      </div>
    </div>

    <NuxtPage />
  </div>
</template>
