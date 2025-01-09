<script setup lang="ts">
defineProps<{
  columns: string[]
  dataSource: Record<string, any>[]
}>()

function isBlob(value: any) {
  return Array.isArray(value)
}
</script>

<template>
  <div class="w-full h-0 overflow-auto overscroll-none grid items-start flex-1 gap-px text-xs cursor-default border-zinc-100" :style="{ gridAutoRows: '2rem', gridTemplateColumns: `repeat(${columns.length}, minmax(200px, 1fr))` }">
    <div v-for="col in columns" :key="col" class="sticky top-0 z-10 h-8 px-3 font-semibold flex items-center bg-zinc-50 shadow">
      {{ col }}
    </div>

    <template v-for="(row, y) in dataSource">
      <div v-for="(col, x) in columns" :key="`${x}:${y}`" class="h-8 col-span-1 flex items-center text-zinc-800 hover:bg-zinc-200/50" :class="y % 2 ? 'bg-zinc-50' : 'bg-white'">
        <div class="truncate px-3">
          <Badge v-if="isBlob(row[col])" size="sm" class="origin-left scale-75 text-xs uppercase">
            blob
          </Badge>

          <span v-else-if="row[col] === ''" class="text-zinc-600/50">EMPTY</span>

          <span v-else>{{ row[col] }}</span>
        </div>
      </div>
    </template>
  </div>
</template>
