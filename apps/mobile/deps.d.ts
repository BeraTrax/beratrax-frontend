declare module "node-libs-react-native";
declare module "react-hooks-outside";

declare module "*.png" {
	const value: ImageSourcePropType;
	export default value;
}

declare module "*.svg" {
	const value: string;
	export default value;
}
