<script setup lang="ts">
import { platform } from '@tauri-apps/plugin-os'
import { createDefu } from 'defu'
import { destr } from 'destr'
import ChevronUpDown from '~icons/heroicons/chevron-up-down'
import Sparkles from '~icons/heroicons/sparkles-solid'

const defu = createDefu((target: any, key, value) => {
  if (Array.isArray(value)) {
    target[key] = [...value, ...target.choices]
    return true
  }
})

const IS_MACOS = platform() === 'macos'

const _MODELS = [
  ...GOOGLE_AI_MODELS,
  ...DEEPSEEK_MODELS,
  ...OPENROUTER_MODELS,
]

const { model: _model } = storeToRefs(useSettingsStore())
const router = useRouter()
const messages = ref<OpenaiMessage[]>([])
const domRef = ref()
const { focused } = useFocus(domRef)
const { enter } = useMagicKeys()
const content = ref('')
const isLoading = ref(false)

const model = computed(() => _MODELS.find(m => m.model === _model.value))
const llm = useLlm(_model)
const { md } = useMdit()
const payload = computed(() => ({ messages: [{ role: 'user', content: content.value }], stream: true }))
const { response, execute, statusCode, isFetching } = llm.chat.completions.create(payload, { immediate: false })

watch(statusCode, (value) => {
  isLoading.value = false

  if (value !== 200)
    return

  if (response.value?.ok && response.value.body) {
    const reader = response.value.body.getReader()
    let data: Record<string, any> = {}
    reader.read().then(function processText({ done, value }) {
      if (done)
        return
      const text = new TextDecoder().decode(value)
      for (const i of text.split('\n').filter(Boolean)) {
        if (i.startsWith('data: ')) {
          if (i.replace('data:', '').trim() === '[DONE]')
            break
          data = defu(data, destr<any>(i.replace('data:', '').trim()))
        }
      }

      if (messages.value[messages.value.length - 1]?.role !== 'assistant')
        messages.value.push({ role: 'assistant', content: '' })

      messages.value[messages.value.length - 1]!.content = (data?.choices ?? []).map(({ delta }: any) => delta?.content ?? '').join('')
      reader.read().then(processText)
    })
  }
})

watch(enter!, (v) => {
  if (v && focused.value && content.value)
    onSend()
})

function onKeydown(event: any) {
  if (event.key === 'Enter')
    event.preventDefault()
}

async function onSend() {
  messages.value.push({
    role: 'user',
    content: content.value,
  })

  isLoading.value = true
  await execute()
  content.value = ''
}
</script>

<template>
  <Popover v-if="model">
    <PopoverTrigger as-child>
      <Button variant="ghost" size="sm" class="z-[101] h-8 hover:bg-zinc-200/50">
        <img :src="model.icon" class="size-4">
        <HyperText :text="model.alias ?? model.model" :duration="300" class="p-0 cursor-pointer" :class="[IS_MACOS ? 'text-[0.65rem]' : 'text-xs font-semibold']" />
        <ChevronUpDown class="size-4" />
      </Button>
    </PopoverTrigger>

    <PopoverContent class="w-96 mr-2 p-0 text-xs">
      <div :class="messages.length ? 'p-4' : 'pb-4'" class="max-h-96 overflow-y-auto flex flex-col gap-4">
        <div v-for="(item, index) in messages" :key="index" :class="item.role === 'user' ? 'rounded-md bg-muted py-1 px-2 ml-auto' : 'w-full'" class="flex">
          <img v-if="item.role === 'assistant'" :src="model.icon" class="size-4 mr-2 shrink-0">
          <div :class="item.role === 'assistant' ? 'mdit -my-3 w-0 flex-1' : ''" v-html="md.render(item.content)" />
        </div>

        <Spin v-if="isLoading" class="size-4" />
      </div>

      <div class="relative mx-4 mb-4">
        <Textarea ref="domRef" v-model="content" autofocus placeholder="Type your message here." :disabled="isFetching" class="w-full text-xs" @keydown="onKeydown" />

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
}
</style>
