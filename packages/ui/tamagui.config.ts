import { createTamagui } from '@tamagui/core'
import { createInterFont } from '@tamagui/font-inter'
import { shorthands } from '@tamagui/shorthands'

const InterFont = createInterFont()

const config = createTamagui({
  themes: {
    light: {
      background: '#ffffff',
      color: '#000000',
    },
    dark: {
      background: '#000000',
      color: '#ffffff',
    },
  },
  fonts: {
    body: InterFont,
  },
  shorthands,
})

export type AppConfig = typeof config
declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config
