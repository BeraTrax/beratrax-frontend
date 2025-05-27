/**
 * This Colors object contains color values that can be shared between web and mobile platforms.
 * It's particularly useful for SVG icons and other elements that need consistent colors.
 *
 * React Native doesn't recognize CSS variables or Tailwind classes that are defined
 * in the web styles. This object provides a single source of truth for color values
 * that need to be consistent across platforms.
 */
const Colors = {
	gradientLight: "#A0FF3B",
	gradientDark: "#283817",
	textSecondary: "#878B82",
};

export default Colors;
