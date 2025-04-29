import React from 'react';
import { Pressable, Vibration, Platform } from 'react-native';
import Svg, { SvgProps } from 'react-native-svg';

export interface IconProps extends SvgProps {
  size?: number;
  color?: string;
  onPress?: () => void;
  activeOpacity?: number;
  feedbackColor?: string;
  className?: string;
}

// This HOC takes an SVG content component and returns an icon component with all the common behavior
export const withIconBehavior = (SvgContent: React.FC<SvgProps>) => {
  const IconComponent: React.FC<IconProps> = ({
    size = 24,
    color = 'white',
    onPress,
    activeOpacity = 0.7,
    feedbackColor,
    className = '',
    ...props
  }) => {
    // Use width and height from size if not explicitly provided
    const width = props.width || size;
    const height = props.height || size;
    const stroke = props.stroke || color;

    const handlePress = () => {
      // Provide haptic feedback on supported platforms
      if (Platform.OS !== 'web') {
        Vibration.vibrate(10); // Short vibration (10ms)
      }
      
      // Call the provided onPress handler
      if (onPress) {
        onPress();
      }
    };

    const SvgComponent = (
      <Svg
        width={width}
        height={height}
        viewBox="0 0 30 30"
        fill="none"
        stroke={stroke}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`icon icon-tabler icons-tabler-outline ${className}`}
        {...props}
      >
        <SvgContent {...props} />
      </Svg>
    );

    // If no onPress is provided, just return the SVG
    if (!onPress) {
      return SvgComponent;
    }

    // Otherwise wrap it in a Pressable for touch feedback
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          {
            opacity: pressed ? activeOpacity : 1,
            backgroundColor: pressed && feedbackColor ? feedbackColor : 'transparent',
            borderRadius: size / 2,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={props.accessibilityLabel || "Icon button"}
      >
        {SvgComponent}
      </Pressable>
    );
  };

  return IconComponent;
}; 