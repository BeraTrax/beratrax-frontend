interface Props {
	heading: string;
	value: number | undefined;
	icon?: string;
	gradientClass?: string;
}

export const StatsCard: React.FC<Props> = ({ heading, value, icon, gradientClass }) => {
	return (
		<div className={`relative overflow-hidden rounded-lg p-4 border border-borderDark ${gradientClass || "bg-bgSecondary"}`}>
			{/* Background glow effect */}
			<div className="absolute inset-0 bg-gradient-to-r from-transparent via-textPrimary/5 to-transparent animate-shimmer" />

			<div className="relative z-10 flex flex-col justify-between gap-y-4 text-2xl">
				<div className="flex items-center gap-2 text-textBlack text-lg font-semibold uppercase">
					{icon && <span>{icon}</span>}
					<p className="font-arame-mono">{heading}</p>
				</div>
				<p className="text-textWhite font-bold">{value?.toLocaleString("en-US")}</p>
			</div>

			{/* Decorative corner accent */}
			<div className="absolute -top-6 -right-6 w-12 h-12 bg-textPrimary/10 rounded-full blur-xl" />
		</div>
	);
};
