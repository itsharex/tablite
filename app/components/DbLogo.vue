<script setup lang="ts">
import MySQL from './MySQL.vue'
import Postgres from './Postgres.vue'
import Sqlite from './Sqlite.vue'

const props = defineProps<{
  value: string
}>()

const as = computed(() => {
  if (props.value === 'postgres')
    return Postgres
  if (props.value === 'sqlite')
    return Sqlite

  return MySQL
})
</script>

<template>
  <component :is="as" />
</template>
