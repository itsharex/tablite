<script setup lang="ts">
import AdjustmentsHorizontal from '~icons/heroicons/adjustments-horizontal'
import Plus from '~icons/heroicons/plus'
import Trash from '~icons/heroicons/trash'

interface Filter {
  key: number
  column?: string
  operation?: string
  value?: string
  enable?: boolean
}

const props = defineProps<{
  columns: string[]
  backend: string
}>()

const emit = defineEmits(['apply'])

const OPERATIONS = [
  'equals',
  'not equals',
  'greater than or equals',
  'greater than',
  'less than or equals',
  'less than',
  'in',
  'like',
  'ilike',
  'contains',
]

const OPERATION_SQL: Record<string, any> = {
  'equals': Sql.EQUALS,
  'not equals': Sql.NOT_EQUALS,
  'greater than or equals': Sql.GREATER_THAN_OR_EQUALS,
  'greater than': Sql.GREATER_THAN,
  'less than or equals': Sql.LESS_THAN_OR_EQUALS,
  'less than': Sql.LESS_THAN,
  'in': Sql.IN,
  'like': Sql.LIKE,
  'ilike': Sql.ILIKE,
  'contains': Sql.CONTAINS,
}

const filters = ref<Filter[]>([])
const enabledFilters = ref<string[]>([])

watch(() => props.columns, () => {
  filters.value = []
  enabledFilters.value = []
})

function onAdd() {
  filters.value.push(createDefaults())
}

function createDefaults() {
  return {
    key: Date.now(),
    enable: true,
    column: props.columns[0],
    operation: 'equals',
  }
}

function onUpdateOpen() {
  if (!filters.value.length && props.columns.length)
    onAdd()
}

function onClear() {
  filters.value = []
  enabledFilters.value = []
  onApply()
  onUpdateOpen()
}

function onApply() {
  const sqls = filters.value.filter(item => item.column && item.operation && item.value && item.enable).map(item => [
    item.column,
    OPERATION_SQL[item.operation!]?.(item.value)[props.backend ?? 'mysql'],
  ].join(' '))

  enabledFilters.value = sqls
  emit('apply', sqls.join(' AND '))
}

function pluralFormatter() {
  if (enabledFilters.value.length > 1)
    return 'Filters'
  return 'Filter'
}
</script>

<template>
  <Popover @update:open="onUpdateOpen">
    <PopoverTrigger>
      <div class="flex items-center">
        <Button size="sm" class="rounded-r-none">
          <AdjustmentsHorizontal />
          {{ enabledFilters.length ? [enabledFilters.length, pluralFormatter()].join(' ') : 'Add filters' }}
        </Button>
      </div>
    </PopoverTrigger>

    <PopoverContent align="end" :side-offset="8" class="w-[36rem]">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <div v-for="item in filters" :key="item.key" class="flex gap-2 items-center">
            <Checkbox v-model:checked="item.enable" class="flex-shrink-0" />

            <Select v-model="item.column" class="focus-visible:ring-0">
              <SelectTrigger class="h-8 text-sm w-32 flex-shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="col in columns" :key="col" :value="col">
                    {{ col }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select v-model="item.operation" class="focus-visible:ring-0">
              <SelectTrigger class="h-8 text-sm w-32 flex-shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="operation in OPERATIONS" :key="operation" :value="operation">
                    {{ operation }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Input v-model="item.value" placeholder="Enter value" class="h-8 text-sm" />

            <Button v-if="filters.length > 1" size="icon" variant="ghost" class="h-8 px-2">
              <Trash />
            </Button>
          </div>
        </div>

        <div class="flex justify-between">
          <Button size="sm" variant="secondary" @click="onAdd">
            <Plus />
            Add filter
          </Button>

          <div class="flex gap-2.5">
            <Button size="sm" variant="ghost" @click="onClear">
              Clear
            </Button>

            <Button size="sm" @click="onApply">
              Apply
            </Button>
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
