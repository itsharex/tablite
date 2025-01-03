<script setup lang="ts">
import ArrowLeft from '~icons/heroicons/arrow-left'
import TableCells from '~icons/heroicons/table-cells'

interface Position {
  x: number
  y: number
}

const router = useRouter()
const cnxId = useRouteParams<string>('id')
const { tables } = useTables(cnxId)
const selectedTable = ref('')
const selectedCell = ref<Partial<Position>>({})
const { data, columns, execute } = useTable(selectedTable, cnxId)

async function onSelectTable(t: string) {
  if (t === selectedTable.value)
    return
  selectedTable.value = t
  await execute()
}

async function onSelectCell(x: number, y: number) {
  selectedCell.value = { x, y }
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

          <div class="px-4 mt-4">
            <Input class="h-8" placeholder="Search Tables" />
          </div>

          <div class="h-full relative overflow-y-auto pb-4">
            <div class="sticky top-0 h-4 bg-gradient-to-b from-zinc-50 to-transparent" />

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

      <ResizablePanel class="bg-white">
        <div v-show="columns.length" class="w-full h-full overflow-auto grid flex-1 gap-px text-xs cursor-default bg-zinc-100 border-zinc-100" :style="{ gridTemplateColumns: Array.from({ length: columns.length }, () => '200px').join(' ') }">
          <div v-for="col in columns" :key="col.Field" class="sticky -mt-24 -top-24 h-32 bg-zinc-50 shadow">
            <div class="h-8 px-3 flex items-center font-semibold mt-24">
              {{ col.Field }}
            </div>
          </div>
          <template v-for="(row, y) in data">
            <div v-for="(col, x) in columns" :key="`${x}:${y}`" class="h-8 px-3 flex items-center hover:bg-zinc-200/50" :class="y % 2 ? 'bg-zinc-50' : 'bg-white'" @dblclick="onSelectCell(x, y)">
              <div class="truncate">
                {{ row[col.Field] }}
              </div>
            </div>
          </template>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
</template>
