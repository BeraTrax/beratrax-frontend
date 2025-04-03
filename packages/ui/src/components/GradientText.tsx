import { Text, Platform, TextStyle, StyleProp } from "react-native";

interface GradientTextProps {
  children: string;
  className?: string;
  style?: StyleProp<TextStyle>;
}

export const GradientText = ({
  children,
  className = "",
  style = {},
}: GradientTextProps) => {
  if (Platform.OS === "web") {
    return (
      <Text
        className={`animate-pulse bg-gradient-to-r from-yellow-400 via-orange-500 to-teal-400 
                    bg-clip-text text-transparent font-extrabold
                    drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]
                    hover:scale-105 transition-transform duration-200 ${className}`}
        style={style}
      >
        {children}
      </Text>
    );
  }

  return (
    <Text
      className={`font-extrabold ${className}`}
      style={[
        {
          color: "#FB923C", // orange-400, more vibrant
          textShadowColor: "rgba(255,255,255,0.4)",
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 6,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};
