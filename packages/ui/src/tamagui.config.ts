import { createFont, createMedia, createTamagui, CreateTamaguiProps, createTokens, isWeb } from 'tamagui';
import { dark, light } from './';
import { colors as color } from './../src/color/colors';
// const size = {
//   sm: 2,
//   md: 10,
//   true: 10, // this means "md" is your default size
//   lg: 20,
// };

// const space = {
//   ...size,
//   '-0': -0,
//   '-1': -5
// };

// Note that React Native is a bit weird with fonts
// on iOS you must refer to them by the family name in the file
// on Android you must refer to them by the name of the file
// on web, it's the full family name in the file
const fontFamilyByPlatform = {
  android: {
    medium: 'Basel-Grotesk-Medium',
    book: 'Basel-Grotesk-Book',
  },
  ios: {
    medium: 'Basel Grotesk',
    book: 'Basel Grotesk',
  },
  web: {
    medium: 'Basel Grotesk Medium',
    book: 'Basel Grotesk Book',
  },
}
const isAndroid = false;
const platform = isWeb ? 'web' : isAndroid ? 'android' : 'ios'

const fontFamily = {
  serif: 'serif',
  sansSerif: {
    // iOS uses the name embedded in the font
    book: fontFamilyByPlatform[platform].book,
    medium: fontFamilyByPlatform[platform].medium,
    monospace: 'InputMono-Regular',
  },
}

const baselMedium = isWeb
  ? 'Basel, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  : fontFamily.sansSerif.medium

const baselBook = isWeb
  ? 'Basel, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  : fontFamily.sansSerif.book

type SansSerifFontFamilyKey = keyof typeof fontFamily.sansSerif
type SansSerifFontFamilyValue = (typeof fontFamily.sansSerif)[SansSerifFontFamilyKey]

const platformFontFamily = (family: SansSerifFontFamilyKey): SansSerifFontFamilyKey | SansSerifFontFamilyValue => {
  if (isWeb) {
    return family
  }

  return fontFamily.sansSerif[family]
}

// NOTE: these may not match the actual font weights in the figma files,
// but they are approved by design. If you want to change these or add new weights,
// please consult with the design team.

// default for non-button fonts
const BOOK_WEIGHT = '400'
const BOOK_WEIGHT_WEB = '485'

// used for buttons
const MEDIUM_WEIGHT = '500'
const MEDIUM_WEIGHT_WEB = '535'

// on native, the Basel font files render down a few px
// this adjusts them to be visually centered by default
const NATIVE_LINE_HEIGHT_SCALE = 1.15

const defaultWeights = {
  book: isWeb ? BOOK_WEIGHT_WEB : BOOK_WEIGHT,
  true: isWeb ? BOOK_WEIGHT_WEB : BOOK_WEIGHT,
  medium: isWeb ? MEDIUM_WEIGHT_WEB : MEDIUM_WEIGHT,
}

const needsSmallFont = (): boolean => {
  return true
}

const adjustedSize = (fontSize: number): number => {
  if (needsSmallFont()) {
    return fontSize
  }
  return fontSize + 1
}

