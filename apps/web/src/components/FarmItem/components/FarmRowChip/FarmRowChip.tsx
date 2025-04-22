import { FC } from "react";

interface IProps {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    color?: "invert" | "default";
    text: string;
    position?: "absolute" | "static" | "relative" | "fixed" | "sticky";
    gradient?: boolean;
}

const FarmRowChip: FC<IProps> = ({ top, right, bottom, left, position, color, text, gradient }) => {
    const getColor = () => {
        let bgColor = "";
        let textColor = "";
        switch (color) {
            case "invert":
                bgColor = "bg-textPrimary";
                textColor = "text-gradientSecondary";
                break;
            default:
                bgColor = gradient ? "" : "bg-gradientSecondary";
                textColor = gradient
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-teal-400 animate-pulse drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    : "text-textPrimary";
                break;
        }
        return { bgColor, textColor };
    };
    return (
        <div
            className={`${getColor().bgColor} ${
                getColor().textColor
            } modile:font-semi-bold relative p-[2px] px-2 rounded-lg text-sm font-bold`}
            style={{
                position,
                top: top,
                right: right,
                bottom: bottom,
                left: left,
            }}
        >
            {text}
        </div>
    );
};

export default FarmRowChip;

