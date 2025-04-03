<script setup lang="ts">
import ArrowPath from '~icons/heroicons/arrow-path'
import EllipsisHorizontal from '~icons/heroicons/ellipsis-horizontal'
import TableCells from '~icons/heroicons/table-cells'
import Trash from '~icons/heroicons/trash'

const props = defineProps<{
  value: string
  cursor?: Database
  loading: boolean
}>()

const emit = defineEmits(['update:value', 'afterSelect', 'beforeRefresh', 'afterDelete'])

const value = useVModel(props, 'value', emit)

const { cursor } = toRefs(props)
const { useTablesReturn, driver } = useContext()
const { tables, isLoading, execute } = useTablesReturn
const domRef = ref()
const search = ref('')
const isOpen = ref([false])

const { y } = useScroll(domRef)

const filtered = computed(() => tables.value.filter(e => e.includes(search.value)))

function onSelect(table: string) {
  value.value = table
  emit('afterSelect', table)
}

async function onRefresh() {
  emit('beforeRefresh')
  await execute()
}

async function onDelete() {
  const sql = Sql.DROP_TABLE_IF_EXISTS(value.value)
  await useQuery(cursor).execute(sql[driver.value])
  value.value = ''
  emit('afterDelete')
  await execute()
}
</script>

<template>
  <div class="h-full flex">
    <div class="flex-1 w-0 flex flex-col h-full">
      <div class="px-4 pt-6 flex gap-2.5 items-center cursor-default justify-between">
        <span class="text-xl font-semibold">Tables</span>

        <div class="h-0">
          <Button variant="ghost" size="icon" class="-translate-y-1/2" :disabled="isLoading" @click="onRefresh">
            <ArrowPath :class="{ 'animate-spin': isLoading }" />
          </Button>
        </div>
      </div>

      <div class="px-4 mt-4 pb-4 transition-all duration-150" :class="{ 'shadow-sm': y > 6 }">
        <Input v-model="search" class="h-8 text-sm relative z-10" placeholder="Search tables" />
      </div>

      <div ref="domRef" class="h-full relative overflow-y-auto pb-4">
        <div v-for="table in filtered" :key="table" class="flex items-center text-sm gap-1.5 min-h-8 px-4 cursor-default text-zinc-600" :class="[value === table ? 'text-zinc-800 bg-zinc-200' : 'hover:bg-zinc-200/50']" @click="onSelect(table)">
          <TableCells class="shrink-0" />
          <div class="flex-1 truncate">
            {{ table }}
          </div>

          <Spin v-if="value === table && loading" class="size-4" />

          <DropdownMenu v-if="value === table && !loading">
            <DropdownMenuTrigger @click.stop>
              <EllipsisHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem class="text-xs" @click="isOpen[0] = true">
                <Trash />
                <span>Delete</span>
                <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>

    <AlertDialog v-model:open="isOpen[0]">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete <Button variant="link" class="p-0 h-0 text-zinc-600">
              {{ value }}
            </Button> and all its data from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="onDelete()">
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
