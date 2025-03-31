<template>
  <div class="relative overflow-hidden overscroll-none bg-zinc-50">
    <TauriDragRegion />

    <main vaul-drawer-wrapper>
      <NuxtPage />
    </main>
  </div>

  <Toaster />
</template>

<style>
:root {
  user-select: none;
  background-color: #fafafa;
  overscroll-behavior: none;
}
</style>
