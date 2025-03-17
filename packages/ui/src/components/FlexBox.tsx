import { type Insets, Platform } from 'react-native'
import { GetProps, SizeTokens, Text, View, styled } from 'tamagui'

export const flexStyles = {
  fill: { flex: 1 },
  grow: { flexGrow: 1 },
  shrink: { flexShrink: 1 },
}

type SizeOrNumber = number | SizeTokens

type SizedInset = {
  top: SizeOrNumber
  left: SizeOrNumber
  right: SizeOrNumber
  bottom: SizeOrNumber
}

const getInset = (val: SizeOrNumber): SizedInset => ({
  top: val,
  right: val,
  bottom: val,
  left: val,
})

export const Flex = styled(View, {
  flexDirection: 'column',

  variants: {
    // @ts-expect-error
    inset: (size: SizeOrNumber | Insets) => (size && typeof size === 'object' ? size : getInset(size)),

    row: {
      true: {
        flexDirection: 'row',
      },
      false: {
        flexDirection: 'column',
      },
    },

    shrink: {
      true: {
        flexShrink: 1,
      },
    },

    grow: {
      true: {
        flexGrow: 1,
      },
    },

    fill: {
      true: {
        flex: 1,
      },
    },

    centered: {
      true: {
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
  } as const,
})

export type FlexProps = GetProps<typeof Flex>

export const Wow = () => {
  return (
    <Flex>
      {
        Platform.OS === 'web' ? <Text>Hello from web</Text> : <Text>Hello from mobile</Text>
      }
    </Flex>
  )
}
