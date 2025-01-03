<script setup lang="ts">
import ArrowLeft from '~icons/heroicons/arrow-left'
import TableCells from '~icons/heroicons/table-cells'

const router = useRouter()
const cnxId = useRouteParams<string>('cnxId')
const { tables } = useTables(cnxId)
const selectedTable = ref('')
const { data, columns, execute } = useTable(selectedTable, cnxId)

async function onSelectTable(t: string) {
  if (t === selectedTable.value)
    return
  selectedTable.value = t
  await execute()
}
</script>

<template>
  <div class="h-screen -mt-7">
    <ResizablePanelGroup direction="horizontal" class="flex-1 h-full">
      <ResizablePanel :default-size="28" :min-size="10" :max-size="50" class="overflow-y-auto">
        <div class="flex flex-col h-full">
          <div class="px-4 pt-9 flex gap-2.5 items-center cursor-pointer" @click="router.go(-1)">
            <ArrowLeft />
            <span class="text-xl font-semibold">Tables</span>
          </div>

          <div class="px-4 my-4">
            <Input class="h-8" placeholder="Search Tables" />
          </div>

          <div class="h-full overflow-y-auto pb-4">
            <div v-for="table in tables" :key="table" class="flex items-center justify-between text-sm gap-1.5 min-h-8 px-4 cursor-default text-zinc-600" :class="[selectedTable === table ? 'bg-zinc-200' : 'hover:bg-zinc-200/50']" @click="onSelectTable(table)">
              <TableCells class="flex-shrink-0" />
              <div class="flex-1 truncate">
                {{ table }}
              </div>
            </div>
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel class="relative overflow-auto flex flex-col w-full bg-white">
        <div class="grid flex-1 gap-px overflow-auto -mr-px text-xs bg-zinc-100 border-y border-zinc-100" :style="{ gridTemplateColumns: `repeat(${columns.length}, 200px)` }">
          <div v-for="col in columns" :key="col.Field" class="sticky top-0 h-8 px-3 flex items-center font-semibold bg-zinc-50 shadow">
            {{ col.Field }}
          </div>
          <template v-for="(row, y) in data">
            <div v-for="(col, x) in columns" :key="`${x}:${y}`" class="h-8 px-3 flex items-center truncate" :class="y % 2 ? 'bg-zinc-50' : 'bg-white'">
              {{ row[col.Field] }}
            </div>
          </template>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
</template>
