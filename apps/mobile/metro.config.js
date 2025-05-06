/**
 * Metro configuration for React Native with support for SVG files
 * https://github.com/react-native-svg/react-native-svg#use-with-svg-files
 *
 * @format
 */

// Find the project and workspace directories
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const nodeLibs = require("node-libs-react-native");
const { FileStore } = require("metro-cache");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

const {
	resolver: { sourceExts, assetExts },
} = config;

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, "node_modules"),
	path.resolve(workspaceRoot, "node_modules"),
	path.resolve(workspaceRoot, "packages/core/node_modules"),
	path.resolve(workspaceRoot, "packages/ui/node_modules"),
];

config.resolver.disableHierarchicalLookup = true;

function convertToNodePrefix(input) {
	return Object.entries(input).reduce((acc, [key, value]) => {
		acc[`node:${key}`] = value;
		return acc;
	}, {});
}

config.cacheStores = [
	new FileStore({
		root: path.join(projectRoot, "node_modules", ".cache", "metro"),
	}),
];

config.resolver.extraNodeModules = {
	...nodeLibs,
	...convertToNodePrefix(nodeLibs),
	"core/src": path.resolve(workspaceRoot, "packages/core/src"),
	"ui/src": path.resolve(workspaceRoot, "packages/ui/src"),
	ox: path.resolve(workspaceRoot, "node_modules/viem/node_modules/ox"),
};

config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");
config.resolver.assetExts = assetExts.filter((extension) => extension !== "svg");
config.resolver.sourceExts = [...sourceExts, "svg", "cjs"];

module.exports = withNativeWind(config, {
	input: "./global.css",
	configPath: "./tailwind.config.js",
	projectRoot,
});
