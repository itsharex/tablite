<script setup lang="ts">
import * as monaco from 'monaco-editor'
import PlaySolid from '~icons/heroicons/play-solid'

let editor: monaco.editor.IStandaloneCodeEditor

const domRef = ref()
const id = useRouteParams<string>('id')
const { name, code, isLoading, execute } = useQuery(id)

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
        <ResizablePanel :default-size="72" :min-size="25" class="w-full flex flex-col bg-white">
          <div class="flex justify-between items-center px-4 pt-8 pb-6">
            <input v-model="name" class="focus-visible:outline-none font-semibold" placeholder="Untitled Query" @click="($event: any) => $event.target.select()">

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

        <ResizablePanel class="bg-white">
          <div class="flex h-full items-center justify-center gap-2 text-sm cursor-default text-zinc-600/50">
            <span class="font-semibold">Run a query.</span>
            <span>Your results will display here.</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  </ResizablePanelGroup>
</template>
