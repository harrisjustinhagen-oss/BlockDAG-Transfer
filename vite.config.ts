import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              // Split large dependencies into separate chunks for lazy loading
              'three': ['three', 'react-globe.gl'],
              'games': ['./components/games/hearts/HeartsGame', './components/games/uno/UnoGame', './components/games/trivia/TriviaGame', './components/games/sketchit/SketchItGame'],
              'mining': ['./components/mining/MiningApp', './components/mining/AsicDashboard'],
            }
          }
        },
        chunkSizeWarningLimit: 1000,
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production', // Remove console.log in production
            drop_debugger: true
          }
        }
      }
    };
});
