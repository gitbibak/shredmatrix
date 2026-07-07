import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /[\\/]node_modules[\\/](react|react-dom|react-router)/,
              priority: 20,
            },
            {
              name: 'vendor-motion',
              test: /[\\/]node_modules[\\/]framer-motion/,
              priority: 15,
            },
            {
              name: 'vendor-icons',
              test: /[\\/]node_modules[\\/]lucide-react/,
              priority: 14,
            },
            {
              name: 'vendor-charts',
              test: /[\\/]node_modules[\\/]recharts/,
              priority: 13,
            },
            {
              name: 'vendor-effects',
              test: /[\\/]node_modules[\\/]canvas-confetti/,
              priority: 12,
            },
            {
              name: 'vendor-supabase',
              test: /[\\/]node_modules[\\/](@supabase|supabase)/,
              priority: 10,
            },
            {
              name: 'data',
              test: /[\\/]src[\\/]data[\\/](planGenerator|mealDatabase|exerciseDatabase)/,
              priority: 5,
            },
          ],
        },
      },
    },
  },
})