const fonts = {
  heading1: {
    family: platformFontFamily('book'),
    fontSize: adjustedSize(52),
    lineHeight: 60,
    fontWeight: BOOK_WEIGHT,
    maxFontSizeMultiplier: 1.2,
  },
  heading2: {
    family: platformFontFamily('book'),
    fontSize: adjustedSize(36),
    lineHeight: 44,
    fontWeight: BOOK_WEIGHT,
    maxFontSizeMultiplier: 1.2,
  },
  heading3: {
    family: platformFontFamily('book'),
    fontSize: adjustedSize(24),
    lineHeight: 32,
    fontWeight: BOOK_WEIGHT,
    maxFontSizeMultiplier: 1.2,
  },
  subheading1: {
    family: platformFontFamily('book'),
    fontSize: adjustedSize(18),
    lineHeight: 24,
    fontWeight: BOOK_WEIGHT,
    maxFontSizeMultiplier: 1.4,
  },
  subheading2: {
    family: platformFontFamily('book'),
    fontSize: adjustedSize(16),
    lineHeight: 24,
    fontWeight: BOOK_WEIGHT,
    maxFontSizeMultiplier: 1.4,
  },
  body1: {
    family: platformFontFamily('book'),
    fontSize: adjustedSize(18),
    lineHeight: 24,
    fontWeight: BOOK_WEIGHT,
    maxFontSizeMultiplier: 1.4,
  },
  body2: {
    family: platformFontFamily('book'),
    fontSize: adjustedSize(16),
    lineHeight: 24,
    fontWeight: BOOK_WEIGHT,
    maxFontSizeMultiplier: 1.4,
  },
  body3: {
    family: platformFontFamily('book'),
    fontSize: adjustedSize(14),
    lineHeight: 20,
    fontWeight: BOOK_WEIGHT,
    maxFontSizeMultiplier: 1.4,
  },
  body4: {
    family: platformFontFamily('book'),
    fontSize: adjustedSize(12),
    lineHeight: 16,
    fontWeight: BOOK_WEIGHT,
    maxFontSizeMultiplier: 1.4,
  },
  buttonLabel1: {
    family: platformFontFamily('medium'),
    fontSize: adjustedSize(18),
    lineHeight: adjustedSize(18) * NATIVE_LINE_HEIGHT_SCALE,
    fontWeight: MEDIUM_WEIGHT,
    maxFontSizeMultiplier: 1.2,
  },
  buttonLabel2: {
    family: platformFontFamily('medium'),
    fontSize: adjustedSize(16),
    lineHeight: adjustedSize(16) * NATIVE_LINE_HEIGHT_SCALE,
    fontWeight: MEDIUM_WEIGHT,
    maxFontSizeMultiplier: 1.2,
  },
  buttonLabel3: {
    family: platformFontFamily('medium'),
    fontSize: adjustedSize(14),
    lineHeight: adjustedSize(14) * NATIVE_LINE_HEIGHT_SCALE,
    fontWeight: MEDIUM_WEIGHT,
    maxFontSizeMultiplier: 1.2,
  },
  buttonLabel4: {
    family: platformFontFamily('medium'),
    fontSize: adjustedSize(12),
    lineHeight: adjustedSize(12) * NATIVE_LINE_HEIGHT_SCALE,
    fontWeight: MEDIUM_WEIGHT,
    maxFontSizeMultiplier: 1.2,
  },
  monospace: {
    family: platformFontFamily('monospace'),
    fontSize: adjustedSize(12),
    lineHeight: 16,
    maxFontSizeMultiplier: 1.2,
  },
} as const

// TODO: Tamagui breaks font weights on Android if face *not* defined
// but breaks iOS if face is defined
const face = {
  [defaultWeights.book]: { normal: baselBook },
  [defaultWeights.medium]: { normal: baselMedium },
}

const headingFont = createFont({
  family: baselBook,
  ...(isAndroid ? { face } : null),
  size: {
    small: fonts.heading3.fontSize,
    medium: fonts.heading2.fontSize,
    true: fonts.heading2.fontSize,
    large: fonts.heading1.fontSize,
  },
  weight: defaultWeights,
  lineHeight: {
    small: fonts.heading3.lineHeight,
    medium: fonts.heading2.lineHeight,
    true: fonts.heading2.lineHeight,
    large: fonts.heading1.lineHeight,
  },
})

const subHeadingFont = createFont({
  family: baselBook,
  ...(isAndroid ? { face } : null),
  size: {
    small: fonts.subheading2.fontSize,
    large: fonts.subheading1.fontSize,
    true: fonts.subheading1.fontSize,
  },
  weight: defaultWeights,
  lineHeight: {
    small: fonts.subheading2.lineHeight,
    large: fonts.subheading1.lineHeight,
    true: fonts.subheading1.lineHeight,
  },
})

