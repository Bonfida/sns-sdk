import { defineConfig } from 'vite'
import ts from '@rollup/plugin-typescript'

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue', '@bonfida/spl-name-service', '@solana/web3.js'],
      plugins: [
        ts({
          tsconfig: './tsconfig.json'
        })
      ]
    }
  }
})
