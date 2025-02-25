import { StylableComponent, styled } from '@tamagui/core'

export const Button = styled('button' as unknown as StylableComponent, {
  name: 'Button',
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingVertical: 10,
  backgroundColor: '$background',
  color: '$color',
  hoverStyle: { opacity: 0.8 },
})
