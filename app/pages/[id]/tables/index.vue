<script setup lang="ts">
import ChevronLeft from '~icons/heroicons/chevron-left'
import ChevronRight from '~icons/heroicons/chevron-right'

definePageMeta({
  keepalive: true,
})

const cursor = inject<Ref<Database> | undefined>('__TABLITE:CURSOR', undefined)
const selectedTable = ref('')
const { data, limit, offset, count, structure, schema, primaryKeys, isLoading, backend, where, setup, execute } = useTable(selectedTable, cursor)
const mode = ref('data')
const columns = computed(() => structure.value.map(({ columnName }) => columnName))

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
  await Promise.allSettled([setup(), execute()])
}

async function onPaginationChange(value: number) {
  if (value < 1)
    return
  page.value = value
  await execute()
}

async function onApplyFliters(value: string) {
  if (!value)
    where.value = ''
  else
    where.value = ['WHERE', value].join(' ')
  await onPaginationChange(1)
}
</script>

<template>
  <ResizablePanelGroup direction="horizontal" class="flex-1 h-full">
    <ResizablePanel :default-size="22" :min-size="10" :max-size="50">
      <TableSelector v-model:value="selectedTable" :cursor="cursor" :loading="isLoading" @after-select="onSelectTable" />
    </ResizablePanel>

    <ResizableHandle />

    <ResizablePanel class="h-full bg-white">
      <div v-show="selectedTable" class="flex flex-col h-full">
        <div class="p-4 flex justify-between items-center">
          <div class="ml-2 flex-1">
            <div class="font-semibold uppercase cursor-default">
              {{ selectedTable }}
            </div>

            <div v-if="!isLoading" class="flex my-px scale-75 origin-left gap-2 h-[22px]">
              <Badge v-for="v in Object.values(schema).filter(Boolean)" :key="v" variant="outline" class="text-xs cursor-default">
                {{ v }}
              </Badge>
            </div>
            <Skeleton v-else class="h-4 my-1 w-16 rounded-full" />
          </div>

          <div class="flex gap-2">
            <TableFilter :columns="columns" :backend="backend" @apply="onApplyFliters" />
          </div>
        </div>

        <Separator />

        <div class="w-full h-0 flex-1 flex flex-col bg-zinc-50 -m-px">
          <VisTable editable :columns="columns" :records="data" :primary-keys="primaryKeys" />
        </div>

        <Separator />

        <div class="flex-shrink-0 px-3 py-2 flex justify-between items-center relative z-10">
          <Tabs v-model="mode">
            <TabsList>
              <TabsTrigger value="data" class="px-3 py-1 text-xs font-normal">
                Data
              </TabsTrigger>
              <TabsTrigger value="structure" class="px-3 py-1 text-xs font-normal">
                Structure
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div class="text-xs flex justify-end items-center gap-3">
            <div>
              {{ [offset + 1, offset + data.length].join('-') }} of {{ count }} rows
            </div>

            <div class="flex gap-1.5">
              <Button size="icon" class="h-8 w-8 p-0" :disabled="page === 1 || isLoading" @click="onPaginationChange(page - 1)">
                <ChevronLeft />
              </Button>
              <Button size="icon" class="h-8 w-8 p-0" :disabled="page === pageTotal || isLoading" @click="onPaginationChange(page + 1)">
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ResizablePanel>
  </ResizablePanelGroup>
</template>
