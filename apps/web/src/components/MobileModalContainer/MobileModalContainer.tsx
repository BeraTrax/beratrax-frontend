import React from "react";
import { twMerge } from "tailwind-merge";

interface MobileModalContainer {
	children: React.ReactNode;
	open?: boolean;
	className?: string;
	wrapperClassName?: string;
}

const MobileModalContainer = ({ children, open, className = "", wrapperClassName = "" }: MobileModalContainer) => {
	return (
		<div
			className={`fixed w-full ${twMerge(
				"w-full lg:w-11/12",
				wrapperClassName
			)} h-[100%] top-0 z-20 bg-transparent duration-300 overflow-y-scroll ${
				open ? "translate-y-0" : "translate-y-full"
			} transition-transform will-change-transform `}
		>
			<div
				className={`w-full ${twMerge(
					"w-full lg:w-11/12",
					className
				)} h-[90%] bg-bgDark absolute bottom-0 rounded-t-[40px] rounded-tr-[40px] border-t-borderDark border-t-2 overflow-y-scroll`}
			>
				{children}
			</div>
		</div>
	);
};

export default MobileModalContainer;
