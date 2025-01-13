<script setup lang="tsx">
import type { Table } from '@tanstack/vue-table'
import { FlexRender, getCoreRowModel, useVueTable } from '@tanstack/vue-table'
import { useVirtualizer } from '@tanstack/vue-virtual'
import Key from '~icons/heroicons/key'
import { Badge } from '~/components/ui/badge'

const props = defineProps<{
  columns: string[]
  dataSource: Record<string, any>[]
  primaryKey?: string[]
}>()

const table = ref<Table<Record<string, any>>>()
const totalSize = ref(0)

const rows = computed(() => table.value?.getRowModel().rows ?? [])

const columns = computed(() => props.columns.map(v => ({
  accessorKey: v,
  size: 200,

  header: () => (
    <div class="flex items-center justify-between w-full">
      <span>{v}</span>
      {props.primaryKey?.includes(v) && <Key class="size-3" />}
    </div>
  ),

  cell(inf: any) {
    const v: any = inf.getValue()
    if (isBlob(v))
      return <Badge v-if="isBlob(row[col])" class="origin-left scale-75 text-xs">BLOB</Badge>
    if (v === '')
      return <span class="text-zinc-600/50">EMPTY</span>
    return <span class="truncate">{v}</span>
  },
})))

const domRef = ref<HTMLDivElement | null>(null)

const rowVirtualizerOptions = computed(() => {
  return {
    count: rows.value?.length ?? 0,
    estimateSize: () => 32,
    getScrollElement: () => domRef.value,
    overscan: 50,
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

  await nextTick()
  totalSize.value = rowVirtualizer.value.getTotalSize()
})

function measureElement(el?: Element) {
  if (!el) {
    return
  }

  rowVirtualizer.value.measureElement(el)

  return undefined
}

function isBlob(value: any) {
  return Array.isArray(value)
}
</script>

<template>
  <div ref="domRef" class="w-full overflow-auto flex-1 relative">
    <div :style="{ height: `${totalSize}px` }">
      <table class="grid text-xs">
        <thead class="grid sticky top-0 z-10">
          <tr
            v-for="headerGroup in table?.getHeaderGroups()"
            :key="headerGroup.id"
            class="flex w-full gap-px"
          >
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              :colspan="header.colSpan"
              :style="{ width: `${header.getSize()}px` }"
              class="text-start h-8 flex items-center px-3 font-semibold shadow cursor-default bg-zinc-50"
            >
              <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
            </th>
          </tr>
        </thead>

        <tbody
          :style="{ height: `${totalSize}px` }"
          class="grid gap-px relative"
        >
          <tr
            v-for="vRow in virtualRows"
            :ref="measureElement /*measure dynamic row height*/"
            :key="rows[vRow.index]!.id"
            :data-index="vRow.index"
            class="flex absolute w-full gap-px"
            :style="{ transform: `translateY(${vRow.start}px)` }"
          >
            <td
              v-for="cell in rows[vRow.index]!.getVisibleCells()"
              :key="cell.id"
              :style="{ width: `${cell.column.getSize()}px` }"
              class="flex w-0 justify-start px-3 h-8 items-center cursor-default text-zinc-800 hover:bg-zinc-200/50"
              :class="[vRow.index % 2 ? 'bg-zinc-50' : 'bg-white']"
            >
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
