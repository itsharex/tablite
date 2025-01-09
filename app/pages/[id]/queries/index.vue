<script setup lang="ts">
import type Database from '@tauri-apps/plugin-sql'
import * as monaco from 'monaco-editor'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import ExclamationTriangle from '~icons/heroicons/exclamation-triangle'
import PlaySolid from '~icons/heroicons/play-solid'

definePageMeta({
  keepalive: true,
})

let editor: monaco.editor.IStandaloneCodeEditor

const domRef = ref()
const cursor = inject<Ref<Database> | undefined>('__TABLITE:CURSOR', undefined)
const { name, code, data, error, isSelect, isLoading, execute } = useQuery(cursor)

const columns = computed(() => {
  if (!Array.isArray(data.value))
    return []

  return Object.keys(data.value[0] ?? {})
})

function setup() {
  (globalThis as any).MonacoEnvironment = {
    getWorker() {
      return new EditorWorker()
    },
  }
}

setup()

onMounted(async () => {
  await nextTick()
  editor = monaco.editor.create(domRef.value, {
    value: '',
    language: 'sql',
    automaticLayout: true,

    minimap: {
      enabled: false,
    },
  })
})

async function onRun() {
  code.value = editor.getValue()
  await execute()
}
</script>

<template>
  <ResizablePanelGroup direction="horizontal" class="flex-1 h-full">
    <ResizablePanel :default-size="24" :min-size="16" :max-size="50">
      <div>
        <div class="px-4 pt-8 flex gap-2.5 items-center cursor-default justify-between">
          <span class="text-xl font-semibold">Queries</span>
        </div>

        <div class="px-4 mt-6 pb-4 transition-all duration-150">
          <Input class="h-8 text-sm relative z-10" placeholder="Search queries" />
        </div>

        <div class="p-6 flex flex-col gap-5 rounded-lg shadow mx-4 bg-white cursor-default">
          <div class="relative h-20 w-16 mx-auto">
            <span class="absolute left-0 top-0 z-10 flex h-20 w-16 items-center justify-center rounded-2xl bg-neutral-800 text-white/90 shadow transition-transform duration-300 ease-bounce group-hover:translate-x-2 group-hover:rotate-12 dark:bg-white dark:text-black/80">
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

          <Button class="mx-auto" variant="secondary">
            Create
          </Button>
        </div>
      </div>
    </ResizablePanel>

    <ResizableHandle />

    <ResizablePanel>
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel :default-size="60" :min-size="25" class="w-full flex flex-col bg-white">
          <div class="flex justify-between items-center px-4 pt-8 pb-6">
            <input v-model="name" class="focus-visible:outline-none font-semibold ml-2" placeholder="Untitled Query" @click="($event: any) => $event.target.select()">

            <div class="flex justify-end gap-2">
              <Button variant="secondary" size="sm" :disabled="!name">
                Save
              </Button>

              <Button size="sm" :disabled="isLoading" @click="onRun">
                <svg v-if="isLoading" class="animate-spin size-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>

                <PlaySolid v-else class="size-4" />

                <span>Run</span>
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

          <div v-if="isSelect && !error" class="h-0 flex flex-1 flex-col bg-zinc-100">
            <TableDataGrid :columns="columns" :data-source="data" />
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
