/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
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
        bgPrimary: "var(--new-background_primary)",
        bgSecondary: "var(--new-background_secondary)",
        bgDark: "var(--new-background_dark)",

        /* Text Colors */
        textPrimary: "var(--new-color_primary)",
        textSecondary: "var(--new-color_secondary)",
        textGrey: "var(--new-color_grey)",
        textWhite: "var(--new-color_white)",
        textBlack: "var(--new-color_black)",

        /* Border Colors */
        borderDark: "var(--new-border_dark)",
        borderLight: "var(--new-border_light)",

        /* Button Colors */
        buttonPrimary: "var(--new-button-primary)",
        buttonPrimaryLight: "var(--new-button-primary-light)",
        buttonDisabled: "var(--new-button-disabled)",

        /* Gradient Colors */
        gradientPrimary: "var(--new-gradient-light)",
        gradientSecondary: "var(--new-gradient-dark)",
      },
      backgroundImage: {
        "top-to-bottom-curved": "var(--new-top-to-bottom-curved)",
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
  },
  plugins: [],
};

export default config; 