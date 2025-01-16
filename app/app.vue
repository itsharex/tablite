<script setup lang="ts">
Database.load('./app.db')
</script>

<template>
  <div class="relative overflow-hidden overscroll-none bg-zinc-50">
    <TitleBar />

    <main vaul-drawer-wrapper>
      <NuxtPage />
    </main>
  </div>
</template>

<style>
:root {
  user-select: none;
  background-color: #fafafa;
  overscroll-behavior: none;
}
</style>
