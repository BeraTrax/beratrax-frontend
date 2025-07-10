import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import reactNativeWeb from "vite-plugin-react-native-web";
import path from "path";

import { defineConfig, loadEnv } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const extensions = [".web.tsx", ".tsx", ".web.ts", ".ts", ".web.jsx", ".jsx", ".web.js", ".js", ".css", ".json", ".mjs", ".svg"];

// Modules to include for optimization (browserify polyfills)
const optimizeIncludes = [
	"nativewind",
	"react-native-css-interop",
	"crypto-browserify",
	"stream-browserify",
	"stream-http",
	"https-browserify",
	"os-browserify",
	"buffer",
	"process",
];

// Native-only modules to exclude from web build
const excludeFromWeb = ["expo-router"];

// Web-compatible mock for expo-router using react-router-dom
const createExpoRouterMock = () => `
// Web-compatible mock for expo-router
import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

export const useRouter = () => {
  const navigate = useNavigate();
  return {
    push: (path) => navigate(path),
    replace: (path) => navigate(path, { replace: true }),
    back: () => navigate(-1),
    canGoBack: () => window.history.length > 1,
  };
};

export const useLocalSearchParams = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const result = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
};

export const usePathname = () => {
  const { pathname } = useLocation();
  return pathname;
};

export const Link = ({ href, children, ...props }) => {
  const navigate = useNavigate();
  return React.createElement(
    "a",
    {
      ...props,
      href: href,
      onClick: (e) => {
        e.preventDefault();
        navigate(href);
      }
    },
    children
  );
};

export const Stack = ({ children }) => children;
export const Redirect = ({ href }) => {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate(href, { replace: true });
  }, [href, navigate]);
  return null;
};
`;

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, workspaceRoot, "EXPO_PUBLIC_");

	return {
		plugins: [
			{
				name: "expo-router-web-compat",
				enforce: "pre",
				resolveId(id: string) {
					if (id === "expo-router") {
						return "virtual:expo-router-web-mock";
					}
					return null;
				},
				load(id: string) {
					if (id === "virtual:expo-router-web-mock") {
						return createExpoRouterMock();
					}
					return null;
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
				globals: { Buffer: true, process: true, global: true },
				protocolImports: true,
				include: ["crypto", "stream", "http", "https", "os", "path", "buffer", "process", "util"],
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
				// Explicit crypto aliases
				crypto: "crypto-browserify",
				stream: "stream-browserify",
				http: "stream-http",
				https: "https-browserify",
				os: "os-browserify",
			},
		},
		optimizeDeps: {
			include: optimizeIncludes,
			exclude: excludeFromWeb,
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
				include: [/node_modules/],
			},
			rollupOptions: {
				external: excludeFromWeb.slice(0, 2), // Only the first two items (not expo-router)
			},
		},
		define: {
			"process.env": JSON.stringify(env),
			"process.browser": true,
			__DEV__: process.env.NODE_ENV !== "production",
			global: "globalThis",
		},
	};
});
