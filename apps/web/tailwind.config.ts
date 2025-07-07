import animate from "tailwindcss-animate";
import tailwindBaseConfig from "@beratrax/typescript-config/tailwind.config";

const config = {
	presets: [require("nativewind/preset")],
	content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", "./../../packages/ui/src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			...tailwindBaseConfig.extend,
		},
	},
};

export default config;
