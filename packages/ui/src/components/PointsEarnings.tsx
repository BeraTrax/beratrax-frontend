import { customCommify } from "@beratrax/core/src/utils/common";
import { useAppSelector } from "@beratrax/core/src/state";
import ReferralLogo from "@beratrax/core/src/assets/images/referralLogo.png";
import DailyRateLogo from "@beratrax/core/src/assets/images/dailyRateLogo.png";
import { Boosts } from "@beratrax/core/src/state/account/types";
import { useState } from "react";
import { useEffect } from "react";
import { View, Text, Image, ImageSourcePropType } from "react-native";
import { GradientText } from "./GradientText";

interface Props {}

export const PointsEarnings: React.FC<Props> = () => {
	const { referralCount } = useAppSelector((state) => state.account);
	const { earnedTrax, totalEarnedTrax, totalEarnedTraxByReferral, earnedTraxByReferral, boosts } = useAppSelector((state) => state.account);
	const stakingPoints = ((totalEarnedTrax || 0) > (earnedTrax || 0) ? totalEarnedTrax : earnedTrax) ?? 0;
	const referralPoints =
		((totalEarnedTraxByReferral || 0) > (earnedTraxByReferral || 0) ? totalEarnedTraxByReferral : earnedTraxByReferral) ?? 0;

	const [clipPathValue, setClipPathValue] = useState<string>(
		"polygon( 4.834% 0%,4.834% 0%,4.05% 0.105%,3.306% 0.408%,2.612% 0.893%,1.979% 1.544%,1.416% 2.343%,0.933% 3.275%,0.54% 4.324%,0.246% 5.471%,0.063% 6.702%,0% 8%,0% 92%,0% 92%,0.063% 93.298%,0.246% 94.529%,0.54% 95.677%,0.933% 96.725%,1.416% 97.657%,1.979% 98.457%,2.612% 99.107%,3.306% 99.592%,4.05% 99.895%,4.834% 100%,42.598% 100%,47.432% 100%,47.432% 100%,47.432% 100%,47.433% 100%,47.433% 100%,47.433% 100%,47.434% 100%,47.434% 100%,47.434% 100%,47.435% 100%,47.435% 100%,47.435% 100%,95.166% 100%,95.166% 100%,95.95% 99.895%,96.694% 99.592%,97.388% 99.107%,98.021% 98.457%,98.584% 97.657%,99.067% 96.725%,99.46% 95.677%,99.754% 94.529%,99.937% 93.298%,100% 92%,100% 16.5%,100% 16.5%,99.937% 15.202%,99.754% 13.971%,99.46% 12.824%,99.067% 11.775%,98.584% 10.843%,98.021% 10.044%,97.388% 9.393%,96.694% 8.908%,95.95% 8.605%,95.166% 8.5%,47.432% 8.5%,42.598% 8.5%,40.835% 8.5%,40.835% 8.5%,40.518% 8.483%,40.203% 8.431%,39.892% 8.347%,39.586% 8.229%,39.286% 8.078%,38.992% 7.896%,38.705% 7.682%,38.427% 7.437%,38.158% 7.162%,37.9% 6.857%,33.777% 1.643%,33.777% 1.643%,33.518% 1.338%,33.25% 1.063%,32.972% 0.818%,32.685% 0.604%,32.391% 0.422%,32.091% 0.271%,31.784% 0.153%,31.474% 0.069%,31.159% 0.017%,30.842% 0%,4.834% 0% )"
	);

	useEffect(() => {
		const handleResize = () => {
			const mobileClipPath =
				"polygon( 0% 8%,0% 8%,0.121% 6.702%,0.471% 5.471%,1.032% 4.324%,1.784% 3.275%,2.709% 2.343%,3.786% 1.544%,4.998% 0.893%,6.325% 0.408%,7.748% 0.105%,9.249% 0%,59.01% 0%,59.01% 0%,59.617% 0.017%,60.218% 0.069%,60.813% 0.153%,61.399% 0.271%,61.974% 0.422%,62.536% 0.604%,63.084% 0.818%,63.616% 1.063%,64.131% 1.338%,64.625% 1.643%,72.514% 6.857%,72.514% 6.857%,73.008% 7.162%,73.522% 7.437%,74.054% 7.682%,74.603% 7.896%,75.165% 8.078%,75.74% 8.229%,76.326% 8.347%,76.92% 8.431%,77.522% 8.483%,78.129% 8.5%,90.751% 8.5%,90.751% 8.5%,92.252% 8.605%,93.675% 8.908%,95.002% 9.393%,96.214% 10.044%,97.291% 10.843%,98.216% 11.775%,98.968% 12.824%,99.529% 13.971%,99.879% 15.202%,100% 16.5%,100% 92%,100% 92%,99.879% 93.298%,99.529% 94.529%,98.968% 95.677%,98.216% 96.725%,97.291% 97.657%,96.214% 98.457%,95.002% 99.107%,93.675% 99.592%,92.252% 99.895%,90.751% 100%,9.249% 100%,9.249% 100%,7.748% 99.895%,6.325% 99.592%,4.998% 99.107%,3.786% 98.457%,2.709% 97.657%,1.784% 96.725%,1.032% 95.677%,0.471% 94.529%,0.121% 93.298%,0% 92%,0% 8% )";
			const desktopClipPath = clipPathValue;

			setClipPathValue(window.innerWidth < 768 ? mobileClipPath : desktopClipPath);
		};

		handleResize(); // Initial check
		// window.addEventListener("resize", handleResize);

		// return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<View className={`flex flex-row gap-4 ${stakingPoints ? "gap-5" : ""}`}>
			<View className="flex-1 rounded-3xl border border-borderDark p-2 bg-[url('/src/assets/images/referralBg.png')] bg-cover bg-center bg-no-repeat">
				<Image source={ReferralLogo as ImageSourcePropType} alt="Referral Logo" className="mt-[-0.5rem] mb-[0.5rem] w-28 h-28" />
				<View className="pl-3">
					<Text className="font-arame-mono font-normal text-base leading-4 text-textWhite">TOTAL POINTS</Text>
					<Text className="font-arame-mono font-normal text-base leading-4 text-textWhite">FROM STAKING</Text>
					<Text className="font-league-spartan font-bold text-textWhite text-3xl leading-[3.75rem]">
						{customCommify(stakingPoints, {
							minimumFractionDigits: 0,
							maximumFractionDigits: 2,
							showDollarSign: false,
						})}
					</Text>
					<GradientText>x2 Multiplier-Mainnet 🚀</GradientText>
					{boosts && boosts.includes(Boosts.NFT) && <GradientText>x2 Multiplier - NFT 🚀</GradientText>}
					{boosts && boosts.includes(Boosts.BETA) && <GradientText>x1.5 Multiplier - BETA 🚀</GradientText>}
					{boosts && boosts.includes(Boosts.BETA_TESTER) && <GradientText>x2 Multiplier - BETA TESTER 🚀</GradientText>}
				</View>
			</View>

			<View
				// style={{
				//   clipPath: clipPathValue,
				// }}
				className={`flex-1 rounded-3xl text-textWhite bg-bgPrimary ${referralPoints ? "" : "p-2"}`}
			>
				<Image source={DailyRateLogo as ImageSourcePropType} alt="Daily Rate Logo" className="ml-[-1.5rem] mt-[-1.5rem] w-32 h-32" />
				<Text className={`font-arame-mono font-normal text-base text-bgDark leading-4 pl-3`}>TOTAL POINTS</Text>
				<Text className="font-arame-mono font-normal text-base leading-4 pl-3">FROM REFERRALS</Text>
				<Text className="font-league-spartan font-bold text-bgDark text-3xl leading-10 pl-3 pt-2">
					{customCommify(referralPoints || 0, {
						minimumFractionDigits: 0,
						showDollarSign: false,
					})}
				</Text>
				<Text className="font-arame-mono font-normal text-bgDark text-sm pl-3">{referralCount || 0} successful referrals</Text>
			</View>
		</View>
	);
};
