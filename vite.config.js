import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // if your code lives under src/, you can leave defaults
  base: '/tellyTunes/',
})
