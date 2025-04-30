import React from "react";
import "./PoolButton.css";

interface Props {
	description: string;
	active: boolean;
	variant?: number;
	onClick?: React.MouseEventHandler<HTMLDivElement>;
	className?: string;
}

const PoolButton: React.FC<Props> = ({ description, active, variant = 1, ...props }) => {
	return (
		<div
			className={`border border-[#A0FF3B]/20 [text-shadow:0_0_15px_rgba(160,255,59,0.5)] backdrop-blur-sm  font-league-spartan pool-button-${variant} ${
				active && `text-textPrimary button--selected-${variant}`
			} ${props.className || ""}`}
			onClick={props.onClick}
		>
			{description}
		</div>
	);
};

export default PoolButton;
