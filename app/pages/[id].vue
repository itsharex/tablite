<script setup lang="ts">
import CircleStack from '~icons/heroicons/circle-stack'
import CodeBracket from '~icons/heroicons/code-bracket'

const route = useRoute()
const router = useRouter()

const tabs = [
  { key: 'id-tables', icon: CircleStack },
  { key: 'id-queries', icon: CodeBracket },
]
</script>

<template>
  <div class="h-screen -mt-7 flex">
    <div class="w-[70px] flex flex-col gap-2.5 flex-shrink-0 border-r py-12 bg-zinc-800 border-r-zinc-200">
      <div v-for="tab in tabs" :key="tab.key" class="flex items-center justify-center size-10 mx-auto rounded-md" :class="[route.name === tab.key ? 'text-white bg-white/15' : 'text-white/50 hover:text-white/75']" @click="router.replace({ name: tab.key })">
        <component :is="tab.icon" class="flex-shrink-0 size-5" />
      </div>
    </div>

    <NuxtPage />
  </div>
</template>
