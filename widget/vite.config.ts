import dts from "vite-plugin-dts";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";
import { terser } from "rollup-plugin-terser";

const resolvePath = (str: string) => path.resolve(__dirname, str);

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    lib: {
      entry: resolvePath("src/lib/index.tsx"),
      name: "SNS Widget",
      formats: ["es", "cjs", "umd"],
      fileName: (format) =>
        `sns-widget.${
          format === "cjs" ? "cjs" : format === "es" ? "mjs" : "umd.js"
        }`,
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "@pythnetwork/client",
        "@solana/web3.js",
        "@solana/spl-token",
        "ahooks",
        "tailwind-merge",
        "buffer",
        "react-huge-icons",
        "react-async-hook",
        "@bonfida/spl-name-service",
        "split-graphemes",
      ],
      output: {
        // Provide global variables to use in the UMD build for externalized deps
        globals: {
          react: "react",
          "react-dom": "react-dom",
          "react/jsx-runtime": "react/jsx-runtime",
          "@pythnetwork/client": "@pythnetwork/client",
          "@solana/web3.js": "@solana/web3.js",
          "@solana/spl-token": "@solana/spl-token",
          "@bonfida/spl-name-service": "@bonfida/spl-name-service",
          ahooks: "ahooks",
          bs58: "bs58",
          "tailwind-merge": "tailwind-merge",
          buffer: "buffer",
          "react-huge-icons": "react-huge-icons",
          "react-async-hook": "react-async-hook",
          "split-graphemes": "split-graphemes",
        },
      },
      plugins: [terser({ compress: true })],
    },
  },
  plugins: [react(), dts({ rollupTypes: true, include: ["src/lib"] })],
});
