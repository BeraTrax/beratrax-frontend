/**
 * This Colors object contains color values that can be shared between web and mobile platforms.
 * It's particularly useful for SVG icons and other elements that need consistent colors.
 *
 * React Native doesn't recognize CSS variables or Tailwind classes that are defined
 * in the web styles. This object provides a single source of truth for color values
 * that need to be consistent across platforms.
 */
const Colors = {
	gradientLight: "#3B7EE3",
	gradientDark: "#283817",
	textSecondary: "#878B82",
	textPrimary: "#3B7EE3",
	textGrey: "#878B82",
	bgPrimary: "#3B7EE3",
	bgSecondary: "#151915",
	bgDark: "#020907",
	borderDark: "#0E1F39",
	borderLight: "#90BB62",
	buttonPrimary: "#3B7EE3",
	buttonPrimaryLight: "#A0FF3B",

	// Rgba versions for opacity
	bgPrimaryOpacity10: "rgba(114, 178, 31, 0.1)",
	bgPrimaryOpacity20: "rgba(114, 178, 31, 0.2)",
	borderLightOpacity20: "rgba(144, 187, 98, 0.2)",
};

export default Colors;
