<script setup lang="ts">
import AdjustmentsHorizontal from '~icons/heroicons/adjustments-horizontal'
import Plus from '~icons/heroicons/plus'
import Trash from '~icons/heroicons/trash'

interface Filter {
  key: number
  column?: string
  operation?: string
  value?: string
}

const props = defineProps<{
  columns: string[]
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
] as const

const filters = ref<Filter[]>([])

watch(() => props.columns, () => {
  filters.value = []
})

function onAdd() {
  filters.value.push(createDefaults())
}

function createDefaults() {
  return {
    key: Date.now(),
    column: props.columns[0],
    operation: OPERATIONS[0],
  }
}

function onUpdateOpen() {
  if (!filters.value.length && props.columns.length)
    onAdd()
}

function onClear() {
  filters.value = []
  onUpdateOpen()
  onApply()
}

function onApply() {
  emit('apply', filters.value)
}
</script>

<template>
  <Popover @update:open="onUpdateOpen">
    <PopoverTrigger>
      <Button size="sm">
        <AdjustmentsHorizontal />
        Add filters
      </Button>
    </PopoverTrigger>

    <PopoverContent align="end" class="w-[42rem]">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <div v-for="item in filters" :key="item.key" class="flex gap-2">
            <Select v-model="item.column">
              <SelectTrigger class="h-8 text-sm w-72">
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

            <Select v-model="item.operation">
              <SelectTrigger class="h-8 text-sm w-72">
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

            <Button size="icon" variant="ghost" class="h-8 px-2">
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
