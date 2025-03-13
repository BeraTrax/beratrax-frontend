import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEffect, useMemo, useState } from "react";
import { FaKey } from "react-icons/fa";
import { LiaPowerOffSolid } from "react-icons/lia";
import { MdOutlineContentCopy, MdOutlineQrCode2 } from "react-icons/md";
import { checkClaimBtx, claimBtx } from "src/api/account";
import { notifyError } from "src/api/notify";
import GreenLogo from "src/assets/images/greenLogo.png";
import StakingLogo from "src/assets/images/stakingLogo.png";
import { EarnTrax } from "src/components/modals/EarnTrax/EarnTrax";
import { ExportPrivateKey } from "src/components/modals/ExportPrivateKey/ExportPrivateKey";
import { ExportPublicKey } from "src/components/modals/ExportPublicKey/ExportPublicKey";
import SuccessfulEarnTrax from "src/components/modals/SuccessfulEarnTrax/SuccessfulEarnTrax";
import { TermsOfUseModal } from "src/components/modals/TermsOfUseModal/TermsOfUseModal";
import { blockExplorersByChainId } from "src/config/constants/urls";
import { useVaults } from "@beratrax/core/hooks";
import { useWallet } from "@beratrax/core/hooks";
import { useAppDispatch, useAppSelector } from "src/state";
import { sendBtxToXFollower, setAccountConnector } from "src/state/account/accountReducer";
import useTokens from "src/state/tokens/useTokens";
import { CHAIN_ID } from "src/types/enums";
import { copyToClipboard } from "src/utils";
import { trackLogin } from "src/utils/analytics";
import { formatCurrency } from "src/utils/common";
import { useAccount, useChainId, useDisconnect, useSwitchChain } from "wagmi";
import StakingModal from "../Staking/StakingModal";

