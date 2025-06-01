import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import htuiPlugin from './src/Application/Utils/vite-plugin-htui'
import wasm from "vite-plugin-wasm"
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [
    topLevelAwait(),
    tailwindcss(),
    htuiPlugin(),
    wasm()
  ],
})
