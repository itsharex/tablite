<script setup lang="ts">
import type { Query } from '~/composables/useQuery'
import { platform } from '@tauri-apps/plugin-os'
import * as monaco from 'monaco-editor'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import Check from '~icons/heroicons/check'
import CheckCircle from '~icons/heroicons/check-circle'
import EllipsisHorizontal from '~icons/heroicons/ellipsis-horizontal'
import ExclamationTriangle from '~icons/heroicons/exclamation-triangle'
import PauseSolid from '~icons/heroicons/pause-solid'
import PencilSquare from '~icons/heroicons/pencil-square'
import PlaySolid from '~icons/heroicons/play-solid'
import Plus from '~icons/heroicons/plus'
import Sparkles from '~icons/heroicons/sparkles-solid'
import Tag from '~icons/heroicons/tag'
import Trash from '~icons/heroicons/trash'
import XMark from '~icons/heroicons/x-mark'

definePageMeta({
  keepalive: true,
})

defineAssistantContext({
  system: '',
})

let editor: monaco.editor.IStandaloneCodeEditor

const PLATFORM = platform()

const domRef = ref()
const { cursor, useTablesReturn } = useContext()
const { tables } = useTablesReturn
const id = useRouteParams<string>('id')
const queries = useTauriStorage<Query[]>('queries', [], `${unref(id)}/data.json`)
const selectedQueryIndex = ref(-1)

const selectedQuery = computed<Query>(() => {
  const defaults = { title: '', content: '' }
  if (selectedQueryIndex.value > -1)
    return queries.value?.[selectedQueryIndex.value] ?? defaults
  return defaults
})

const { title, code, data, error, timeToExecute, isSelect, isLoading, execute, abort } = useQuery(cursor, selectedQuery)
const transitionTimeToExecute = useTransition(timeToExecute)
const search = ref('')
const { meta, shift, s } = useMagicKeys()
const { steps, step: stepIndex, data: sql, prompt, isLoading: isGenerating, execute: generate } = useText2Sql({ cursor, tables })
const store = useSettingsStore()
const { model } = storeToRefs(store)

const filtered = computed(() => queries.value.filter(({ title }) => title?.includes(search.value)))
const upperKey = computed(() => PLATFORM === 'macos' ? meta?.value : shift?.value)
const isSaving = computed(() => upperKey.value && s?.value)

const columns = computed(() => {
  if (!Array.isArray(data.value))
    return []

  return Object.keys(data.value[0] ?? {})
})

watch(isSaving, (v, p) => {
  if (!p && v)
    onSave()
})

watch(selectedQueryIndex, () => {
  data.value = undefined
  error.value = undefined
})

function setup() {
  if (editor)
    return

  (globalThis as any).MonacoEnvironment = {
    getWorker() {
      return new EditorWorker()
    },
  }

  monaco.languages.registerCompletionItemProvider('sql', {
    async provideCompletionItems(model, position) {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      }).trim()

      const word = model.getWordUntilPosition(position)

      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }

      const PREV_TOKEN = textUntilPosition.split(' ').at(-2)?.toUpperCase() ?? ''

      if (['FROM', 'TABLE', 'JOIN', 'INTO', 'DESCRIBE', 'ON', 'UPDATE'].includes(PREV_TOKEN)) {
        return {
          suggestions: tables.value.map(keyword => ({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: `\`${keyword}\``,
            range,
          })),
        }
      }

      return {
        suggestions: SQL_KEYWORDS.map(keyword => ({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: `${keyword} `,
          range,
        })),
      }
    },
  })
}

setup()

onMounted(async () => {
  if (editor)
    return
  await nextTick()
  editor = monaco.editor.create(domRef.value, {
    value: '',
    language: 'sql',
    automaticLayout: true,
    contextmenu: false,

    minimap: {
      enabled: false,
    },
  })
})

async function onRun() {
  code.value = editor.getValue()
  await execute()
}

async function onSelect(index: number) {
  selectedQueryIndex.value = index
  await nextTick()
  editor.setValue(code.value)
}

