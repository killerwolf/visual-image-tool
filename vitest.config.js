import { defineConfig } from 'vitest/config'
import { JSDOMEnvironment } from 'vitest/environments'

export default defineConfig({
  test: {
    environment: 'jsdom', // or 'happy-dom', 'edge-runtime', 'node'
  },
})
