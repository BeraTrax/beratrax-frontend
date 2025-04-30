import React, { useState } from "react";
import { useWallet } from "@beratrax/core/src/hooks";
import { copyToClipboard } from "@beratrax/core/src/utils";
import { View, Text } from "react-native";
import useAccountData from "@beratrax/core/src/state/account/useAccountData";
import { CopyIcon } from "../icons/Copy";
import { TwitterIcon } from "../icons/Twitter";
import { Platform } from "react-native";

interface IProps {}

export const ReferralLink: React.FC<IProps> = () => {
	const { referralLink, referralCode } = useAccountData();
	const { currentWallet } = useWallet();
	const [copied, setCopied] = useState(false);

	const copy = () => {
		if (referralLink) {
			setCopied(true);
			copyToClipboard(referralLink, () => {
				setTimeout(() => {
					setCopied(false);
				}, 2000);
			});
		}
	};

	const shareOnTwitter = () => {
		const text = "Beras, follow the trax to the #BeraTrax dapp! Use my referral link to one-click stake, and start earning BTX points!";
		const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink || "")}`;
		window.open(url, "_blank");
	};

	if (currentWallet && referralLink)
		return (
			<View>
				<View className="flex flex-row bg-darkBg rounded-3xl border border-borderDark relative overflow-hidden p-4 w-full">
					<View className="relative w-full">
						<View className="flex flex-row justify-between items-center">
							<Text className="font-arame-mono text-base text-textWhite font-normal py-1">
								YOUR REFERRAL {Platform.OS === "web" ? "LINK" : "CODE"}
							</Text>
						</View>
						<Text className="font-league-spartan font-light text-base text-gray-300 leading-5 mb-2">
							Share your referral {Platform.OS === "web" ? "link" : "code"} and earn exactly the same amount of BTX points of anyone who
							clicks it!
						</Text>
						<View className={`flex flex-row  p-4 relative justify-between`}>
							<View className="flex flex-col ">
								<Text className="font-league-spartan font-light text-base text-textWhite leading-5 overflow-hidden whitespace-nowrap text-ellipsis">
									{Platform.OS === "web" ? referralLink : referralCode}
								</Text>
							</View>

							<View className="flex flex-row items-center">
								<TwitterIcon
									onPress={shareOnTwitter}
									className={`icon-tabler-brand-x text-white ml-4 cursor-pointer hover:opacity-80 transition-opacity ${copied ? "text-textPrimary" : ""}`}
								/>
								<CopyIcon
									onPress={copy}
									className={`icon-tabler-copy text-white ml-4 cursor-pointer hover:opacity-80 transition-opacity ${copied ? "text-textPrimary" : ""}`}
								/>
							</View>
						</View>
					</View>
				</View>
			</View>
		);

	return null;
};
