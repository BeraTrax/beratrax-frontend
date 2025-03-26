import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on mode (e.g., development, production)
  const env = loadEnv(mode, process.cwd(), "EXPO_PUBLIC_");

  return {
    plugins: [
      react(),
      svgr(),
      nodePolyfills({
        globals: {
          Buffer: true,
          process: true,
          global: true,
        },
        protocolImports: true,
      }),
    ],
    server: {
      port: 3000,
      open: true,
    },
    envPrefix: "EXPO_PUBLIC_",
    resolve: {
      alias: {
        src: "/src",
        "@core": "/../../packages/core/src",
        jsbi: path.resolve(__dirname, "./node_modules/jsbi/dist/jsbi-cjs.js"),
        "~@fontsource/ibm-plex-mono": "@fontsource/ibm-plex-mono",
        "~@fontsource/inter": "@fontsource/inter",
        "react-native": "react-native-web",
      },
    },
    build: {
      outDir: "build",
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    optimizeDeps: {
      exclude: ["./src/pages/Swap/uniswapTokens.json"],
    },
    define: {
      "process.env": JSON.stringify(env),
      "process.browser": true,
    },
  };
});

