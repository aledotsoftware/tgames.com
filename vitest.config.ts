import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            imports: ['vue', 'vue-router'],
        }),
    ],
    test: {
        environment: 'happy-dom',
        globals: true,
        setupFiles: ['./tests/setup.ts']
    }
})
