<script setup lang="tsx">
import { Badge } from '~/components/ui/badge'

const props = defineProps<{
  value: any
}>()

const isBlob = computed(() => Array.isArray(props.value))
const isEmpty = computed(() => ['', undefined, null].includes(props.value))

const component = computed(() => {
  if (isBlob.value)
    return (<Badge v-if="isBlob(row[col])" class="origin-left scale-75 text-xs">BLOB</Badge>)
  if (isEmpty.value)
    return <span class="text-zinc-600/50">EMPTY</span>
  return <span class="truncate">{props.value}</span>
})
</script>

<template>
  <component :is="component" />
</template>
