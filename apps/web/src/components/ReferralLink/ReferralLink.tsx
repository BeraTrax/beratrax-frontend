import { useWallet } from "@beratrax/core/src/hooks";
import useAccountData from "@beratrax/core/src/state/account/useAccountData";
import { copyToClipboard } from "@beratrax/core/src/utils";
import React, { useState } from "react";
import { FaSquareXTwitter } from "react-icons/fa6";
import { MdOutlineContentCopy } from "react-icons/md";

interface IProps {}

const ReferralLink: React.FC<IProps> = () => {
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
      <div>
        <div className="flex bg-darkBg rounded-3xl border border-borderDark relative overflow-hidden p-4 w-full">
          <div className="relative w-full">
            <div className="flex justify-between items-center">
              <p className="font-arame-mono text-base text-textWhite font-normal py-1">YOUR REFERRAL LINK</p>
            </div>
            <p className="font-league-spartan font-light text-base text-textSecondary leading-5 mb-2">
              Share your referral link and earn exactly the same amount of BTX points of anyone who clicks it!
            </p>
            <div className={`flex justify-between w-full rounded-2xl bg-bgSecondary p-4 relative`}>
              <p className="font-league-spartan font-light text-base text-textWhite leading-5 overflow-hidden whitespace-nowrap text-ellipsis">
                {referralLink}
              </p>
              <div className="flex items-center">
                {copied && <span className="text-textWhite text-sm transition-opacity">Copied!</span>}
                <FaSquareXTwitter
                  onClick={shareOnTwitter}
                  className="text-white ml-4 cursor-pointer hover:opacity-80 transition-opacity text-xl"
                />
                <MdOutlineContentCopy
                  onClick={copy}
                  className={`text-white ml-4 cursor-pointer hover:opacity-80 transition-opacity ${
                    copied ? "text-textPrimary" : ""
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  return null;
};

export default ReferralLink;
