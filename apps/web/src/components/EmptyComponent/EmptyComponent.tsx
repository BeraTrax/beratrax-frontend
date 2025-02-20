import { FC, ReactNode } from "react";
import { Link } from "react-router-dom";

interface IProps {
    children?: ReactNode;
    style?: Object;
    link?: string;
    linkText?: string;
}

export const EmptyComponent: FC<IProps> = ({ children, style = {}, link = "", linkText }) => {
    return (
        <div
            className={`text-textWhite text-2xl font-medium text-center	grid place-content-center rounded-3xl border border-borderDark  relative overflow-hidden p-4 w-full bg-bgDark  `}
            style={style}
        >
            <div>
                {children}{" "}
                <Link target="_blank" to={link}>
                    {linkText}
                </Link>
            </div>
        </div>
    );
};
