import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
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
              name: 'vendor-ui',
              test: /[\\/]node_modules[\\/](framer-motion|lucide-react|recharts|canvas-confetti)/,
              priority: 15,
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
