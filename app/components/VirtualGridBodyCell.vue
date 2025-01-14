<script setup lang="tsx">
import { Badge } from '~/components/ui/badge'

const props = defineProps<{
  value: any
  dataType?: string
  editable?: boolean
}>()

const isBlob = computed(() => props.dataType?.includes('blob') || Array.isArray(props.value))
const isEmpty = computed(() => ['', undefined, null].includes(props.value))

const BlobCell = <Badge class="origin-left scale-75 text-xs">BLOB</Badge>
const EmptyCell = <input readonly class="placeholder-zinc-600/50 focus-visible:outline-none bg-transparent w-full h-full" placeholder="EMPTY" />
const DefaultCell = <span class="truncate select-text cursor-auto">{props.value}</span>

const component = computed(() => {
  if (isBlob.value)
    return BlobCell
  if (isEmpty.value)
    return EmptyCell
  return DefaultCell
})
</script>

<template>
  <component :is="component" />
</template>
