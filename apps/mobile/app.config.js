import "dotenv/config";
import path from "path";
import { config } from "dotenv";

// Load env variables from monorepo root
config({ path: path.resolve(__dirname, "../../.env") });

export default {
	expo: {
		name: "mobile",
		slug: "mobile",
		version: "1.0.0",
		orientation: "portrait",
		icon: "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/beratrax-logo/logo.png",
		scheme: "com.beratrax.mobile",
		userInterfaceStyle: "automatic",
		newArchEnabled: true,
		jsEngine: "hermes",
		ios: {
			supportsTablet: true,
			bundleIdentifier: "com.beratrax.mobile",
			permissions: ["CAMERA", "INTERNET"],
			infoPlist: {
				ITSAppUsesNonExemptEncryption: false,
			},
		},
		android: {
			adaptiveIcon: {
				foregroundImage: "./assets/images/adaptive-icon.png",
				backgroundColor: "#ffffff",
			},
			permissions: ["CAMERA", "INTERNET"],
			package: "com.beratrax.mobile",
		},
		web: {
			bundler: "metro",
			output: "static",
			favicon: "./assets/images/favicon.png",
		},
		plugins: [
			"expo-router",
			"expo-secure-store",
			[
				"expo-splash-screen",
				{
					image: "./assets/images/splash-icon.png",
					imageWidth: 200,
					resizeMode: "contain",
					backgroundColor: "#ffffff",
				},
			],
			"./queries.js",
		],
		experiments: {
			typedRoutes: true,
		},
		extra: {
			router: {
				origin: false,
			},
			eas: {
				projectId: "2bdcbec7-c2a3-45f9-a2ca-547d9da345cc",
			},
			API_URL: process.env.EXPO_PUBLIC_API_URL, // Example env variable
		},
		owner: "beratrax",
		runtimeVersion: "1.0.0",
		updates: {
			url: "https://u.expo.dev/2bdcbec7-c2a3-45f9-a2ca-547d9da345cc",
		},
	},
};
