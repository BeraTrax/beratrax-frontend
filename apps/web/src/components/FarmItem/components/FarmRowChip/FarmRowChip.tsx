import { FC } from "react";
interface IProps {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    color?: "invert" | "default";
    text: string;
    position?: "absolute" | "static" | "relative" | "fixed" | "sticky";
}
const FarmRowChip: FC<IProps> = ({ top, right, bottom, left, position, color, text }) => {
    const getColor = () => {
        let bgColor = "";
        let textColor = "";
        switch (color) {
            case "invert":
                bgColor = "bg-textPrimary";
                textColor = "text-gradientSecondary";
                break;
            default:
                bgColor = "bg-gradientSecondary";
                textColor = "text-textPrimary";
                break;
        }
        return { bgColor, textColor };
    };
    return (
        <div
            className={`${getColor().bgColor}  ${getColor().textColor} modile:font-semi-bold relative p-[2px] px-2 rounded-lg text-sm font-bold `}
            style={{
                position,
                top: top,
                right: right,
                bottom: bottom,
                left: left,
                // backgroundColor: getColor().bgColor,
                // color: getColor().textColor
            }}
        >
            {text}
        </div>
    );
};

export default FarmRowChip;
