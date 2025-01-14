<script setup lang="tsx">
import type { Table } from '@tanstack/vue-table'
import { FlexRender, getCoreRowModel, useVueTable } from '@tanstack/vue-table'
import { useVirtualizer } from '@tanstack/vue-virtual'
import VirtualGridBodyCell from './VirtualGridBodyCell.vue'
import VirtualGridHeaderCell from './VirtualGridHeaderCell.vue'

interface Column {
  name: string
  dataType: string
}

interface Position {
  rowIndex: number
  columnKey?: string
}

const props = defineProps<{
  columns: string[] | Column[]
  dataSource: Record<string, any>[]
  primaryKeys?: string[]
  editable?: boolean
}>()

const table = ref<Table<Record<string, any>>>()
const totalSize = ref(0)

const rows = computed(() => table.value?.getRowModel().rows ?? [])
const selected = ref<Position>({ rowIndex: -1 })

const columns = computed(() => props.columns.map((c) => {
  const key = typeof c === 'string' ? c : c.name
  const dataType = typeof c === 'string' ? 'varchar' : c.dataType

  return {
    accessorKey: key,
    size: 200,
    header: () => <VirtualGridHeaderCell value={key} primaryKeys={props.primaryKeys} />,
    cell: (inf: any) => <VirtualGridBodyCell value={inf.getValue()} dataType={dataType} editable={props.editable} isSelected={selected.value.columnKey === key && selected.value.rowIndex === inf.row.index} onClick={() => onSelectCell(inf.row.index, key)} />,
  }
}))

const domRef = ref<HTMLDivElement | null>(null)

const rowVirtualizerOptions = computed(() => {
  return {
    count: rows.value?.length ?? 0,
    estimateSize: () => 32,
    getScrollElement: () => domRef.value,
    overscan: 10,
  }
})

const rowVirtualizer = useVirtualizer(rowVirtualizerOptions)
const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems())

watchImmediate(props, async (props) => {
  table.value = useVueTable({
    get data() { return props.dataSource },
    columns: columns.value,
    getCoreRowModel: getCoreRowModel(),
    debugTable: false,
  })

  selected.value = { rowIndex: -1 }
  await nextTick()
  totalSize.value = rowVirtualizer.value.getTotalSize()
})

function onSelectCell(rowIndex: number, columnKey: string) {
  selected.value = { rowIndex, columnKey }
}
</script>

<template>
  <div ref="domRef" class="w-full overflow-auto flex-1 relative">
    <div :style="{ height: `${totalSize}px` }">
      <div class="relative text-xs">
        <div class="flex gap-px sticky top-0 z-10">
          <template v-for="headerGroup in table?.getHeaderGroups()" :key="headerGroup.id">
            <div
              v-for="header in headerGroup.headers"
              :key="header.id"
              :style="{ width: `${header.getSize()}px` }"
              class="flex-shrink-0 text-start h-8 flex items-center px-3 font-semibold shadow cursor-default bg-zinc-50"
            >
              <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
            </div>
          </template>
        </div>

        <div class="relative" :style="{ height: `${totalSize}px` }">
          <div v-for="vRow in virtualRows" :key="rows[vRow.index]!.id" :data-index="vRow.index" class="flex absolute w-full gap-px h-8 box-border border-b last:border-none border-zinc-100" :style="{ transform: `translateY(${vRow.start}px)` }">
            <div
              v-for="cell in rows[vRow.index]!.getVisibleCells()"
              :key="cell.id"
              :style="{ width: `${cell.column.getSize()}px` }"
              class="flex flex-shrink-0 w-0 justify-start h-full items-center cursor-default text-zinc-800 hover:bg-zinc-200/50"
              :class="[vRow.index % 2 ? 'bg-zinc-50' : 'bg-white']"
            >
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
