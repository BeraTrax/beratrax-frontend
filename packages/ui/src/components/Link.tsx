import { Linking, Text, TouchableOpacity } from "react-native";

export const Link = ({
  href,
  children,
  className,
}: {
  href: string;
  target: string;
  className?: string;
  children: React.ReactNode;
}) => {
  const handlePress = () => Linking.openURL(href);

  return (
    <TouchableOpacity onPress={handlePress}>
      <Text className={className}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};
