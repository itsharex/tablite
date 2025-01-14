<script setup lang="ts">
import Key from '~icons/heroicons/key'

defineProps<{
  value: string
  primaryKeys?: string[]
}>()
</script>

<template>
  <div class="flex items-center justify-between w-full">
    <span>{{ value }}</span>
    <Key v-if="primaryKeys?.includes(value)" class="size-3" />
  </div>
</template>
