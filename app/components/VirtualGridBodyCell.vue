<script setup lang="tsx">
import { Badge } from '~/components/ui/badge'

const props = defineProps<{
  value: any
  dataType?: string
  editable?: boolean
  isSelected?: boolean
}>()

const emit = defineEmits(['click', 'dblclick'])

const isBlob = computed(() => props.dataType?.includes('blob') || Array.isArray(props.value))
const isEmpty = computed(() => ['', undefined, null].includes(props.value))

const BlobCell = <Badge class="origin-left scale-75 text-xs">BLOB</Badge>
const EmptyCell = <input readonly class="placeholder-zinc-600/50 focus-visible:outline-none bg-transparent w-full h-full" placeholder="EMPTY" />
const DefaultCell = <span class="truncate cursor-default">{props.value}</span>

const component = computed(() => {
  if (isBlob.value)
    return BlobCell
  if (isEmpty.value)
    return EmptyCell
  return DefaultCell
})
</script>

<template>
  <div class="w-full h-full flex items-center px-3 box-border relative" @click="emit('click')">
    <component :is="component" class="z-[1]" :class="{ 'select-text cursor-text': isSelected }" />
    <div v-if="isSelected" v-motion-fade class="absolute inset-0 border-2 border-zinc-600" />
  </div>
</template>
