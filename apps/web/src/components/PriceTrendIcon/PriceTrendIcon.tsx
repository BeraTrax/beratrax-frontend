import React from "react";

interface PriceTrendIconProps {
	className?: string;
	trend: "increase" | "decrease";
}

const PriceTrendIcon = ({ className, trend }: PriceTrendIconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={14}
			height={11}
			viewBox="0 0 14 11"
			fill="none"
			className={`${trend === "increase" ? "rotate-0" : "rotate-180"} ${className}`}
		>
			<path d="M7 0.5L13.0622 11H0.937822L7 0.5Z" fill={`${trend === "increase" ? "#90BB62" : "#E74C3C"}`} />
		</svg>
	);
};

export default PriceTrendIcon;
