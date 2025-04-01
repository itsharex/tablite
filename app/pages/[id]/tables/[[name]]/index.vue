<script setup lang="ts">
import { toast } from 'vue-sonner'
import ArrowDownOnSquareStack from '~icons/heroicons/arrow-down-on-square-stack'
import ChevronLeft from '~icons/heroicons/chevron-left'
import ChevronRight from '~icons/heroicons/chevron-right'
import EllipsisHorizontal from '~icons/heroicons/ellipsis-horizontal'
import InformationCircle from '~icons/heroicons/information-circle'
import Plus from '~icons/heroicons/plus'
import { useTableChanges } from '~/composables/useTableChanges'

definePageMeta({
  key: route => route.name! as string,
})

const cursor = inject<Ref<Database> | undefined>('__TABLITE:CURSOR', undefined)
const table = useRouteParams<string>('name', '')
const { data, limit, offset, count, structure, primaryKeys, isLoading, backend, where, execute } = useTable(table, cursor)
const columns = computed(() => structure.value.map(({ columnName }) => columnName))
const selectedRowKeys = ref([])
const isReady = computed(() => !!unref(cursor))

const { changes, updates, inserts, deletes, disvard, clear } = useTableChanges(table, {
  structure,

  async afterDisvard() {
    toast.dismiss()
    await execute()
  },
})

watchImmediate(() => [isReady.value, table.value], async ([v, t]) => {
  if (v && t) {
    defineAssistantContext({
      async system() {
        const prompt = await generateTableSchemaPromptWithIndexRows([t as string], cursor!.value, { limit: 10 })
        return usePromptTemplate(TABLE_ASSISTANT_SYSTEM_PROMPT, {
          tableInfo: prompt,
        })
      },
    })
  }
})

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
  toast.dismiss()
  page.value = 1
  clear()
  where.value = ''
}

async function onPaginationChange(value: number) {
  if (value < 1)
    return
  page.value = value
  await execute()
}

async function onApplyFliters(value: string) {
  where.value = value
  await onPaginationChange(1)
}

function _execute(value: string) {
  const { code, execute } = useQuery(cursor, { content: '' })
  code.value = value
  return execute()
}

async function applyUpdates() {
  try {
    const tasks = updates.value.filter(({ enable }) => enable).map(({ sql }) => _execute(sql))
    await Promise.all(tasks)
  }
  catch (error) {
    toast('SQLX', { description: String(error) })
  }
}

async function onSave() {
  toast.dismiss()
  await applyUpdates()
  await execute()
  clear()
  selectedRowKeys.value = []
}

function onDeleteRecords() {
  deletes.value = []

  for (const key of selectedRowKeys.value) {
    if (typeof key === 'number')
      inserts.value.splice(key, 1)
    else
      deletes.value.push(key)
  }
}
</script>

<template>
  <div class="flex-1 h-full w-full flex flex-col">
    <ResizablePanelGroup direction="horizontal" class="h-0 flex-1 w-full">
      <ResizablePanel :default-size="22" :min-size="10" :max-size="50">
        <TableSelector v-model:value="table" :cursor="cursor" :loading="isLoading" @after-select="onSelectTable" @after-delete="onSelectTable" />
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel class="h-full bg-white">
        <div v-if="!table" class="w-full h-full flex items-center justify-center flex-col cursor-default">
          <TextHoverEffect class="w-1/2 px-1" :stroke-width="1" text="TABLITE" />
        </div>

        <div v-show="table" class="flex flex-col h-full">
          <div class="p-4 flex justify-between items-center">
            <div class="ml-2 flex-1">
              <div class="font-semibold uppercase cursor-default">
                {{ table }}
              </div>
            </div>

            <div class="flex gap-2.5">
              <Button v-if="selectedRowKeys.length" variant="ghost" size="sm" class="text-xs h-8" @click="onDeleteRecords">
                Delete {{ selectedRowKeys.length }} {{ selectedRowKeys.length > 1 ? 'Records' : 'Record' }}
              </Button>

              <div class="flex">
                <TableFilter :columns="columns" :backend="backend" @apply="onApplyFliters" />

                <DropdownMenu>
                  <DropdownMenuTrigger @click.stop>
                    <Button size="icon" class="w-8 h-8 rounded-l-none">
                      <EllipsisHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent :side-offset="8" class="mr-4">
                    <DropdownMenuItem class="text-xs" @click="inserts.unshift({})">
                      <Plus />
                      <span>Add Row</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem class="text-xs">
                      <ArrowDownOnSquareStack />
                      <span>Export</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <Separator />

          <div class="w-full h-0 flex-1 flex flex-col bg-zinc-50 -m-px">
            <VisTable
              v-model:changes="changes[table]"
              v-model:inserts="inserts"
              v-model:selected-row-keys="selectedRowKeys"
              editable
              :columns="columns"
              :records="data"
              :deletes="deletes"
              :primary-keys="primaryKeys"
            />
          </div>

          <Separator />

          <div class="flex-shrink-0 px-3 py-2 flex justify-between items-center relative z-10">
            <Tabs default-value="id-tables-name-index">
              <TabsList>
                <TabsTrigger value="id-tables-name-index" class="px-3 py-1 text-xs font-normal">
                  Data
                </TabsTrigger>
                <TabsTrigger value="id-tables-name-structure" class="px-3 py-1 text-xs font-normal">
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

    <div v-if="updates.length" class="w-full bg-white">
      <Separator />

      <div class="px-3 py-2 flex items-center justify-between">
        <span class="text-xs cursor-default flex items-center gap-1.5 text-zinc-800">
          <InformationCircle />
          You have unsaved changes
        </span>

        <div>
          <div class="flex gap-2.5">
            <Button size="sm" variant="ghost" class="text-xs h-8" @click="disvard()">
              Disvard Changes
            </Button>

            <div class="flex items-center">
              <Button size="sm" class="rounded-r-none text-xs h-8" @click="onSave">
                Save
              </Button>
              <Popover @update:open="toast.dismiss()">
                <PopoverTrigger>
                  <Button size="icon" class="rounded-l-none h-8 w-8">
                    <EllipsisHorizontal />
                  </Button>
                </PopoverTrigger>

                <PopoverContent align="end" :side-offset="8" class="w-[33.5rem] py-0 overflow-y-auto max-h-48">
                  <div class="w-full flex flex-col my-4 gap-2">
                    <div v-for="(update, index) in updates" :key="index" class="flex gap-2 items-center">
                      <Checkbox v-model:checked="update.enable" class="flex-shrink-0" />
                      <Input v-model="update.sql" placeholder="Enter query" :readonly="!update.enable" class="h-8 text-xs focus-visible:ring-0" :class="{ 'bg-zinc-50 text-zinc-600/50': !update.enable }" />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
