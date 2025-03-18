import { styled, YStack } from 'tamagui'

export const Card = styled(YStack, {
  name: 'Card',
  backgroundColor: '$background',
  borderRadius: '$rounded4',
  borderColor: '$borderColor',
  borderWidth: 1,
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
  variants: {
    size: {
      small: {
        padding: '$2',
        fontSize: '$1',
      },
      medium: {
        padding: '$4',
        fontSize: '$2',
      },
      large: {
        padding: '$6',
        fontSize: '$3',
      },
      xlarge: {
        padding: '$8',
        fontSize: '$4',
      },
      xxlarge: {
        padding: '$10',
        fontSize: '$5',
      },
    },
    variant: {
      primary: {
        backgroundColor: '$bgPrimary',
        borderColor: '$borderLight',
        color: '$textWhite',
      },
      secondary: {
        backgroundColor: '$bgSecondary',
        borderColor: '$borderDark',
        color: '$textWhite',
      },
      dark: {
        backgroundColor: '$bgDark',
        borderColor: '$borderDark',
        color: '$textWhite',
      }
    }
  },
  defaultVariants: {
    size: 'small',
    variant: 'primary',
  }
})
