import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Library build for npm publish — `npm run build:lib` */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      include: [
        "src/index.ts",
        "src/**/*.d.ts",
        "src/components/meeting/**/*.ts",
        "src/components/meeting/**/*.tsx",
        "src/components/shared/**/*.tsx",
        "src/integration/**/*.ts",
        "src/integration/**/*.tsx",
        "src/types/**/*.ts",
        "src/lib/**/*.ts",
        "src/motion/**/*.ts",
      ],
      exclude: [
        "**/*.stories.tsx",
        "src/demo/**",
        "src/domain/**",
        "src/shell/**",
        "src/primitives/**",
        "src/App.jsx",
        "src/main.jsx",
      ],
      rollupTypes: true,
      tsconfigPath: "./tsconfig.json",
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "LoopUI",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "loop-ui.js" : "loop-ui.cjs"),
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "livekit-client",
      ],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "loop-ui.css";
          }
          return "assets/[name][extname]";
        },
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "livekit-client": "LivekitClient",
        },
      },
    },
  },
});
