import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from "vite-plugin-svgr";


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), svgr(), nodePolyfills({
        globals: {
            Buffer: true,
            process: true,
            global: true,
        },
        protocolImports: true,
    })],
    server: {
        port: 3000,
        open: true,
    },
    // define: {
    //     'process.env': {
    //         ...import.meta.env
    //     },
    // },
    envPrefix: "REACT_APP_",
    resolve: {
        alias: {
            src: "/src",
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
});