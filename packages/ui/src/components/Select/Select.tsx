import React, { FC, useState, useEffect } from "react";
import { Platform, View, Text, Pressable, Image, LayoutChangeEvent } from "react-native";
import Svg, { G, Path, ClipPath, Rect, Defs } from "react-native-svg";

// Define the props for the Select component
interface IProps {
  value: string;
  setValue: (val: string) => void;
  options: string[];
  extraText?: string[]; // extra text to show alongside each option
  size?: "small"; // you can later use this to modify styling
  className?: string; // additional tailwind classes
  images?: Record<string, string[]>; // mapping from option to an array of image URLs
}

const Select: FC<IProps> = ({ value, setValue, options, extraText, size, className = "", images }) => {
  const [openSelect, setOpenSelect] = useState(false);
  // This state holds the maximum width of an option's text so that the select dropdown gets at least that width plus padding.
  const [maxWidth, setMaxWidth] = useState<number>(200);

  // When the component mounts or options change, ensure the current value is valid
  useEffect(() => {
    if (options && options.length > 0 && !options.includes(value)) {
      setValue(options[0]);
    }
  }, [options, value]);

  // Handler to update the maximum width – this is called from the onLayout handler in each option (dropdown)
  const handleOptionLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    // Update if the measured width plus some extra space is greater than the current maxWidth
    if (width + 70 > maxWidth) {
      setMaxWidth(width + 70);
    }
  };

  // Render the down arrow icon using react-native-svg
  const ArrowIcon = () => (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Defs>
        <ClipPath id="clip0">
          <Rect width={16} height={16} fill="white" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip0)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.5244 5.76215L7.82531 11.4612L7.7623 11.3982L7.6994 11.4611L2.0003 5.76203L3.41451 4.34782L7.76241 8.69572L12.1102 4.34793L13.5244 5.76215Z"
          fill="#ffffff"
        />
      </G>
    </Svg>
  );

  return (
    <View className={className + " relative"} style={{ minWidth: maxWidth }}>
      {/* The main select button */}
      <Pressable onPress={() => setOpenSelect(!openSelect)}>
        <View
          className={`relative rounded-2xl flex flex-row items-center gap-x-6 px-3 py-4 bg-bgSecondary ${size === "small" ? "w-[50px]" : ""}`}
          style={{ minWidth: maxWidth }}
        >
          <View className="flex flex-row items-center justify-around gap-2 flex-grow">
            {/* Render images if provided */}
            {images && images[value] && (
              <View className="flex flex-row">
                <Image source={{ uri: images[value][0] }} style={{ width: 20, height: 20, borderRadius: 25 }} />
                {images[value].length > 1 && (
                  <Image
                    source={{ uri: images[value][1] }}
                    style={{ width: 20, height: 20, marginLeft: -10, borderRadius: 25 }}
                  />
                )}
              </View>
            )}
            <Text className="text-textWhite">
              {value} {extraText ? extraText[options.findIndex((opt) => opt === value)] : ""}
            </Text>
          </View>
          <View style={{ transform: [{ rotate: openSelect ? "180deg" : "0deg" }] }}>
            <ArrowIcon />
          </View>
        </View>
      </Pressable>

      {/* Dropdown list */}
      {openSelect && (
        <View
          className="absolute right-0 z-10 bg-bgSecondary rounded top-[120%] p-2 flex flex-wrap justify-around"
          style={{ minWidth: maxWidth }}
        >
          {options.map((option, index) => (
            <Pressable
              key={option}
              onPress={() => {
                setValue(option);
                setOpenSelect(false);
              }}
            >
              <View
                className="flex flex-row items-center justify-between px-3 py-3 border-b last:border-b-0 cursor-pointer"
                onLayout={handleOptionLayout}
              >
                <View className="flex flex-row items-center gap-x-2">
                  {images && images[option] && (
                    <View className="flex flex-row">
                      <Image source={{ uri: images[option][0] }} style={{ width: 20, height: 20, borderRadius: 25 }} />
                      {images[option].length > 1 && (
                        <Image
                          source={{ uri: images[option][1] }}
                          style={{ width: 20, height: 20, marginLeft: -10, borderRadius: 25 }}
                        />
                      )}
                    </View>
                  )}
                  <View className="flex flex-row items-between justify-around">
                    <Text className="text-textWhite">{option}</Text>
                    <Text className="text-textWhite">{extraText ? extraText[index] : ""}</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

export default Select;

