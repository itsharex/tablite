<script setup lang="ts">
import type Database from '@tauri-apps/plugin-sql'
import * as monaco from 'monaco-editor'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import ExclamationTriangle from '~icons/heroicons/exclamation-triangle'
import PlaySolid from '~icons/heroicons/play-solid'

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
    <ResizablePanel :default-size="24" :min-size="10" :max-size="50">
      <div class="px-4 pt-8 flex gap-2.5 items-center cursor-default justify-between">
        <span class="text-xl font-semibold">Queries</span>
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
                ∂
                {{ error }}
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  </ResizablePanelGroup>
</template>
