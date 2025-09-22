import "dotenv/config";
import path from "path";
import { config } from "dotenv";

// Load env variables from monorepo root
config({ path: path.resolve(__dirname, "../../.env") });

export default {
	expo: {
		name: "Trax Finance",
		slug: "Trax",
		version: "1.0.0",
		orientation: "portrait",
		icon: "./assets/images/trax-logo.png",
		scheme: "com.trax.mobile",
		userInterfaceStyle: "automatic",
		newArchEnabled: true,
		jsEngine: "hermes",
		ios: {
			supportsTablet: true,
			bundleIdentifier: "com.trax.mobile",
			permissions: ["CAMERA", "INTERNET"],
			infoPlist: {
				ITSAppUsesNonExemptEncryption: false,
				NSCameraUsageDescription:
					"This app uses the camera to securely capture identification documents for KYC verification through Transak.",
			},
		},
		android: {
			adaptiveIcon: {
				foregroundImage: "./assets/images/trax-logo.png",
				backgroundColor: "#ffffff",
			},
			permissions: ["CAMERA", "INTERNET"],
			package: "com.trax.mobile",
		},
		web: {
			bundler: "metro",
			output: "static",
			favicon: "./assets/images/trax-logo.png",
		},
		plugins: [
			"expo-router",
			"expo-secure-store",
			[
				"expo-build-properties",
				{
					android: {
						compileSdkVersion: 35,
						targetSdkVersion: 35,
						buildToolsVersion: "35.0.0",
					},
				},
			],
			[
				"expo-splash-screen",
				{
					image: "./assets/images/trax-logo.png",
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
				projectId: "2d543807-5097-4147-84ee-b64eda651ed5",
			},
			API_URL: process.env.EXPO_PUBLIC_API_URL, // Example env variable
		},
		owner: "beratrax",
		runtimeVersion: "1.0.0",
		updates: {
			url: "https://u.expo.dev/2d543807-5097-4147-84ee-b64eda651ed5",
		},
	},
};
