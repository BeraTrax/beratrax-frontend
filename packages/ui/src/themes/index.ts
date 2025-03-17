import { beratraxColors } from '../color/colors'

// Dark theme - will be the default
export const dark = {
  background: beratraxColors.bgDark,
  color: beratraxColors.textWhite,
  primary: beratraxColors.buttonPrimary,
  secondary: beratraxColors.buttonPrimaryLight,
  text: beratraxColors.textWhite,
  secondaryText: beratraxColors.textSecondary,
  borderColor: beratraxColors.borderDark,
  shadowColor: 'rgba(0,0,0,0.3)',
  
  // Add all tailwind colors for consistency
  bgPrimary: beratraxColors.bgPrimary,
  bgSecondary: beratraxColors.bgSecondary,
  bgDark: beratraxColors.bgDark,
  textPrimary: beratraxColors.textPrimary,
  textSecondary: beratraxColors.textSecondary,
  textGrey: beratraxColors.textGrey,
  textWhite: beratraxColors.textWhite,
  textBlack: beratraxColors.textBlack,
  borderDark: beratraxColors.borderDark,
  borderLight: beratraxColors.borderLight,
  buttonPrimary: beratraxColors.buttonPrimary,
  buttonPrimaryLight: beratraxColors.buttonPrimaryLight,
  buttonDisabled: beratraxColors.buttonDisabled,
  gradientPrimary: beratraxColors.gradientPrimary,
  gradientSecondary: beratraxColors.gradientSecondary,
}

// Light theme - initially the same as dark for consistency
export const light = {
  background: beratraxColors.textWhite,
  color: beratraxColors.textBlack,
  primary: beratraxColors.buttonPrimary,
  secondary: beratraxColors.buttonPrimaryLight,
  text: beratraxColors.textBlack,
  secondaryText: beratraxColors.textSecondary,
  borderColor: beratraxColors.borderLight,
  shadowColor: 'rgba(0,0,0,0.1)',
  
  // Add all tailwind colors for consistency
  bgPrimary: beratraxColors.bgPrimary,
  bgSecondary: beratraxColors.bgSecondary,
  bgDark: beratraxColors.bgDark,
  textPrimary: beratraxColors.textPrimary,
  textSecondary: beratraxColors.textSecondary,
  textGrey: beratraxColors.textGrey,
  textWhite: beratraxColors.textWhite,
  textBlack: beratraxColors.textBlack,
  borderDark: beratraxColors.borderDark,
  borderLight: beratraxColors.borderLight,
  buttonPrimary: beratraxColors.buttonPrimary,
  buttonPrimaryLight: beratraxColors.buttonPrimaryLight,
  buttonDisabled: beratraxColors.buttonDisabled,
  gradientPrimary: beratraxColors.gradientPrimary,
  gradientSecondary: beratraxColors.gradientSecondary,
}

// Export dark as the default theme
export const defaultTheme = dark
