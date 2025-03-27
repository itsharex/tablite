<script setup lang="ts">
import { platform } from '@tauri-apps/plugin-os'
import ChevronUpDown from '~icons/heroicons/chevron-up-down'
import Sparkles from '~icons/heroicons/sparkles-solid'

const IS_MACOS = platform() === 'macos'

const router = useRouter()
const domRef = ref()
const msgRefs = useTemplateRef('msgRef')
const isLoading = ref(false)
const { md } = useMdit()

const { model: modelKey } = storeToRefs(useSettingsStore())
const { system } = storeToRefs(useAssistantStore())
const model = computed(() => MODULES.find(m => m.model === modelKey.value))

const { data, prompt, messages, execute } = useStreamText({
  system,
  onFinish() {
    messages.value.push({
      role: 'assistant',
      content: data.value,
    })

    data.value = ''
    prompt.value = ''
    isLoading.value = false
  },
})

const conversation = computed(() => {
  return {
    messages: data.value ? [...messages.value, { role: 'assistant', content: data.value }] : messages.value,
  }
})

watch(conversation, () => {
  msgRefs.value?.at(-1)?.scrollIntoView({ behavior: 'smooth', block: 'end' })
})

watch(data, (cur, pre) => {
  if (cur && !pre)
    isLoading.value = false
})

function onKeydown(event: any) {
  if (event.key === 'Enter' && event.keyCode !== 229 && prompt.value)
    onSend()
}

async function onSend() {
  if (prompt.value.startsWith('/')) {
    if (prompt.value === '/clear')
      messages.value = []
    prompt.value = ''
    return
  }
  isLoading.value = true
  messages.value.push({
    role: 'user',
    content: prompt.value,
  })
  await execute()
}
</script>

<template>
  <Popover v-if="model">
    <PopoverTrigger as-child>
      <Button variant="ghost" size="sm" class="z-[101] h-8 hover:bg-zinc-200/50">
        <img :src="model.icon" class="size-4">
        <HyperText :text="model.alias || model.model || ''" :duration="300" class="p-0 cursor-pointer" :class="[IS_MACOS ? 'text-[0.65rem]' : 'text-xs font-semibold']" />
        <ChevronUpDown class="size-4" />
      </Button>
    </PopoverTrigger>

    <PopoverContent class="w-96 mr-2 p-0 text-xs">
      <div v-if="messages.length" class="px-4 pt-4 max-h-96 overflow-y-auto overflow-x-hidden flex flex-col">
        <div v-for="(item, index) in conversation.messages" ref="msgRef" :key="index" :class="item.role === 'user' ? 'ml-auto' : 'w-full'" class="pb-4">
          <div :class="item.role === 'user' ? 'rounded-md bg-muted py-1 px-2' : 'w-full'" class="flex">
            <img v-if="item.role === 'assistant'" :src="model.icon" class="size-4 mr-2 shrink-0">
            <div class="select-text" :class="item.role === 'assistant' ? 'mdit -my-3 w-0 flex-1' : ''" v-html="md.render(item.content as string)" />
          </div>
        </div>

        <Spin v-if="isLoading" class="size-4 mb-4" />
      </div>

      <div v-if="!messages.length" class="px-4 my-4 flex">
        <img :src="model.icon" class="size-4 mr-2 shrink-0">

        <div class="font-semibold">
          How can I assist you today?
        </div>
      </div>

      <div class="relative mx-4 mb-4">
        <Textarea ref="domRef" v-model="prompt" autofocus placeholder="Type your message here." :disabled="isLoading" class="w-full text-xs" @keydown="onKeydown" />

        <Badge class="h-4 px-2 text-[0.5rem] absolute bottom-2 left-2">
          Default
        </Badge>
      </div>
    </PopoverContent>
  </Popover>

  <Button v-else variant="ghost" size="sm" class="z-[101] h-8 w-8 p-0 hover:bg-zinc-200/50" @click="router.replace({ name: 'id-settings' })">
    <Sparkles />
  </Button>
</template>

<style>
.mdit > * {
  all: revert;
}

.mdit pre {
  padding: 12px 16px;
  border-radius: 6px;
  overflow: auto;
  margin: 8px 0;
}
</style>
