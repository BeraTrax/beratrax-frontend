import React, { useEffect, useRef } from "react";
import { View, Dimensions, ScrollView, Animated } from "react-native";
import { twMerge } from "tailwind-merge";

interface MobileModalContainerProps {
  children: React.ReactNode;
  open?: boolean;
  className?: string;
  wrapperClassName?: string;
}

const MobileModalContainer = ({
  children,
  open = false,
  className = "",
  wrapperClassName = "",
}: MobileModalContainerProps) => {
  const { height } = Dimensions.get("window");
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: open ? 0 : height,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [open, slideAnim, height]);

  if (open === false) {
    return null;
  }

  return (
    <Animated.View
      className={twMerge("absolute w-full top-0 left-0 right-0 z-20 bg-transparent", wrapperClassName)}
      style={{ height, transform: [{ translateY: slideAnim }] }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
        showsVerticalScrollIndicator={true}
      >
        <View
          className={twMerge(
            "w-full bg-[#1A1A1A] rounded-t-[40px] border-t-2 border-t-[#333333] overflow-hidden",
            className,
          )}
          style={{ height: height * 0.9 }}
        >
          {children}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

export default MobileModalContainer;

