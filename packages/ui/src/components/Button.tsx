import { PropsWithChildren, forwardRef } from 'react';
import { Text, View } from 'react-native';
import { cn } from '.'

interface ButtonProps {
  className?: string;
}

export const Button = forwardRef<
  View,
  PropsWithChildren<ButtonProps>
>((props, ref) => {
  // const buttonClasses = twMerge("m-4 p-4 rounded-lg bg-buttonPrimary", props.className);

  return <View style={{ $$css: true, test: "w-10 h-10 bg-blue-500" }} ref={ref} className={cn("m-4 p-4 rounded-lg bg-buttonPrimary", props.className)} {...props}>
    <View className="w-10 h-10 bg-blue-500" >
      <Text>Hello From Beratrax UI</Text>
    </View>
  </View>;
});

Button.displayName = 'Button';