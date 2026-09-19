import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { placeHoursPlugin } from './vite.placeHoursPlugin.ts'
import { askLlmPlugin } from './vite.askLlmPlugin.ts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      placeHoursPlugin(),
      askLlmPlugin({
        geminiKey: env.GEMINI_API_KEY || env.GOOGLE_GENERATIVE_AI_API_KEY || '',
        groqKey: env.GROQ_API_KEY || '',
      }),
    ],
    optimizeDeps: {
      include: ['page-flip', 'react-pageflip'],
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  }
})
