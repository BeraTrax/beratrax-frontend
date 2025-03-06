import { styled, YStack } from 'tamagui'

export const Card = styled(YStack, {
  backgroundColor: '$background',
  borderRadius: '$rounded4',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
  variants: {
    size: {
      small: {
        padding: '$2',
      },
      large: {
        padding: '$6',
      },
    },
  },
})
