/** @type {import('tailwindcss').Config} */
import tailwindBaseConfig from "@beratrax/typescript-config/tailwind.config";
const config = {
	// NOTE: Update this to include the paths to all of your component files.
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./../../packages/ui/src/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			...tailwindBaseConfig.extend,
		},
	},
	plugins: [],
};

export default config;
