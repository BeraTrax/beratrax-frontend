/** @type {import('tailwindcss').Config} */
import tailwindBaseConfig from "@beratrax/typescript-config/tailwind.config";

const config = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			...tailwindBaseConfig.extend,
		},
	},
};

export default config;
