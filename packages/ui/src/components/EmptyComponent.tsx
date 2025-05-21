import { FC, ReactNode } from "react";
import { View } from "react-native";
import { Link } from "./Link";

interface IProps {
	children?: ReactNode;
	style?: Object;
	link?: string;
	linkText?: string;
}

export const EmptyComponent: FC<IProps> = ({ children, style = {}, link = "", linkText }) => {
	return (
		<View
			className={`font-arame-mono text-textWhite text-2xl font-medium text-center	grid place-content-center rounded-3xl border border-borderDark  relative overflow-hidden p-4 w-full bg-bgDark  `}
			style={style}
		>
			<View>
				{children}
				<Link href={link} target="_blank" className={""}>
					" "{linkText}
				</Link>
			</View>
		</View>
	);
};