const bodyFont = createFont({
  family: baselBook,
  ...(isAndroid ? { face } : null),
  size: {
    micro: fonts.body4.fontSize,
    small: fonts.body3.fontSize,
    medium: fonts.body2.fontSize,
    true: fonts.body2.fontSize,
    large: fonts.body1.fontSize,
  },
  weight: defaultWeights,
  lineHeight: {
    micro: fonts.body4.lineHeight,
    small: fonts.body3.lineHeight,
    medium: fonts.body2.lineHeight,
    true: fonts.body2.lineHeight,
    large: fonts.body1.lineHeight,
  },
})

const buttonFont = createFont({
  family: baselMedium,
  size: {
    micro: fonts.buttonLabel4.fontSize,
    small: fonts.buttonLabel3.fontSize,
    medium: fonts.buttonLabel2.fontSize,
    large: fonts.buttonLabel1.fontSize,
    true: fonts.buttonLabel2.fontSize,
  },
  weight: {
    ...defaultWeights,
    true: MEDIUM_WEIGHT,
  },
  lineHeight: {
    micro: fonts.buttonLabel4.lineHeight,
    small: fonts.buttonLabel3.lineHeight,
    medium: fonts.buttonLabel2.lineHeight,
    large: fonts.buttonLabel1.lineHeight,
    true: fonts.buttonLabel2.lineHeight,
  },
})

const allFonts = {
  heading: headingFont,
  subHeading: subHeadingFont,
  body: bodyFont,
  button: buttonFont,
}

const breakpoints = {
  xxs: 360,
  xs: 380,
  sm: 450,
  md: 640,
  lg: 768,
  xl: 1024,
  xxl: 1280,
  xxxl: 1536,
}

const heightBreakpoints = {
  short: 736,
  midHeight: 800,
}

const media = createMedia({
  // the order here is important: least strong to most
  xxxl: { maxWidth: breakpoints.xxxl },
  xxl: { maxWidth: breakpoints.xxl },
  xl: { maxWidth: breakpoints.xl },
  lg: { maxWidth: breakpoints.lg },
  md: { maxWidth: breakpoints.md },
  sm: { maxWidth: breakpoints.sm },
  xs: { maxWidth: breakpoints.xs },
  xxs: { maxWidth: breakpoints.xxs },
  short: { maxHeight: heightBreakpoints.short },
  midHeight: { maxHeight: heightBreakpoints.midHeight },
})


const shorthands = {
  m: 'margin',
  mb: 'marginBottom',
  ml: 'marginLeft',
  mr: 'marginRight',
  mt: 'marginTop',
  mx: 'marginHorizontal',
  my: 'marginVertical',
  p: 'padding',
  pb: 'paddingBottom',
  pl: 'paddingLeft',
  pr: 'paddingRight',
  pt: 'paddingTop',
  px: 'paddingHorizontal',
  py: 'paddingVertical',
} as const

/**
 * Generic spacing tokens (padding, margin, etc)
 */
const spacing = {
  none: 0,
  spacing1: 1,
  spacing2: 2,
  spacing4: 4,
  spacing6: 6,
  spacing8: 8,
  spacing12: 12,
  spacing16: 16,
  spacing18: 18,
  spacing20: 20,
  spacing24: 24,
  spacing28: 28,
  spacing32: 32,
  spacing36: 36,
  spacing40: 40,
  spacing48: 48,
  spacing60: 60,
}
const iconSizes = {
  icon8: 8,
  icon12: 12,
  icon16: 16,
  icon18: 18,
  icon20: 20,
  icon24: 24,
  icon28: 28,
  icon32: 32,
  icon36: 36,
  icon40: 40,
  icon44: 44,
  icon48: 48,
  icon64: 64,
  icon70: 70,
  icon100: 100,
}

