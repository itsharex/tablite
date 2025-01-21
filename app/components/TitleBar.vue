<script setup lang="ts">
import { platform } from '@tauri-apps/plugin-os'

const IS_MACOS = platform() === 'macos'
</script>

<template>
  <div data-tauri-drag-region class="relative z-50" :class="[IS_MACOS ? 'h-12' : 'h-8']" />
</template>
