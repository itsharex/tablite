<script setup lang="ts">
import { toast } from 'vue-sonner'
import ArrowDownOnSquareStack from '~icons/heroicons/arrow-down-on-square-stack'
import ChevronLeft from '~icons/heroicons/chevron-left'
import ChevronRight from '~icons/heroicons/chevron-right'
import EllipsisHorizontal from '~icons/heroicons/ellipsis-horizontal'
import InformationCircle from '~icons/heroicons/information-circle'

interface Update {
  enable: boolean
  sql: string
}

definePageMeta({
  keepalive: true,
})

const cursor = inject<Ref<Database> | undefined>('__TABLITE:CURSOR', undefined)
const selectedTable = ref('')
const { data, limit, offset, count, structure, primaryKeys, isLoading, backend, where, setup, execute } = useTable(selectedTable, cursor)
const mode = ref('data')
const columns = computed(() => structure.value.map(({ columnName }) => columnName))
const changes = ref<Record<string, any>>({})
const updates = ref<Update[]>([])

const page = computed({
  get() {
    return Math.floor(offset.value / limit.value) + 1
  },
  set(value: number) {
    offset.value = limit.value * (value - 1)
  },
})

const dataTypeMap = computed(() => {
  const map: Record<string, string> = {}

  structure.value.forEach(({ columnName, dataType }) => {
    map[columnName] = dataType
  })

  return map
})

const pageTotal = computed(() => Math.floor(count.value / limit.value) + 1)

const hasChanged = computed(() => {
  for (const _t in changes.value) {
    const tc = changes.value[_t]
    for (const _k in tc) {
      if (Object.values(tc[_k] as Record<string, any[]>).some(e => e.length > 1))
        return true
    }
  }

  return false
})

async function onSelectTable() {
  toast.dismiss()
  if (!changes.value[selectedTable.value])
    changes.value[selectedTable.value] = {}
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
  where.value = value
  await onPaginationChange(1)
}

async function onDisvardChanges() {
  changes.value = selectedTable.value ? { [selectedTable.value]: {} } : {}
  toast.dismiss()
  await execute()
}

function onOpenUpdatesPreview(visible: boolean) {
  if (!visible)
    return

  toast.dismiss()

  const sqls: string[] = []

  for (const _t in changes.value) {
    const tc = changes.value[_t]
    for (const _k in tc) {
      try {
        const json = JSON.parse(_k)
        const where = Object.entries(json).map(([k, v]) => `${k} = ${normalizeQueryValue(v, dataTypeMap.value[k])}`).join(' AND ')
        const setter = Object.entries((tc[_k] ?? {}) as Record<string, any[]>).map(([k, [_, v]]) => `${k} = ${normalizeQueryValue(v, dataTypeMap.value[k])}`).join(', ')
        sqls.push(`UPDATE \`${_t}\` SET ${setter} WHERE ${where}`)
      }
      catch {
        continue
      }
    }
  }

  updates.value = sqls.map(sql => ({ enable: true, sql }))
}

async function onSave() {
  if (!updates.value.length)
    onOpenUpdatesPreview(true)
  changes.value = selectedTable.value ? { [selectedTable.value]: {} } : {}
  toast.dismiss()
  await execute()
}
</script>

<template>
  <div class="flex-1 h-full w-full flex flex-col">
    <ResizablePanelGroup direction="horizontal" class="h-0 flex-1 w-full">
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
            </div>

            <div class="flex gap-2">
              <TableFilter :columns="columns" :backend="backend" @apply="onApplyFliters" />

              <DropdownMenu>
                <DropdownMenuTrigger @click.stop>
                  <Button size="icon" variant="outline" class="w-8 h-8">
                    <EllipsisHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent :side-offset="8" class="mr-4">
                  <DropdownMenuItem class="text-xs">
                    <ArrowDownOnSquareStack />
                    <span>Export</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Separator />

          <div class="w-full h-0 flex-1 flex flex-col bg-zinc-50 -m-px">
            <VisTable v-model:changes="changes[selectedTable]" editable :columns="columns" :records="data" :primary-keys="primaryKeys" />
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

    <div v-if="hasChanged" class="w-full bg-white">
      <Separator />

      <div class="px-3 py-2 flex items-center justify-between">
        <span class="text-xs cursor-default flex items-center gap-1.5 text-zinc-800">
          <InformationCircle />
          You have unsaved changes
        </span>

        <div>
          <div class="flex gap-2.5">
            <Button size="sm" variant="ghost" @click="onDisvardChanges">
              Disvard Changes
            </Button>

            <div class="flex items-center">
              <Button size="sm" class="rounded-r-none" @click="onSave">
                Save
              </Button>
              <Popover @update:open="onOpenUpdatesPreview">
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
