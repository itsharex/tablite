<script setup lang="ts">
import { hash } from 'ohash'
import { toast } from 'vue-sonner'
import PencilSquare from '~icons/heroicons/pencil-square'
import Trash from '~icons/heroicons/trash'

const props = defineProps<{
  url: string
  alias?: string
  index: number
  tags?: string[]
}>()

const isLoading = ref(false)
const store = useConnectionStore()
const router = useRouter()
const { connections } = storeToRefs(store)
const id = computed(() => hash(props.url))

async function onConnect() {
  if (isLoading.value)
    return
  isLoading.value = true

  try {
    await store.connect(props.url)
    toast.dismiss()
    router.replace({ name: 'id-tables', params: { id: id.value } })
  }
  catch (error) {
    const options = { title: 'SQLX', description: String(error) }
    toast(options.title, { description: options.description })
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger>
      <Card class="cursor-pointer p-4 transition-all duration-150 hover:bg-zinc-100 relative overflow-hidden" @click="onConnect()">
        <div class="fade flex animate-fade items-center gap-2.5">
          <div class="w-0 justify-between flex-1">
            <CardTitle class="text-sm mb-1">
              <div class="truncate">
                {{ alias ?? url.split('://')[1] }}
              </div>
            </CardTitle>
            <CardDescription class="mt-px">
              <div class="origin-top-left uppercase flex items-center gap-1.5">
                <Badge
                  v-for="t in [url.split('://')[0], ...(tags ?? [])]"
                  :key="[url, t].join(':')"
                  class="h-4 px-2 text-[0.5rem]"
                >
                  {{ t }}
                </Badge>
              </div>
            </CardDescription>
          </div>
          <Spin v-if="isLoading" class="size-4" />
        </div>

        <DbLogo :value="url.split('://')[0]" class="size-[128px] absolute right-2 -top-6 text-primary/5" />
      </Card>
    </ContextMenuTrigger>

    <ContextMenuContent>
      <ContextMenuItem @select="router.replace({ name: 'id-settings', params: { id } })">
        <div class="flex items-center text-xs gap-2">
          <PencilSquare class="size-4" />
          <span>Edit</span>
        </div>
      </ContextMenuItem>

      <ContextMenuItem @select="connections.splice(index, 1)">
        <div class="flex items-center text-xs gap-2">
          <Trash class="size-4" />
          <span>Delete</span>
        </div>

        <ContextMenuShortcut>⌫</ContextMenuShortcut>
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
