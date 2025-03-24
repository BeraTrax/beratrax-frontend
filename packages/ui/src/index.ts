export * from './color'
export * from './themes'

export { default as tamaguiConfig } from './tamagui.config'

// Export Tamagui components
export {
    createTheme, H1,
    H2,
    H3,
    H4,
    H5,
    H6, Image,
    Label, Paragraph, ScrollView,
    Stack,
    Theme,
    useTheme, XStack,
    YStack
} from 'tamagui'

// Re-export some basic example components
// export { Card } from './components/Card'
// export { Demo } from './components/Demo'
// export { Flex, Wow } from './components/FlexBox'

// Export new components
// export { StakingCard } from './components/StakingCard/StakingCard'

export * from './components'