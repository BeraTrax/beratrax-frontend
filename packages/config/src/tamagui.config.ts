import { defaultConfig } from '@tamagui/config/v4'
import { createTamagui } from '@tamagui/core'

export const config = createTamagui({
  ...defaultConfig,
  // fonts: {
    // body: bodyFont,
    // heading: headingFont,
  // },
})

export type AppConfig = typeof config

export default config 