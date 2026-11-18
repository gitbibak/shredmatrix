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
              // Translations, data access and analytics are shared by every route.
              // Naming them keeps rolldown from folding them into the plan-data chunk.
              name: 'app-core',
              // Only what the shell imports at boot: listing whole folders here pulled
              // admin, workout and photo code into every page's first download.
              test: /[\\/]src[\\/](i18n[\\/](LanguageContext|translations)|lib[\\/](supabase|dataService|analytics|analyticsEventSchema|acquisition|coaching))\./,
              priority: 9,
            },
            {
              // Tiny modules shared by the app shell and public pages. Kept out of
              // the heavy data chunk so landing pages never preload the plan engine.
              name: 'app-meta',
              test: /[\\/]src[\\/]data[\\/](planVersion|moduleAssets|turkishSeoSlugs)\./,
              priority: 8,
            },
            {
              name: 'data',
              test: /[\\/]src[\\/]data[\\/](planGenerator|mealDatabase|exerciseDatabase|homeWorkoutPrograms|workoutAdaptation|adaptiveEngine)/,
              priority: 5,
            },
          ],
        },
      },
    },
  },
})
