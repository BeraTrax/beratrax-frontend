interface BottombarItemProps {
    icon: string;
    title: string;
    isActive: boolean;
    onClick: () => void;
    position: "left" | "middle" | "right";
}

function BottombarItem({ icon, title, isActive, onClick, position }: BottombarItemProps) {
    const getBorderStyle = () => {
        if (!isActive) return {};

        const gradientWidth = "30px";
        const baseColor = "var(--new-gradient-light)";

        switch (position) {
            case "left":
                return {
                    borderTop: `1px solid ${baseColor}`,
                    // borderImage: `linear-gradient(to right, ${baseColor}, ${baseColor} calc(100% - ${gradientWidth}), transparent) 1`,
                };
            case "right":
                return {
                    borderTop: `1px solid ${baseColor}`,
                    // borderImage: `linear-gradient(to left, ${baseColor}, ${baseColor} calc(100% - ${gradientWidth}), transparent) 1`,
                };
            default:
                return {
                    borderTop: `1px solid ${baseColor}`,
                };
        }
    };

    const getBorderRadius = () => {
        if (!isActive) return "0";
        switch (position) {
            case "left":
                return "12px 0 0 0";
            case "right":
                return "0 12px 0 0";
            default:
                return "0";
        }
    };

    return (
        <button
            key={title}
            onClick={onClick}
            style={{
                background: `${
                    isActive
                        ? "radial-gradient(circle at 46% -60%, var(--new-color_primary) -70%, var(--new-background_dark) 75%)"
                        : "none"
                }`,
                borderBottom: "0",
                borderRight: "0",
                borderLeft: "0",
                borderRadius: getBorderRadius(),
                ...getBorderStyle(),
            }}
            className={` py-4 w-full h-full gap-y-2 uppercase flex flex-col items-center justify-center transition-all duration-300 font-normal text-xs ${
                isActive ? "text-gradientPrimary " : "text-textSecondary"
            }`}
        >
            <img src={icon} alt={`${title} Icon`} className="w-6 h-6 mb-1" />
            <span>{title}</span>
        </button>
    );
}

export default BottombarItem;
