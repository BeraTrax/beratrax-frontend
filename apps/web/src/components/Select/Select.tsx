import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
// dropdowniconnobg

interface IProps {
	value: string;
	setValue: Dispatch<SetStateAction<string>>;
	options?: string[];
	extraText?: string[];
	size?: "small";
	className?: string;
	images?: Record<string, string[]>;
}

export const Select: FC<IProps> = ({ value, setValue, options, extraText, size, className = "", images }) => {
	const [openSelect, setOpenSelect] = useState(false);
	const [maxWidth, setMaxWidth] = useState<number>(0);

	useEffect(() => {
		if (options && value) {
			if (!options.includes(value)) setValue(options[0]);
		}
	}, [options, value]);

	useEffect(() => {
		if (options) {
			const tempDiv = document.createElement("div");
			tempDiv.style.visibility = "hidden";
			tempDiv.style.position = "absolute";
			tempDiv.style.padding = "0.75rem"; // py-3
			document.body.appendChild(tempDiv);

			const widths = options.map((option, index) => {
				tempDiv.textContent = `${option} ${extraText?.[index] || ""}`;
				return tempDiv.offsetWidth;
			});

			document.body.removeChild(tempDiv);
			setMaxWidth(Math.max(...widths) + 70);
		}
	}, [options, extraText]);

	return (
		<div className={`${className} relative w-fit justify-self-end `}>
			<OutsideClickHandler display="inline-block" onOutsideClick={() => setOpenSelect(false)}>
				<div
					className={`relative rounded-2xl flex gap-x-6 w-auto px-3 py-4 cursor-pointer text-text bg-bgSecondary ${
						size === "small" ? "w-[50px]" : ""
					}`}
					style={{ minWidth: `${Math.max(200, maxWidth)}px` }}
					onClick={() => setOpenSelect((prev) => !prev)}
				>
					<div className="flex gap-2 items-center justify-between flex-grow">
						{extraText && options && (
							<span className="flex">
								<img className="w-5 h-5" src={images?.[value]?.[0]} alt="logo" style={{ clipPath: "circle(50%)" }} />
								{images && images?.[value]?.length > 1 && (
									<img className="w-5 h-5 -ml-3" src={images?.[value]?.[1]} alt="logo" style={{ clipPath: "circle(50%)" }} />
								)}
							</span>
						)}
						<span>
							{value} {extraText && extraText[options!.reduce((prev, curr, index) => (curr === value ? index : prev), 0)]}
						</span>
						<svg
							className={`fill-textWhite text-textWhite text-[16px] font-light mt-4 transform -translate-y-1/2 transition-transform ${
								openSelect ? "rotate-180" : ""
							}`}
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<g clipPath="url(#clip0_340_7091)">
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M13.5244 5.76215L7.82531 11.4612L7.7623 11.3982L7.6994 11.4611L2.0003 5.76203L3.41451 4.34782L7.76241 8.69572L12.1102 4.34793L13.5244 5.76215Z"
									fill="text-textWhite"
								/>
							</g>
							<defs>
								<clipPath id="clip0_340_7091">
									<rect width="16" height="16" fill="white" />
								</clipPath>
							</defs>
						</svg>
					</div>
				</div>
				{openSelect && (
					<div
						className="absolute right-0 z-10 w-auto max-w-[400px] bg-bgSecondary rounded top-[120%] p-2 flex flex-wrap justify-around"
						style={{ minWidth: `${Math.max(200, maxWidth)}px` }}
					>
						{options?.map((option, index) => (
							<div
								key={index}
								className="flex gap-2 items-center justify-between flex-grow px-3 py-3 border-b last:border-b-0 cursor-pointer text-grey hover:text-primary whitespace-nowrap"
								onClick={() => {
									setValue(option);
									setOpenSelect(false);
								}}
							>
								<div className="flex gap-x-2 justify-between items-center">
									<span className="flex">
										<img className="w-5 h-5" src={images?.[option]?.[0]} alt="logo" style={{ clipPath: "circle(50%)" }} />
										{images && images?.[option]?.length > 1 && (
											<img className="w-5 h-5 -ml-3" src={images?.[option]?.[1]} alt="logo" style={{ clipPath: "circle(50%)" }} />
										)}
									</span>
									<span>{option}</span>
								</div>
								<span>{extraText && extraText[index]}</span>
							</div>
						))}
					</div>
				)}
			</OutsideClickHandler>
		</div>
	);
};
