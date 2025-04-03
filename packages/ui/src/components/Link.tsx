import { Linking, Text, TouchableOpacity } from "react-native";

export const Link = ({
  href,
  children,
}: {
  href: string;
  target: string;
  className?: string;
  children: React.ReactNode;
}) => {
  const handlePress = () => Linking.openURL(href);

  return (
    <TouchableOpacity onPress={handlePress}>
      <Text style={{ color: "blue", textDecorationLine: "underline" }}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};
