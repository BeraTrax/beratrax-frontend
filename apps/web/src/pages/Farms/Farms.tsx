import earnpagedots from "@beratrax/core/src/assets/images/earnpagedots.svg";
import earnpageleaves from "@beratrax/core/src/assets/images/earnpagetoprightleaves1.svg";
import earnpageleaves2 from "@beratrax/core/src/assets/images/earnpagetoprightleaves2.svg";
import { IS_LEGACY } from "@beratrax/core/src/config/constants";
import { useEarnPage } from "@beratrax/core/src/state/farms/hooks";
import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "web/src/components/BackButton/BackButton";
import FarmRow from "web/src/components/FarmItem/FarmRow";
import { FarmSortOptions } from "@beratrax/core/src/types/enums";

function Farms() {
	const navigate = useNavigate();
	const [openedFarm, setOpenedFarm] = useState<number | undefined>();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { sortedFarms, upcomingFarms, farms, selectedPlatform, setSelectedPlatform, setSortSelected, sortSelected } = useEarnPage();

	// Get unique platforms from farms including both original and secondary platforms
	const platforms = useMemo(() => {
		const uniquePlatforms = new Map<string, string>();
		farms.forEach((farm) => {
			if (farm.originPlatform && farm.platform_logo) {
				uniquePlatforms.set(farm.originPlatform, farm.platform_logo);
			}
			if (farm.secondary_platform) {
				// If secondary platform doesn't have a logo, use the primary platform's logo
				uniquePlatforms.set(farm.secondary_platform, farm.platform_logo || "");
			}
		});
		return Array.from(uniquePlatforms.entries()).sort((a, b) => a[0].localeCompare(b[0]));
	}, [farms]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="relative text-textWhite h-full overflow-y-auto overflow-x-hidden font-league-spartan">
			<img src={earnpageleaves2} alt="Dark green leaves" className="absolute -top-4 -right-1 w-50" />
			<img src={earnpageleaves} alt="Light green leaves" className="absolute top-0 right-0 w-40" />
			<img src={earnpagedots} alt="Dots" className="absolute top-2 right-14 w-40" />

			<div className="h-full pt-14 px-4 pb-2">
				<BackButton onClick={() => navigate(-1)} />

				{/* Header with Filter */}
				<div className="flex justify-between items-center mt-4">
					<h5 className="text-3xl font-bold uppercase">Earn</h5>
				</div>

				{farms.length === 0 ? (
					<div className="flex flex-col gap-2">
						<h6 className="mb-9 text-lg font-light">Vaults coming soon</h6>
					</div>
				) : (
					<div className="flex justify-between items-center mt-4">
						<h6 className="mb-9 text-lg font-light">Available Protocols</h6>
						{/* Filters */}
						<div className="flex items-center gap-4">
							{/* New Vaults Sort Option */}
							<button
								onClick={() =>
									setSortSelected(sortSelected === FarmSortOptions.New ? FarmSortOptions.APY_High_to_Low : FarmSortOptions.New)
								}
								className={`pointer flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
									sortSelected === FarmSortOptions.New
										? "bg-buttonPrimary border-buttonPrimary text-textWhite font-medium shadow-lg shadow-buttonPrimary/20"
										: "bg-transparent border-borderDark text-textSecondary hover:bg-bgPrimary/10"
								}`}
							>
								<svg
									className={`w-4 h-4 ${sortSelected === FarmSortOptions.New ? "text-textWhite" : "text-textSecondary"}`}
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<span className={`${sortSelected === FarmSortOptions.New ? "text-textWhite" : "text-textSecondary"}`}>New</span>
							</button>

							{/* Platform Filter */}
							<div className="relative" ref={dropdownRef}>
								<div
									className="flex items-center gap-2 bg-background border border-gray-700 rounded-lg text-white px-3 py-2 cursor-pointer"
									onClick={() => setIsDropdownOpen(!isDropdownOpen)}
								>
									{selectedPlatform ? (
										<>
											<img
												src={platforms.find(([p]) => p === selectedPlatform)?.[1]}
												alt={selectedPlatform}
												className="w-5 h-5"
												onError={(e) => {
													(e.target as HTMLImageElement).style.display = "none";
												}}
											/>
											<span>{selectedPlatform}</span>
										</>
									) : (
										<span>All Platforms</span>
									)}
									<svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
									</svg>
								</div>

								{isDropdownOpen && (
									<div className="absolute right-0 mt-2 w-48 bg-background/80 backdrop-blur-md border border-gray-700 rounded-lg shadow-lg z-10">
										<div
											className="px-3 py-2 cursor-pointer hover:bg-gray-800/50"
											onClick={() => {
												setSelectedPlatform(null);
												setIsDropdownOpen(false);
											}}
										>
											All Platforms
										</div>
										{platforms.map(([platform, logo]) => (
											<div
												key={platform}
												className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-800/50"
												onClick={() => {
													setSelectedPlatform(platform);
													setIsDropdownOpen(false);
												}}
											>
												<img
													src={logo}
													alt={platform}
													className="w-5 h-5"
													onError={(e) => {
														(e.target as HTMLImageElement).style.display = "none";
													}}
												/>
												<span>{platform}</span>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Vaults */}
				<div className="flex flex-col gap-2">
					{sortedFarms.map((farm, index) => (
						<FarmRow key={index + "nowallet"} farm={farm} openedFarm={openedFarm} setOpenedFarm={setOpenedFarm} />
					))}
				</div>
				{/* Bottom padding */}
				{(window.location.origin.includes("staging") || window.location.origin.includes("localhost")) && upcomingFarms.length > 0 && (
					<div className="flex flex-col mt-2 gap-2">
						{upcomingFarms.map((farm, index) => (
							<FarmRow key={index + "nowallet"} farm={farm} openedFarm={openedFarm} setOpenedFarm={setOpenedFarm} />
						))}
					</div>
				)}
				<div className="h-32"></div>
			</div>
		</div>
	);
}

export default Farms;
