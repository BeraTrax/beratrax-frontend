export default {
	extend: {
		screens: {
			desktop: "1200px",
			tablet: "768px",
			xlMobile: "650px",
			mobile: "500px",
			xsMobile: "480px",
		},
		fontFamily: {
			"arame-mono": ["Arame Mono", "sans-serif"],
			"league-spartan": ["League Spartan", "sans-serif"],
		},
		colors: {
			/* Background Colors */
			bgPrimary: "var(--new-background_primary)", // #72B21F
			bgSecondary: "var(--new-background_secondary)", // #151915
			bgDark: "var(--new-background_dark)", // #020907

			/* Text Colors */
			textPrimary: "var(--new-color_primary)", // #72B21F
			textSecondary: "var(--new-color_secondary)", // #878B82
			textGrey: "var(--new-color_grey)", // #878B82
			textWhite: "var(--new-color_white)", // #ffffff
			textBlack: "var(--new-color_black)", // #000000

			/* Border Colors */
			borderDark: "var(--new-border_dark)", // #323D27
			borderLight: "var(--new-border_light)", // #90BB62

			/* Button Colors */
			buttonPrimary: "var(--new-button-primary)", // #72B21F
			buttonPrimaryLight: "var(--new-button-primary-light)", // #A0FF3B
			buttonDisabled: "var(--new-button-disabled)", // #878B82

			/* Gradient Colors */
			gradientPrimary: "var(--new-gradient-light)", // #A0FF3B
			gradientSecondary: "var(--new-gradient-dark)", // #283817
		},
		backgroundImage: {
			"top-to-bottom-curved": "var(--new-top-to-bottom-curved)", // Gradient defined in CSS
			"bottom-right-gradient": "var(--new-bottom-right-gradient)",
		},
		keyframes: {
			rotation: {
				"0%": { transform: "rotate(0deg)" },
				"100%": { transform: "rotate(360deg)" },
			},
			shimmer: {
				"0%": { transform: "translateX(-100%)" },
				"100%": { transform: "translateX(100%)" },
			},
			"pulse-slow": {
				"0%": { opacity: 1 },
				"50%": { opacity: 0.8 },
				"100%": { opacity: 1 },
			},
		},
		animation: {
			rotation: "rotation 1s linear infinite",
			shimmer: "shimmer 3s infinite",
			"pulse-slow": "pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
			spinFast: "spin 1s linear infinite",
		},
		width: {
			"full-minus-sidebar": "calc(100% - var(--side-bar-width))",
		},
	},
};
