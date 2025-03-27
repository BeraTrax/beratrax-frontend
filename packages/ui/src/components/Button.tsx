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
  return (<View
    // style={{ $$css: true, test: cn("m-4 p-4 rounded-lg bg-buttonPrimary", props.className) }}
    className={"m-4 p-4 rounded-lg bg-bgPrimary"} ref={ref} {...props}
  >
    <Text 
    // style={{ $$css: true, test: "text-white" }} 
    className="text-white">Hello From Beratrax UI Button 1</Text>
  </View>);
});

Button.displayName = 'Button';

export const ButtonTwo = () => {
  return <View 
  // style={{ $$css: true, test: cn("m-4 p-4 rounded-lg bg-buttonPrimary") }} 
  className='m-4 p-4 rounded-lg border-8 border-indigo-500 bg-buttonPrimaryLight'>
    <Text 
    // style={{ $$css: true, test: "text-white" }} 
    className='text-textGrey'>Hello From Beratrax UI Button 2</Text>
  </View>
}