import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const satelliteWasmStub = {
  name: 'satellite-wasm-stub',
  enforce: 'pre',
  resolveId(id) {
    if (id === '#wasm-single-thread' || id === '#wasm-multi-thread') {
      return '\0satellite-wasm-stub'
    }
  },
  load(id) {
    if (id === '\0satellite-wasm-stub') {
      return 'export default null'
    }
  },
}

export default defineConfig({
  plugins: [react(), satelliteWasmStub],
  optimizeDeps: {
    exclude: ['satellite.js'],
  },
  build: {
    target: 'esnext',
    commonjsOptions: {
      transformMixedEsModules: true,
      ignore: (id) => id.includes('wasm-build'),
    },
  },
  server: {
    proxy: {
      '/celestrak': {
        target: 'https://celestrak.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/celestrak/, ''),
      },
    },
  },
})
