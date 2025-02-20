import { FC, ReactNode } from "react";
import "./Tabs.css";

interface Props {
    children: ReactNode;
    className?: string;
}

export const Tabs: FC<Props> = ({ children, className }) => {
    return <div className={`tabs ${className}`}>{children}</div>;
};
