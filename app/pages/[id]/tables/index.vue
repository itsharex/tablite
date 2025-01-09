<script setup lang="ts">
import type Database from '@tauri-apps/plugin-sql'
import AdjustmentsHorizontal from '~icons/heroicons/adjustments-horizontal'
import ChevronLeft from '~icons/heroicons/chevron-left'
import ChevronRight from '~icons/heroicons/chevron-right'

interface Position {
  x: number
  y: number
}

const cursor = inject<Ref<Database> | undefined>('__TABLITE:CURSOR', undefined)
const selectedTable = ref('')
const selectedCell = ref<Partial<Position>>({})
const { data, limit, offset, count, structure, schema, isLoading, setup, execute } = useTable(selectedTable, cursor)
const mode = ref('data')

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
      <TableSelector v-model:value="selectedTable" :cursor="cursor" :loading="isLoading" @after-select="onSelectTable" />
    </ResizablePanel>

    <ResizableHandle />

    <ResizablePanel class="h-full bg-white">
      <div v-show="selectedTable" class="flex flex-col h-full">
        <div class="px-4 pt-8 pb-2 flex justify-between items-center">
          <div class="ml-2 flex-1">
            <div class="font-semibold uppercase cursor-default">
              {{ selectedTable }}
            </div>

            <div class="flex my-px scale-75 origin-left gap-2">
              <Badge v-for="v in Object.values(schema)" :key="v" variant="outline" class="text-xs cursor-default">
                {{ v }}
              </Badge>
            </div>
          </div>

          <div class="flex gap-2">
            <Button size="sm">
              <AdjustmentsHorizontal />
              Add filters
            </Button>
          </div>
        </div>

        <Separator />

        <div class="w-full h-0 flex-1 flex flex-col bg-zinc-100">
          <div v-if="isLoading" />

          <div v-show="!isLoading" class="w-full h-0 overflow-auto overscroll-none grid items-start flex-1 gap-px text-xs cursor-default border-zinc-100" :style="{ gridAutoRows: '2rem', gridTemplateColumns: `repeat(${structure.length}, minmax(200px, 1fr))` }">
            <div v-for="col in structure" :key="col.columnName" class="sticky top-0 z-10 h-8 px-3 font-semibold flex items-center bg-zinc-50 shadow">
              {{ col.columnName }}
            </div>
            <template v-for="(row, y) in data">
              <div v-for="(col, x) in structure" :key="`${x}:${y}`" class="h-8 col-span-1 flex items-center text-zinc-800 hover:bg-zinc-200/50" :class="y % 2 ? 'bg-zinc-50' : 'bg-white'" @dblclick="onSelectCell(x, y)">
                <div class="truncate px-3">
                  <Badge v-if="['longblob'].includes(col.dataType)" size="sm" class="origin-left scale-75 text-xs uppercase">
                    {{ col.dataType }}
                  </Badge>

                  <span v-else-if="row[col.columnName] === ''" class="text-zinc-600/50">EMPTY</span>

                  <span v-else>{{ row[col.columnName] }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <Separator />

        <div class="flex-shrink-0 px-3 py-2 flex justify-between items-center relative z-10">
          <Tabs v-model="mode">
            <TabsList>
              <TabsTrigger value="data" class="px-3 text-xs">
                Data
              </TabsTrigger>
              <TabsTrigger value="structure" class="px-3 text-xs">
                Structure
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div class="text-xs flex justify-end items-center gap-1.5">
            <div class="mx-3">
              Page {{ page }} of {{ pageTotal }}
            </div>

            <Button variant="outline" size="icon" class="h-8 w-8 p-0" :disabled="page === 1 || isLoading" @click="onPaginationChange(page - 1)">
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="icon" class="h-8 w-8 p-0" :disabled="page === pageTotal || isLoading" @click="onPaginationChange(page + 1)">
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </ResizablePanel>
  </ResizablePanelGroup>
</template>
