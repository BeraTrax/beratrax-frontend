declare module "node-libs-react-native";

declare module "*.png" {
  const value: ImageSourcePropType;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}
