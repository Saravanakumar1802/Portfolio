import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// React gets its own chunk: otherwise Rollup pulls it into the lazy 3D
// chunks and the entry would have to load them up front.
const vendorChunk = (id) => {
  // Vite/Rollup runtime helpers (e.g. the dynamic-import preloader).
  if (id.startsWith('\0')) return 'runtime'
  if (!id.includes('node_modules')) return undefined
  if (/\/node_modules\/(react|react-dom|scheduler|@babel\/runtime)\//.test(id)) return 'react'
  if (id.includes('/three/')) return 'three'
  if (id.includes('@react-three') || id.includes('three-stdlib') || id.includes('postprocessing')) {
    return 'r3f'
  }
  if (id.includes('/gsap/')) return 'gsap'
  return undefined
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    // three.js is ~1 MB minified; it is a lazy chunk fetched behind the loader.
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: { manualChunks: vendorChunk },
    },
  },
})
