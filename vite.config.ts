import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import htuiPlugin from './src/Application/Utils/vite-plugin-htui'
import wasm from "vite-plugin-wasm"
export default defineConfig({
  plugins: [
    tailwindcss(),
    htuiPlugin(),
    wasm()
  ],
})
