import process from 'node:process'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  ssr: false,

  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    'shadcn-nuxt',
    'unplugin-icons/nuxt',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@vueuse/motion/nuxt',
  ],

  shadcn: {
    componentDir: './app/components/ui',
  },

  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  devServer: {
    host: process.env.TAURI_DEV_HOST ?? 'localhost',
  },

  vite: {
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_'],
    server: {
      strictPort: true,
    },
  },
})
