<script setup lang="ts">
const db = useRouteParams<string>('database')
const tables = useTables(db)
</script>

<template>
  <Separator />

  <ResizablePanelGroup direction="horizontal" class="flex-1">
    <ResizablePanel :default-size="25" :min-size="10" :max-size="50">
      <div class="p-2 text-sm">
        <div v-for="table in tables" :key="table" class="flex items-center justify-between">
          <div class="flex-1 truncate">
            {{ table }}
          </div>
        </div>
      </div>
    </ResizablePanel>

    <ResizableHandle />

    <ResizablePanel class="relative overflow-auto">
      <div class="grid grid-cols-1">
        <div>123</div>
      </div>
    </ResizablePanel>
  </ResizablePanelGroup>
</template>
