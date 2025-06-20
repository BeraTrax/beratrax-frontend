import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

import { defineConfig, loadEnv } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const extensions = [".web.tsx", ".tsx", ".web.ts", ".ts", ".web.jsx", ".jsx", ".web.js", ".js", ".css", ".json", ".mjs", ".svg"];

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, workspaceRoot, "EXPO_PUBLIC_");

	return {
		plugins: [
			react(),
			svgr({
				svgrOptions: {
					exportType: "default",
					ref: true,
					svgo: false,
					titleProp: true,
				},
				include: "**/*.svg",
			}),
			nodePolyfills({
				globals: {
					Buffer: true,
					process: true,
					global: true,
				},
				protocolImports: true,
			}),
		] as any,
		server: {
			port: 3000,
			open: true,
		},
		envPrefix: "EXPO_PUBLIC_",
		resolve: {
			alias: {
				"web/src": "/src",
				"ui/src": "/../../packages/ui/src",
				"@core": "/../../packages/core/src",
				jsbi: path.resolve(__dirname, "./node_modules/jsbi/dist/jsbi-cjs.js"),
				"~@fontsource/ibm-plex-mono": "@fontsource/ibm-plex-mono",
				"~@fontsource/inter": "@fontsource/inter",
				"react-native": "react-native-web",
				// Node.js module polyfills for browser
				"end-of-stream": "empty-module",
			},
		},
		optimizeDeps: {
			include: ["nativewind", "react-native-css-interop"],
			esbuildOptions: {
				resolveExtensions: extensions,
				jsx: "automatic",
				jsxImportSource: "nativewind",
				loader: { ".js": "jsx" },
			},
		},
		build: {
			outDir: "build",
			commonjsOptions: {
				transformMixedEsModules: true,
			},
		},
		define: {
			"process.env": JSON.stringify(env),
			"process.browser": true,
			__DEV__: process.env.NODE_ENV !== "production",
		},
	};
});
