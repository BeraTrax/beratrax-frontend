// a basic react native button component that uses the nativewind library to style the button

import { Button as RNButton, ButtonProps as RNButtonProps, Text } from "react-native";
import { twMerge } from "tailwind-merge";


interface ReusableProps extends RNButtonProps {
  variant?: "primary" | "secondary" | "tertiary";
  size?: "small" | "medium" | "large";
  className?: string;
}

export const Reusable = ({ variant = "primary", size = "medium", className, title, ...props }: ReusableProps) => {
  const buttonStyles = twMerge(
    "rounded-full",
    variant === "primary" && "bg-bgPrimary text-textPrimary",
    variant === "secondary" && "bg-bgSecondary text-textSecondary",
    variant === "tertiary" && "bg-bgDark text-textGrey",
    size === "small" && "px-4 py-2",
    size === "medium" && "px-6 py-3",
    size === "large" && "px-8 py-4",
    className
  );
  return (
    <Text className={buttonStyles + " " + className + " " + "text-white bg-red-500"}>
      {title}
    </Text>
  );
};