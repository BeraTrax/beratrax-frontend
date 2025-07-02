import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import reactNativeWeb from "vite-plugin-react-native-web";
import path from "path";

import { defineConfig, loadEnv, transformWithEsbuild } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const extensions = [".web.tsx", ".tsx", ".web.ts", ".ts", ".web.jsx", ".jsx", ".web.js", ".js", ".css", ".json", ".mjs", ".svg"];

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, workspaceRoot, "EXPO_PUBLIC_");

	return {
		plugins: [
			{
				name: "vite:jsx-in-node_modules",
				enforce: "pre",
				async transform(code: string, id: string) {
					if (id.includes("node_modules/expo-router") && id.endsWith(".js")) {
						return transformWithEsbuild(code, id, {
							loader: "jsx",
							jsx: "automatic",
							// if you use nativewind’s pragma:
							jsxImportSource: "nativewind",
						});
					}
				},
			},
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
			reactNativeWeb(),
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
				// Node.js module polyfills for browser
				"end-of-stream": "empty-module",
			},
		},
		optimizeDeps: {
			include: ["nativewind", "react-native-css-interop"],
			// Exclude native-only modules from web build to prevent Vite/esbuild from attempting to parse incompatible React native code. These are conditionally imported at runtime on mobile platforms only.
			exclude: ["@transak/react-native-sdk", "react-native-inappbrowser-reborn"],
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
			rollupOptions: {
				external: ["@transak/react-native-sdk", "react-native-inappbrowser-reborn"],
			},
		},
		define: {
			"process.env": JSON.stringify(env),
			"process.browser": true,
			__DEV__: process.env.NODE_ENV !== "production",
		},
	};
});
