interface SidebarItemProps {
	icon: React.ReactNode;
	title: string;
	iconRight?: React.ReactNode;
	active?: boolean;
	onClick?: () => void;
}

function SidebarItem({ icon, title, iconRight = null, active, ...props }: SidebarItemProps) {
	return (
		<div
			className={`
                flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer mb-1
                transition-all duration-200 ease-in-out
                ${active ? "bg-buttonPrimary hover:bg-buttonPrimaryLight" : "text-textSecondary hover:bg-bgDark hover:text-textPrimary"}
            `}
			onClick={props.onClick}
		>
			<span className={`${active ? "" : "text-inherit"}`}>{icon}</span>
			<p>{title}</p>
			{iconRight && <span className={`ml-auto ${active ? "" : "text-inherit"}`}>{iconRight}</span>}
		</div>
	);
}

export default SidebarItem;
