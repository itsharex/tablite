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
const EmptyCell = <span class="text-zinc-600/50">EMPTY</span>
const DefaultCell = <span class="truncate">{props.value}</span>

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
