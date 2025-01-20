<script setup lang="ts">
import ArrowPath from '~icons/heroicons/arrow-path'
import TableCells from '~icons/heroicons/table-cells'

const props = defineProps<{
  value: string
  cursor?: Database
  loading: boolean
}>()

const emit = defineEmits(['update:value', 'afterSelect'])

const value = useVModel(props, 'value', emit)

const { cursor } = toRefs(props)
const domRef = ref()
const { tables, isLoading, execute: reconnect } = useTables(cursor)
const search = ref('')

const { y } = useScroll(domRef)

const filtered = computed(() => tables.value.filter(e => e.includes(search.value)))

function onSelect(table: string) {
  value.value = table
  emit('afterSelect', table)
}
</script>

<template>
  <div class="h-full flex">
    <div class="flex-1 w-0 flex flex-col h-full">
      <div class="px-4 pt-6 flex gap-2.5 items-center cursor-default justify-between">
        <span class="text-xl font-semibold">Tables</span>

        <div class="h-0">
          <Button variant="ghost" size="icon" class="-translate-y-1/2" :disabled="isLoading" @click="reconnect">
            <ArrowPath :class="{ 'animate-spin': isLoading }" />
          </Button>
        </div>
      </div>

      <div class="px-4 mt-6 pb-4 transition-all duration-150" :class="{ shadow: y > 6 }">
        <Input v-model="search" class="h-8 text-sm relative z-10" placeholder="Search tables" />
      </div>

      <div ref="domRef" class="h-full relative overflow-y-auto pb-4">
        <div v-for="table in filtered" :key="table" class="flex items-center text-sm gap-1.5 min-h-8 px-4 cursor-default text-zinc-600" :class="[value === table ? 'text-zinc-800 bg-zinc-200' : 'hover:bg-zinc-200/50']" @click="onSelect(table)">
          <TableCells class="flex-shrink-0" />
          <div class="flex-1 truncate">
            {{ table }}
          </div>

          <Spin v-if="value === table && loading" class="size-4" />
        </div>
      </div>
    </div>
  </div>
</template>
