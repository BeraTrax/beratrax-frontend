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
	assert: require.resolve("empty-module"), // assert can be polyfilled here if needed
	http: require.resolve("empty-module"), // stream-http can be polyfilled here if needed
	https: require.resolve("empty-module"), // https-browserify can be polyfilled here if needed
	os: require.resolve("empty-module"), // os-browserify can be polyfilled here if needed
	url: require.resolve("empty-module"), // url can be polyfilled here if needed
	zlib: require.resolve("empty-module"), // browserify-zlib can be polyfilled here if needed
	path: require.resolve("empty-module"),
	crypto: require.resolve("crypto-browserify"),
	stream: require.resolve("readable-stream"),
	buffer: require.resolve("buffer"),
};

config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");
config.resolver.assetExts = assetExts.filter((extension) => extension !== "svg");
config.resolver.sourceExts = [...sourceExts, "svg", "cjs"];

config.resolver.resolveRequest = (context, moduleName, platform) => {
	if (moduleName === "crypto") {
		// when importing crypto, resolve to react-native-quick-crypto
		return context.resolveRequest(context, "react-native-quick-crypto", platform);
	}
	
	// Handle @coinbase/onchainkit/fund submodule
	if (moduleName === "@coinbase/onchainkit/fund") {
		return {
			filePath: path.resolve(workspaceRoot, "node_modules/@coinbase/onchainkit/esm/fund/index.js"),
			type: "sourceFile",
		};
	}
	
	// otherwise chain to the standard Metro resolver.
	return context.resolveRequest(context, moduleName, platform);
};

config.transformer.getTransformOptions = () => ({
	transform: {
		experimentalImportSupport: false,
		inlineRequires: true,
	},
	babelTransformerPath: require.resolve("react-native-react-bridge/lib/plugin"),
});

module.exports = withNativeWind(config, {
	input: "./global.css",
	configPath: "./tailwind.config.js",
	projectRoot,
});
