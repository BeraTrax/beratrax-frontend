import { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import "./Tabs.css";

interface Props {
	children: ReactNode;
	className?: string;
}

export const Tabs: FC<Props> = ({ children, className }) => {
	return <div className={twMerge("tabs", className)}>{children}</div>;
};