function onSave() {
  if (!title.value)
    return
  const index = selectedQueryIndex.value
  code.value = editor.getValue()
  const query: Query = { title: title.value, content: btoa(code.value) }
  if (index > -1) {
    query.updatedAt = performance.now()
    queries.value[index] = query
  }
  else {
    queries.value.push(query)
    selectedQueryIndex.value = queries.value.length - 1
    query.createdAt = performance.now()
    query.updatedAt = performance.now()
  }
}

function onRemove(index: number) {
  queries.value.splice(index, 1)
  selectedQueryIndex.value = -1
  code.value = ''
  editor.setValue(code.value)
}

async function onGenerateSqlByLlm() {
  prompt.value = title.value
  generate()
}

watch(sql, (v) => {
  if (v) {
    code.value = v
    editor.setValue(code.value)
  }
})
</script>

<template>
  <ResizablePanelGroup direction="horizontal" class="flex-1 h-full">
    <ResizablePanel :default-size="22" :min-size="22" :max-size="50">
      <div>
        <div class="px-4 pt-6 flex gap-2.5 items-center cursor-default justify-between">
          <span class="text-xl font-semibold">Queries</span>

          <div class="h-0">
            <Button variant="ghost" size="icon" class="-translate-y-1/2" @click="onSelect(-1)">
              <Plus />
            </Button>
          </div>
        </div>

        <div class="px-4 mt-4 pb-4 transition-all duration-150">
          <Input v-model="search" class="h-8 text-sm relative z-10" placeholder="Search queries" />
        </div>

        <div v-if="!queries.length" class="p-6 flex flex-col gap-5 rounded-lg shadow-sm mx-4 bg-white cursor-default">
          <div class="relative h-20 w-16 mx-auto">
            <span class="absolute left-0 top-0 z-10 flex h-20 w-16 items-center justify-center rounded-2xl bg-neutral-800 text-white/90 shadow-sm transition-transform duration-300 ease-bounce group-hover:translate-x-2 group-hover:rotate-12 dark:bg-white dark:text-black/80">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 256 256">
                <path d="M237.2,151.87v0a47.1,47.1,0,0,0-2.35-5.45L193.26,51.8a7.82,7.82,0,0,0-1.66-2.44,32,32,0,0,0-45.26,0A8,8,0,0,0,144,55V80H112V55a8,8,0,0,0-2.34-5.66,32,32,0,0,0-45.26,0,7.82,7.82,0,0,0-1.66,2.44L21.15,146.4a47.1,47.1,0,0,0-2.35,5.45v0A48,48,0,1,0,112,168V96h32v72a48,48,0,1,0,93.2-16.13ZM76.71,59.75a16,16,0,0,1,19.29-1v73.51a47.9,47.9,0,0,0-46.79-9.92ZM64,200a32,32,0,1,1,32-32A32,32,0,0,1,64,200ZM160,58.74a16,16,0,0,1,19.29,1l27.5,62.58A47.9,47.9,0,0,0,160,132.25ZM192,200a32,32,0,1,1,32-32A32,32,0,0,1,192,200Z" />
              </svg>
            </span>
            <span class="absolute left-0 top-0 h-20 w-16 translate-x-2 rotate-12 rounded-2xl bg-neutral-600 transition-transform duration-300 ease-bounce group-hover:translate-x-0 group-hover:-rotate-3 dark:bg-neutral-300" />
          </div>

          <div class="text-center">
            <div class="mb-1 text-sm text-zinc-800">
              Create a Query
            </div>
            <div class="text-pretty text-xs font-light mx-auto text-zinc-800/50">
              Let's get started with something fun
            </div>
          </div>

          <Button class="mx-auto text-xs h-8" size="sm" variant="secondary">
            Create
          </Button>
        </div>

        <div v-for="(query, index) in filtered" :key="query.title" class="flex items-center text-sm gap-1.5 min-h-8 px-4 cursor-default text-zinc-600" :class="[selectedQueryIndex === index ? 'text-zinc-800 bg-zinc-200' : 'hover:bg-zinc-200/50']" @click="onSelect(index)">
          <Tag class="shrink-0" />
          <div class="flex-1 truncate">
            {{ query.title }}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger @click.stop>
              <EllipsisHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem class="text-xs" @click="onSelect(index)">
                <PencilSquare />
                <span>Edit</span>
                <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
              </DropdownMenuItem>

              <DropdownMenuItem class="text-xs" @click="onRemove(index)">
                <Trash />
                <span>Delete</span>
                <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </ResizablePanel>

    <ResizableHandle />

    <ResizablePanel>
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel :default-size="50" :min-size="25" class="w-full flex flex-col bg-white">
          <div class="flex justify-between items-center p-4">
            <Popover v-if="model" :open="isGenerating">
              <PopoverTrigger>
                <Button variant="ghost" size="icon" class="w-8 h-8" :disabled="!title" @click="onGenerateSqlByLlm">
                  <Sparkles />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" class="text-xs">
                <Stepper :model-value="stepIndex" orientation="vertical" class="mx-auto flex max-w-96 flex-col justify-start gap-4">
                  <StepperItem
                    v-for="(step, index) in steps"
                    :key="index"
                    v-slot="{ state }"
                    class="relative flex w-full items-start gap-4 text-xs"
                    :step="index"
                  >
                    <StepperSeparator
                      v-if="index !== steps.length - 1"
                      class="absolute left-[12px] top-[30px] block h-4 w-px shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-zinc-900"
                    />

                    <StepperTrigger as-child>
                      <Button
                        :variant="state === 'completed' ? 'default' : 'outline'"
                        size="icon"
                        class="z-10 rounded-full shrink-0 size-6"
                      >
                        <Check v-if="step.status === 'succeeded'" class="scale-75" />
                        <Spin v-if="step.status === 'running'" class="size-4" />
                        <XMark v-if="step.status === 'failed'" class="scale-75" />
                        <div v-if="step.status === 'pending'" class="bg-zinc-600/50 w-2 h-2 shrink-0 rounded-full" />
                      </Button>
                    </StepperTrigger>

                    <div class="flex flex-col gap-1">
                      <StepperTitle class="text-xs text-zinc-600 transition">
                        {{ step.title }}
                      </StepperTitle>

                      <StepperDescription class="text-xs text-zinc-600/50">
                        <div class="truncate w-52">
                          {{ step.description }}
                        </div>
                      </StepperDescription>
                    </div>
                  </StepperItem>
                </Stepper>
              </PopoverContent>
            </Popover>

            <input v-model="title" class="focus-visible:outline-hidden font-semibold mx-2 flex-1" :readonly="isGenerating" placeholder="Untitled Query">

            <div class="shrink-0 flex justify-end gap-2">
              <Button variant="secondary" size="sm" class="text-xs h-8" :disabled="!title || isSaving" @click="onSave">
                Save
              </Button>

              <Button size="sm" class="text-xs h-8" @click="isLoading ? abort() : onRun()">
                <component :is="isLoading ? PauseSolid : PlaySolid" />
                <span>{{ isLoading ? 'Pause' : 'Run' }}</span>
              </Button>
            </div>
          </div>

          <div ref="domRef" class="w-full h-0 flex-1" />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel class="h-0 flex flex-col bg-white">
          <div v-if="!data && !error" class="flex h-full items-center justify-center gap-2 text-sm cursor-default text-zinc-600/50">
            <span class="font-semibold">Run a query.</span>
            <span>Your results will display here.</span>
          </div>

          <div v-if="isSelect && !error" class="flex flex-1 flex-col bg-white">
            <div class="h-0 flex flex-1 flex-col -m-px bg-zinc-50">
              <VisTable :columns="columns" :records="data ?? []" />
            </div>

            <Separator />

            <span class="shrink-0 px-3 py-2 text-xs flex items-center justify-between">
              <span class="flex items-center gap-1">
                <CheckCircle class="size-4" />
                {{ transitionTimeToExecute.toFixed(0) }} ms
              </span>

              <span>
                {{ data?.length ?? 0 }} row return
              </span>
            </span>
          </div>

          <div v-if="error" class="w-full flex-1 flex items-center">
            <div class="mx-auto flex flex-col items-center justify-center gap-2">
              <ExclamationTriangle class="size-16" />

              <div class="text-sm text-zinc-600 font-semibold">
                Could not send query
              </div>

              <div class="text-xs max-w-md text-center text-zinc-600/50">
                {{ error }}
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  </ResizablePanelGroup>
</template>
