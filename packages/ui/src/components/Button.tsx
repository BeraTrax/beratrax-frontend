import { PropsWithChildren, forwardRef } from 'react';
import { Text, View } from 'react-native';

interface ButtonProps {
  className?: string;
}

export const Button = forwardRef<
  View,
  PropsWithChildren<ButtonProps>
>((props, ref) => {
  return <View ref={ref} className="m-4 p-4 rounded-lg" {...props} >
    <Text className='bg-orange-500 bg-red-500 '>Hello From Beratrax UI</Text>
  </View>;
});

Button.displayName = 'Button';