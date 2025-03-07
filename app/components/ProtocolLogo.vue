<script setup lang="ts">
import MySQL from './MySQL.vue'
import Postgres from './Postgres.vue'
import Sqlite from './Sqlite.vue'

const props = defineProps<{
  value?: string
}>()

const protocol = computed(() => props.value?.split('://')[0])

const as = computed(() => {
  if (protocol.value === 'postgres')
    return Postgres
  if (protocol.value === 'sqlite')
    return Sqlite

  return MySQL
})
</script>

<template>
  <component :is="as" />
</template>