/**
 * Spore variables for gap and padding will be displayed with all other spacing tokens.
 */

const padding = {
  padding6: spacing.spacing6,
  padding8: spacing.spacing8,
  padding12: spacing.spacing12,
  padding16: spacing.spacing16,
  padding20: spacing.spacing20,
  padding36: spacing.spacing36,
}

const gap = {
  gap4: spacing.spacing4,
  gap8: spacing.spacing8,
  gap12: spacing.spacing12,
  gap16: spacing.spacing16,
  gap20: spacing.spacing20,
  gap24: spacing.spacing24,
  gap32: spacing.spacing32,
  gap36: spacing.spacing36,
}

const space = { ...spacing, ...padding, ...gap, true: spacing.spacing8 }

const size = space

const iconSize = {
  true: iconSizes.icon40,
  8: iconSizes.icon8,
  12: iconSizes.icon12,
  16: iconSizes.icon16,
  18: iconSizes.icon18,
  20: iconSizes.icon20,
  24: iconSizes.icon24,
  28: iconSizes.icon28,
  36: iconSizes.icon36,
  40: iconSizes.icon40,
  48: iconSizes.icon48,
  64: iconSizes.icon64,
  70: iconSizes.icon70,
  100: iconSizes.icon100,
}

const borderRadii = {
  none: 0,
  rounded4: 4,
  rounded6: 6,
  rounded8: 8,
  rounded12: 12,
  rounded16: 16,
  rounded20: 20,
  rounded24: 24,
  rounded32: 32,
  roundedFull: 999999,
}

const imageSizes = {
  image12: 12,
  image16: 16,
  image20: 20,
  image24: 24,
  image32: 32,
  image36: 36,
  image40: 40,
  image48: 48,
  image64: 64,
  image100: 100,
}

const imageSize = { ...imageSizes, true: imageSizes.image40 }

const fontSize = {
  heading1: fonts.heading1.fontSize,
  heading2: fonts.heading2.fontSize,
  heading3: fonts.heading3.fontSize,
  subheading1: fonts.subheading1.fontSize,
  subheading2: fonts.subheading2.fontSize,
  body1: fonts.body1.fontSize,
  body2: fonts.body2.fontSize,
  body3: fonts.body3.fontSize,
  buttonLabel1: fonts.buttonLabel1.fontSize,
  buttonLabel2: fonts.buttonLabel2.fontSize,
  buttonLabel3: fonts.buttonLabel3.fontSize,
  buttonLabel4: fonts.buttonLabel4.fontSize,
  monospace: fonts.monospace.fontSize,
  true: fonts.body2.fontSize,
}

// Standard z-index system https://getbootstrap.com/docs/5.0/layout/z-index/
const zIndexes = {
  negative: -1,
  background: 0,
  default: 1,
  mask: 10,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  offcanvas: 1050,
  modal: 1060,
  popoverBackdrop: 1065,
  popover: 1070,
  tooltip: 1080,
  // Custom value needed to properly display components
  // above modals (e.g. in the extension app)
  overlay: 100001,
}

const radius = { ...borderRadii, true: borderRadii.none }

const zIndex = { ...zIndexes, true: zIndexes.default }

const tokens = createTokens({
  color,
  space,
  size,
  font: fontSize,
  icon: iconSize,
  image: imageSize,
  zIndex,
  radius,
})

const configWithoutAnimations = {
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  disableSSR: true,
  onlyAllowShorthands: true,
  themes: {
    light,
    dark,
  },
  shorthands,
  fonts: allFonts,
  tokens,
  media,
  settings: {
    allowedStyleValues: 'somewhat-strict-web',
    autocompleteSpecificTokens: 'except-special',
    fastSchemeChange: true,
  },
} satisfies CreateTamaguiProps

// Create the actual Tamagui instance
const config = createTamagui(configWithoutAnimations);

export type AppConfig = typeof config;
export default config;