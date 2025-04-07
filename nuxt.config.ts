import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  ssr: false,

  future: {
    compatibilityVersion: 4,
  },

  css: ['~/assets/css/tailwind.css'],

  modules: [
    '@vueuse/nuxt',
    'shadcn-nuxt',
    'unplugin-icons/nuxt',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@vueuse/motion/nuxt',
  ],

  shadcn: {
    prefix: '',
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
    plugins: [
      tailwindcss(),
    ],
    server: {
      strictPort: true,
    },
  },
})