export const WalletAndStakingPoint: React.FC = () => {
  const {
    referralCode,
    connector: connectorId,
    xFollower,
    earnTraxTermsAgreed,
    termsOfUseAgreed,
  } = useAppSelector((state) => state.account);
  const { currentWallet, isConnecting, isSocial, getPublicClient } = useWallet();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { isConnected, connector } = useAccount();
  const { reloadBalances } = useTokens();
  const chainId = useChainId();
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [ensName, setEnsName] = useState<string | null>();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [openPrivateKeyModal, setOpenPrivateKeyModal] = useState(false);
  const [openQrCodeModal, setOpenQrCodeModal] = useState(false);
  const [openStakingModal, setOpenStakingModal] = useState(false);
  const [openEarnTraxModal, setOpenEarnTraxModal] = useState(false);
  const [congModel, setCongModel] = useState(false);
  const [openTermsOfUseModal, setOpenTermsOfUseModal] = useState<boolean | null>(null);

  const [isClaimingBtx, setIsClaimingBtx] = useState(false);
  const [hasClaimedBtx, setHasClaimedBtx] = useState(true);

  const { vaults: unsortedVaults, isLoading: loadingVaults } = useVaults();
  const vaults = useMemo(() => {
    return [...unsortedVaults].sort((a, b) => {
      if (a.isCurrentWeeksRewardsVault && !b.isCurrentWeeksRewardsVault) return -1;
      if (!a.isCurrentWeeksRewardsVault && b.isCurrentWeeksRewardsVault) return 1;
      return 0;
    });
  }, [unsortedVaults]);
  // const deprecatedVaults = useMemo(() => vaults.filter((vault) => vault.isDeprecated), [vaults]);

  const userEarnedAmountOnVaults = vaults
    .filter((vault) => !vault.isUpcoming)
    .reduce((acc, vault) => {
      return acc + vault.userVaultBalance * vault.priceOfSingleToken;
    }, 0);

  const dispatch = useAppDispatch();

  const buttonStyle = `bg-gradientPrimary text-bgDark font-bold text-lg px-8 py-4 rounded-2xl 
                        hover:scale-105 transition-all duration-200 shadow-lg 
                        border border-transparent hover:border-borderLight
                        relative overflow-hidden
                        before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent 
                        before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full
                        before:transition-transform before:duration-700 before:ease-in-out`;

  useEffect(() => {
    const setConnector = async () => {
      if (!connector || connectorId === connector.id) return;
      await dispatch(setAccountConnector({ address: currentWallet!, connector: connector.id }));
    };

    const fetchEnsName = async () => {
      if (!currentWallet) return;

      const publicClient = getPublicClient(CHAIN_ID.BERACHAIN);
      const ensName = await publicClient.getEnsName({ address: currentWallet });
      if (ensName) setEnsName(ensName);
    };
    fetchEnsName();
    setConnector();
  }, [currentWallet]);

  useEffect(() => {
    if (isConnected && currentWallet) {
      trackLogin(currentWallet);
      const checkClaimBtxApi = async () => {
        const res = await checkClaimBtx(currentWallet!);
        setHasClaimedBtx(res.hasClaimed);
      };

      checkClaimBtxApi();
    }
  }, [isConnected, currentWallet]);

  useEffect(() => {
    if (termsOfUseAgreed !== undefined && openTermsOfUseModal !== !termsOfUseAgreed) {
      setOpenTermsOfUseModal(!termsOfUseAgreed);
    }
  }, [termsOfUseAgreed, openTermsOfUseModal]);

  const { earnedTrax, totalEarnedTrax, totalEarnedTraxByReferral, earnedTraxByReferral } = useAppSelector(
    (state) => state.account
  );
  const stakingPoints = (totalEarnedTrax || 0) > (earnedTrax || 0) ? totalEarnedTrax : earnedTrax;
  const referralPoints =
    (totalEarnedTraxByReferral || 0) > (earnedTraxByReferral || 0) ? totalEarnedTraxByReferral : earnedTraxByReferral;

  const totalPoints = (stakingPoints || 0) + (referralPoints || 0);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 5)}...${address.slice(-4)}`;
  };
  const truncatedAddress = truncateAddress(currentWallet || "");

  const copy = () => {
    if (currentWallet) {
      setShowCopyFeedback(true);
      copyToClipboard(currentWallet, () => {
        setTimeout(() => {
          setShowCopyFeedback(false);
        }, 1000);
      });
    }
  };

  const verifyFollowAPI = async () => {
    await dispatch(sendBtxToXFollower({ address: currentWallet! }));
  };

  const claimBtxAPI = async () => {
    setIsClaimingBtx(true);
    await claimBtx(currentWallet!);
    await reloadBalances();
    setHasClaimedBtx(true);
    setIsClaimingBtx(false);
  };

  const handleClaimBtx = async () => {
    try {
      setIsClaimingBtx(true);
      await claimBtxAPI();
      setIsClaimingBtx(false);
    } catch (error) {
      console.error(error);
      notifyError({
        title: "Claim Testnet BTX failed",
        message: `Claim Testnet BTX failed`,
      });
      setIsClaimingBtx(false);
    }
  };

  return (
    <div className="bg-bgDark bg-[100%_20%] bg-no-repeat rounded-[2.5rem] rounded-tl-none rounded-tr-none border-b border-borderDark relative overflow-hidden">
      {/* Connect Wallet */}
      {openTermsOfUseModal !== null && currentWallet && openTermsOfUseModal ? (
        <TermsOfUseModal setOpenModal={setOpenTermsOfUseModal} />
      ) : null}
      {openStakingModal ? (
        <div className="h-[100vh] w-full bg-bgDark"></div>
      ) : (
        <div className="p-5">
          <div className="bg-bgDark">
            {currentWallet ? (
              <div className="flex items-center justify-between p-4">
                <div className="flex flex-col gap-y-4">
                  {/* Address */}
                  <div className="flex items-center relative">
                    <img className="w-8 mr-2" src={GreenLogo} alt="Staking Icon" />
                    <div className="flex flex-col pl-2">
                      <div className="flex items-center">
                        <a
                          target="_blank"
                          href={`${blockExplorersByChainId[chainId]}/address/${currentWallet}`}
                          className="font-arame-mono font-light text-lg text-textWhite leading-5"
                        >
                          {truncatedAddress}
                        </a>
                        <MdOutlineContentCopy onClick={copy} className="h-6 text-white ml-4 cursor-pointer" />
                        {showCopyFeedback && (
                          <div className="absolute left-1/2 -translate-x-1/2 -bottom-12 bg-bgPrimary text-white px-2 py-1 rounded text-xs text-center">
                            Address copied!
                          </div>
                        )}
                      </div>
                      {/* Beraname */}
                      <p
                        className="animate-pulse bg-gradient-to-r from-yellow-400 via-orange-500 to-teal-400 
                                                bg-clip-text text-transparent font-extrabold text-xl
                                                drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]
                                                hover:scale-105 transition-transform duration-200 "
                      >
                        {ensName || referralCode ? `${ensName || referralCode}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Switch to Berachain */}
                <div className="flex items-center gap-4">
                  {!isSocial && chainId !== CHAIN_ID.BERACHAIN && (
                    <button
                      onClick={() => switchChain({ chainId: CHAIN_ID.BERACHAIN })}
                      className="bg-bgPrimary text-white font-medium font-league-spartan rounded-xl px-4 py-2 cursor-pointer"
                    >
                      Switch to Berachain
                    </button>
                  )}
                  <LiaPowerOffSolid
                    onClick={() => disconnect()}
                    className="w-8 h-8 text-textWhite cursor-pointer z-10"
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  onClick={openConnectModal}
                  type="button"
                  className="bg-bgPrimary text-white font-medium font-league-spartan rounded-xl px-4 py-2 m-4 cursor-pointer"
                >
                  {isConnecting ? "Connecting..." : "Sign In/Up"}
                </button>
              </div>
            )}
          </div>

          {currentWallet && (
            <div className="z-10 flex justify-self-end gap-4 relative">
              {/* Buy BTX Tokens */}
              {/* <div className="group py-2.5 px-5 mt-4 h-auto bg-gradientPrimary rounded-xl shadow-[var(--rk-shadows-connectButton)]">
                                <button
                                    onClick={() =>
                                        window.open("https://x.com/beratrax/status/1886908020808143267", "_blank")
                                    }
                                >
                                    <span className="relative ">Buy BTX</span>
                                </button>
                            </div> */}

              {/* export keys */}
              {isSocial && (
                <div
                  className="flex gap-4 relative group py-2.5 px-5 mt-4 h-auto bg-gradientPrimary rounded-xl shadow-[var(--rk-shadows-connectButton)]"
                  // style={currentWallet ? {} : { display: "flex" }}
                >
                  <FaKey
                    // color={lightMode ? "var(--color_grey)" : "#ffffff"}
                    cursor="pointer"
                    size={20}
                    onClick={() => setOpenPrivateKeyModal(true)}
                  />
                  <MdOutlineQrCode2
                    // color={lightMode ? "var(--color_grey)" : "#ffffff"}
                    cursor="pointer"
                    size={23}
                    onClick={() => setOpenQrCodeModal(true)}
                  />
                  <span className="invisible group-hover:visible absolute left-0 top-full bg-bgDark p-2 rounded-md border border-borderDark text-xs text-textWhite">
                    Export keys
                  </span>
                  {openPrivateKeyModal ? <ExportPrivateKey setOpenModal={setOpenPrivateKeyModal} /> : null}
                  {openQrCodeModal ? <ExportPublicKey setOpenModal={setOpenQrCodeModal} /> : null}
                </div>
                // add hover to export keys title
              )}
            </div>
          )}

          {/* Points for staking */}
          {currentWallet && (
            <div className="mt-20">
              {/* Gradient background at bottom right */}
              <div
                className="absolute w-[26rem] h-[26rem] rounded-full 
                                bg-[radial-gradient(circle,_theme('colors.bgPrimary')_0%,_transparent_70%)] 
                                bottom-[-10rem] right-[-8rem]"
              />
              <div className="flex flex-row items-center gap-x-2 justify-start">
                {/* <img src={btxLogo} alt="BTX Logo" className="w-10 h-10" /> */}
                <p className="font-arame-mono text-lg font-normal text-textWhite relative uppercase">TOTAL STAKED</p>
              </div>
              <p className="font-league-spartan text-5xl font-bold text-textWhite relative top-4">
                ${formatCurrency(userEarnedAmountOnVaults)}
              </p>
              <p className="pb-8">
                <img className="w-72 absolute bottom-[-4rem] right-3" src={StakingLogo} alt="Staking Icon" />
              </p>
              {/* X Follow */}
              {/* {!xFollower && (
                                <div className="flex justify-start my-4">
                                    <button
                                        onClick={async () => {
                                            if (
                                                !verificationFailed &&
                                                !JSON.parse(localStorage.getItem("isFollowXButtonClicked") || "{}")
                                                    .clicked
                                            ) {
                                                window.open("https://x.com/beratrax", "_blank");
                                                setIsLoading(true);
                                                setTimeout(() => {
                                                    localStorage.setItem(
                                                        "isFollowXButtonClicked",
                                                        JSON.stringify({
                                                            address: currentWallet,
                                                            clicked: true,
                                                        })
                                                    );
                                                    setIsLoading(false);
                                                    setVerificationFailed(true);
                                                }, 5000);
                                            }
                                        }}
                                        className="relative bg-bgPrimary hover:bg-opacity-90 transition-all duration-200 text-textWhite text-sm font-arame-mono px-6 py-3 rounded-xl flex items-center gap-3 overflow-hidden cursor-pointer"
                                    >
                                        <div
                                            className="absolute inset-0 bg-gradient-to-r from-green-200/50 via-emerald-300/50 to-green-400/50 animate-[gradient_3s_ease_infinite]"
                                            style={{
                                                backgroundSize: "200% 200%",
                                                animation: "gradient 3s ease infinite",
                                                WebkitAnimation: "gradient 3s ease infinite",
                                                MozAnimation: "gradient 3s ease infinite",
                                            }}
                                        ></div>
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30"></div>
                                        <div className="relative flex items-center gap-3">
                                            {isLoading ? (
                                                <>
                                                    <svg
                                                        className="animate-spin h-5 w-5"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    <span>
                                                        {verificationFailed ||
                                                        JSON.parse(
                                                            localStorage.getItem("isFollowXButtonClicked") || "{}"
                                                        ).clicked
                                                            ? "Claiming..."
                                                            : "Verifying Follow..."}
                                                    </span>
                                                </>
                                            ) : verificationFailed ||
                                              (JSON.parse(localStorage.getItem("isFollowXButtonClicked") || "{}")
                                                  .address === currentWallet &&
                                                  JSON.parse(localStorage.getItem("isFollowXButtonClicked") || "{}")
                                                      .clicked) ? (
                                                <>
                                                    <span
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            try {
                                                                setIsLoading(true);
                                                                await verifyFollowAPI();
                                                                setVerificationFailed(false);
                                                                localStorage.removeItem("isFollowXButtonClicked");
                                                            } catch (error) {
                                                                setVerificationFailed(true);
                                                            } finally {
                                                                setIsLoading(false);
                                                            }
                                                        }}
                                                    >
                                                        Claim
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                    </svg>
                                                    <span>Follow on X to get 100 BTX Points</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                    <style>
                                        {`
                                    @keyframes gradient {
                                        0% { background-position: 0% 50%; }
                                        50% { background-position: 100% 50%; }
                                        100% { background-position: 0% 50%; }
                                    }
                                `}
                                    </style>
                                </div>
                            )} */}

              <div className="flex gap-x-4">
                {/* {!hasClaimedBtx && (
                                    <div className="flex justify-start relative mt-10">
                                        <button
                                            onClick={handleClaimBtx}
                                            disabled={isClaimingBtx}
                                            className={`${buttonStyle} ${
                                                isClaimingBtx ? "cursor-not-allowed opacity-75" : ""
                                            }`}
                                        >
                                            <span className="relative z-10 flex items-center gap-2">
                                                {isClaimingBtx && <ImSpinner8 className="animate-spinFast" />}
                                                {isClaimingBtx ? "Claiming..." : "Claim Testnet BTX"}
                                            </span>
                                        </button>
                                    </div>
                                )} */}
                {/* <div className="flex justify-start relative mt-10">
                                    <button onClick={() => setOpenStakingModal(true)} className={buttonStyle}>
                                        <span className="relative z-10">Stake BTX</span>
                                    </button>
                                </div> */}
              </div>
            </div>
          )}
        </div>
      )}
      <StakingModal open={openStakingModal} setOpen={setOpenStakingModal} />
      {currentWallet && !earnTraxTermsAgreed && openEarnTraxModal && (
        <EarnTrax setOpenModal={setOpenEarnTraxModal} setCongModal={setCongModel} />
      )}
      {congModel && <SuccessfulEarnTrax handleClose={() => setCongModel(false)} />}
    </div>
  );
};
