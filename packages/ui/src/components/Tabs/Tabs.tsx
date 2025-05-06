import { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import "./Tabs.css";
import { View } from "react-native";

interface Props {
  children: ReactNode;
  className?: string;
}

export const Tabs: FC<Props> = ({ children, className }) => {
  return <View className={twMerge("tabs", className)}>{children}</View>;
};

