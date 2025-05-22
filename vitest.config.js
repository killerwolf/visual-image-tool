import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom', // or 'happy-dom', 'edge-runtime', 'node'
  },
})
