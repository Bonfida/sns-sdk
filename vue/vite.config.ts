import path from 'path';
import { defineConfig } from 'vite'
import ts from '@rollup/plugin-typescript'

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@/',
        replacement: path.resolve(__dirname, 'src/')
      },
    ],
  },
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
