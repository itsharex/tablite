<script setup lang="ts">
import ChevronLeft from '~icons/heroicons/chevron-left'
import ChevronRight from '~icons/heroicons/chevron-right'

interface Position {
  x: number
  y: number
}

const id = useRouteParams<string>('id')
const selectedTable = ref('')
const selectedCell = ref<Partial<Position>>({})
const { data, limit, offset, count, structure, isLoading, setup, execute } = useTable(selectedTable, id)

const page = computed({
  get() {
    return Math.floor(offset.value / limit.value) + 1
  },
  set(value: number) {
    offset.value = limit.value * (value - 1)
  },
})

const pageTotal = computed(() => Math.floor(count.value / limit.value) + 1)

async function onSelectTable() {
  page.value = 1
  await Promise.all([setup(), execute()])
}

async function onSelectCell(x: number, y: number) {
  selectedCell.value = { x, y }
}

async function onPaginationChange(value: number) {
  if (value < 1)
    return
  page.value = value
  await execute()
}
</script>

<template>
  <ResizablePanelGroup direction="horizontal" class="flex-1 h-full">
    <ResizablePanel :default-size="24" :min-size="10" :max-size="50">
      <DatabaseTableSelector v-model:value="selectedTable" :cnx-id="id" :loading="isLoading" @after-select="onSelectTable" />
    </ResizablePanel>

    <ResizableHandle />

    <ResizablePanel class="flex flex-col h-full">
      <div v-show="!isLoading" class="w-full h-0 overflow-auto overscroll-none grid items-start flex-1 gap-px text-xs cursor-default bg-zinc-100 border-zinc-100" :style="{ gridAutoRows: '2rem', gridTemplateColumns: `repeat(${structure.length}, 200px)` }">
        <div v-for="col in structure" :key="col.columnName" class="sticky top-0 z-10 h-8 px-3 font-semibold flex items-center bg-zinc-50 shadow">
          {{ col.columnName }}
        </div>
        <template v-for="(row, y) in data">
          <div v-for="(col, x) in structure" :key="`${x}:${y}`" class="h-8 col-span-1 flex items-center hover:bg-zinc-200/50" :class="y % 2 ? 'bg-zinc-50' : 'bg-white'" @dblclick="onSelectCell(x, y)">
            <div class="truncate px-3">
              <Badge v-if="['longblob'].includes(col.dataType)" class="origin-left scale-75 text-xs uppercase">
                {{ col.dataType }}
              </Badge>

              <span v-else>{{ row[col.columnName] }}</span>
            </div>
          </div>
        </template>
      </div>

      <Separator />

      <div class="flex-shrink-0 px-3 py-2 text-xs flex justify-end items-center gap-1.5 relative z-10">
        <div class="mx-3">
          Page {{ page }} of {{ pageTotal }}
        </div>

        <Button variant="outline" size="icon" class="h-8 w-8 p-0" :disabled="page === 1" @click="onPaginationChange(page - 1)">
          <ChevronLeft />
        </Button>
        <Button variant="outline" size="icon" class="h-8 w-8 p-0" :disabled="page === pageTotal" @click="onPaginationChange(page + 1)">
          <ChevronRight />
        </Button>
      </div>
    </ResizablePanel>
  </ResizablePanelGroup>
</template>
