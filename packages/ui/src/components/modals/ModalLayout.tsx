import { FC, ReactNode } from "react";
import { useApp } from "@beratrax/core/src/hooks";
import { twMerge } from "tailwind-merge";
import styles from "./ModalLayout.module.css";

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
	onClose: Function;
	children: ReactNode;
	wrapperClassName?: string;
	wrapperStyle?: React.CSSProperties;
}

export const ModalLayout: FC<IProps> = ({
	onClose,
	children,
	style,
	className = "",
	wrapperClassName = "lg:w-full",
	wrapperStyle = {},
	...rest
}) => {
	const { lightMode } = useApp();

	return (
		// this twMerge will follow the rule of latter defined has the highest priority and overrides the previous class
		<div className={`${styles.backdrop}  ${twMerge("w-full lg:w-[92%]", wrapperClassName)}`} style={style} onClick={(e) => onClose(e)}>
			<div {...rest} className={`${styles.container}  ${className}`} onClick={(e) => e.stopPropagation()} style={style}>
				{children}
			</div>
		</div>
	);
};
