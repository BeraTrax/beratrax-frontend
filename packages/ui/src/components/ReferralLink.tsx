import React, { useState } from "react";
import { useWallet } from "@beratrax/core/src/hooks";
import { copyToClipboard } from "@beratrax/core/src/utils";
import { FaSquareXTwitter } from "react-icons/fa6";
import { MdOutlineContentCopy } from "react-icons/md";
import { View, Text } from "react-native";
import useAccountData from "@beratrax/core/src/state/account/useAccountData";

interface IProps {}

export const ReferralLink: React.FC<IProps> = () => {
  const { referralLink } = useAccountData();
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
    const text =
      "Beras, follow the trax to the #BeraTrax dapp! Use my referral link to one-click stake, and start earning BTX points!";
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
      referralLink || ""
    )}`;
    window.open(url, "_blank");
  };

  if (currentWallet && referralLink)
    return (
      <View>
        <View className="flex flex-row bg-darkBg rounded-3xl border border-borderDark relative overflow-hidden p-4 w-full">
          <View className="relative w-full">
            <View className="flex flex-row justify-between items-center">
              <Text className="font-arame-mono text-base text-textWhite font-normal py-1">
                YOUR REFERRAL LINK
              </Text>
            </View>
            <Text className="font-league-spartan font-light text-base text-gray-300 leading-5 mb-2">
              Share your referral link and earn exactly the same amount of BTX
              points of anyone who clicks it!
            </Text>
            <View
              className={`flex flex-row justify-between w-full rounded-2xl bg-bgSecondary p-4 relative`}
            >
              <Text className="font-league-spartan font-light text-base text-textWhite leading-5 overflow-hidden whitespace-nowrap text-ellipsis">
                {referralLink}
              </Text>
              <View className="flex flex-row items-center">
                {copied && (
                  <Text className="text-textWhite text-sm transition-opacity">
                    Copied!
                  </Text>
                )}
                {/* <FaSquareXTwitter
                  onClick={shareOnTwitter}
                  className="text-white ml-4 cursor-pointer hover:opacity-80 transition-opacity text-xl"
                />
                <MdOutlineContentCopy
                  onClick={copy}
                  className={`text-white ml-4 cursor-pointer hover:opacity-80 transition-opacity ${
                    copied ? "text-textPrimary" : ""
                  }`}
                /> */}
              </View>
            </View>
          </View>
        </View>
      </View>
    );

  return null;
};
