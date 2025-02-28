import { tamaguiPlugin } from '@tamagui/vite-plugin';
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

const monorepoRoot = path.resolve(__dirname, "..", "..");
const tamaguiConfigPath = path.resolve(
  monorepoRoot,
  "packages/ui/build/tamagui.config.js",
);

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(), 
        svgr(), 
        tamaguiPlugin({
            config: tamaguiConfigPath,
            components: ['tamagui', '@beratrax/ui'],
        }),
        // tamaguiExtractPlugin({
        //     components: ['tamagui', '@beratrax/ui'],
        //     config: tamaguiConfigPath,
        // }),
    ],
    server: {
        port: 3000,
        open: true,
    },
    envPrefix: "REACT_APP_",
    resolve: {
        alias: {
            src: "/src",
            jsbi: path.resolve(__dirname, "../../node_modules/jsbi/dist/jsbi-cjs.js"),
            "~@fontsource/ibm-plex-mono": "@fontsource/ibm-plex-mono",
            "~@fontsource/inter": "@fontsource/inter",
            'react-native': 'react-native-web',
            // '@beratrax/ui': path.resolve(monorepoRoot, 'packages/ui/dist/index.js'),
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.svg'],
    },
    build: {
        outDir: "build",
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },
    optimizeDeps: {
        include: ['@beratrax/ui'],
        esbuildOptions: {
            resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.svg'],
        }
    },
});
