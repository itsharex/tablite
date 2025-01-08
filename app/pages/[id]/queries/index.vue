<script setup lang="ts">
import * as monaco from 'monaco-editor'
import PlaySolid from '~icons/heroicons/play-solid'

// eslint-disable-next-line unused-imports/no-unused-vars
let editor

const domRef = ref()
const code = ref('')

onMounted(async () => {
  await nextTick()
  editor = monaco.editor.create(domRef.value, {
    value: code.value,
    language: 'sql',

    minimap: {
      enabled: false,
    },
  })
})
</script>

<template>
  <ResizablePanelGroup direction="horizontal" class="flex-1 h-full">
    <ResizablePanel :default-size="24" :min-size="10" :max-size="50">
      <div class="px-4 pt-8 flex gap-2.5 items-center cursor-default justify-between">
        <span class="text-xl font-semibold">Queries</span>
      </div>
    </ResizablePanel>

    <ResizableHandle />

    <ResizablePanel class="w-full flex flex-col bg-white">
      <div class="flex justify-between items-center px-4 pt-8 pb-6">
        <div>
          Untitled Query
        </div>

        <div class="flex justify-end gap-2">
          <Button variant="secondary" size="sm" class="cursor-default">
            Save
          </Button>

          <Button size="sm" class="cursor-default">
            <PlaySolid class="size-4" />
            <span>Run</span>
          </Button>
        </div>
      </div>

      <div ref="domRef" class="w-full h-0 flex-1" />
    </ResizablePanel>
  </ResizablePanelGroup>
</template>
