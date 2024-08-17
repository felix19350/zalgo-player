import { defineConfig } from "vite";
import { resolve } from "path";

import dts from "vite-plugin-dts";
import react from "@vitejs/plugin-react"; // ship type definitions in the build

// https://vitejs.dev/config/
// Adapted from: https://dev.to/receter/how-to-create-a-react-component-library-using-vites-library-mode-4lma
export default defineConfig({
  plugins: [react(), dts({ include: ["lib"] })],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, "lib/main.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime"],
    },
  },
});
