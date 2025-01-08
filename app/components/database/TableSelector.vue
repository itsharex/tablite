<script setup lang="ts">
import ArrowPath from '~icons/heroicons/arrow-path'
import TableCells from '~icons/heroicons/table-cells'

const props = defineProps<{
  value: string
  cnxId: string
  loading: boolean
}>()

const emit = defineEmits(['update:value', 'afterSelect'])

const value = useVModel(props, 'value', emit)

const { cnxId } = toRefs(props)
const { tables, isLoading, execute: reconnect } = useTables(cnxId)
const search = ref('')

const filtered = computed(() => tables.value.filter(e => e.includes(search.value)))

function onSelect(table: string) {
  value.value = table
  emit('afterSelect', table)
}
</script>

<template>
  <div class="h-full flex">
    <div class="flex-1 w-0 flex flex-col h-full">
      <div class="px-4 pt-8 flex gap-2.5 items-center cursor-default justify-between">
        <span class="text-xl font-semibold">Tables</span>

        <Button variant="ghost" size="icon" :disabled="isLoading" @click="reconnect">
          <ArrowPath :class="{ 'animate-spin': isLoading }" />
        </Button>
      </div>

      <div class="px-4 mt-6">
        <Input v-model="search" class="h-8 text-sm relative z-10" size="sm" placeholder="Search Tables" />
      </div>

      <div class="h-full relative overflow-y-auto pb-4">
        <div class="sticky top-0 h-4 bg-gradient-to-b from-zinc-50 to-transparent" />

        <div v-for="table in filtered" :key="table" class="flex items-center text-sm gap-1.5 min-h-8 px-4 cursor-default text-zinc-600" :class="[value === table ? 'bg-zinc-200' : 'hover:bg-zinc-200/50']" @click="onSelect(table)">
          <TableCells class="flex-shrink-0" />
          <div class="flex-1 truncate">
            {{ table }}
          </div>

          <svg v-if="value === table && loading" class="animate-spin h-4 w-4 text-zinc-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
