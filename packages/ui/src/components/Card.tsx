import { View, ViewProps } from "react-native";
import { twMerge } from "tailwind-merge";

interface CardProps extends ViewProps {
  variant?: "primary" | "secondary" | "dark";
  size?: "small" | "medium" | "large" | "xlarge" | "xxlarge";
  className?: string;
  children?: React.ReactNode;
}

export const Card = ({ 
  variant = "primary", 
  size = "small", 
  className, 
  children, 
  ...props 
}: CardProps) => {
  const cardStyles = twMerge(
    "rounded-lg shadow-md",
    variant === "primary" && "bg-[#72B21F] border border-[#90BB62]",
    variant === "secondary" && "bg-[#151915] border border-[#323D27]",
    variant === "dark" && "bg-[#020907] border border-[#323D27]",
    size === "small" && "p-2",
    size === "medium" && "p-4",
    size === "large" && "p-6",
    size === "xlarge" && "p-8",
    size === "xxlarge" && "p-10",
    className
  );
  
  return (
    <View className={cardStyles} {...props}>
      {children}
    </View>
  );
};
