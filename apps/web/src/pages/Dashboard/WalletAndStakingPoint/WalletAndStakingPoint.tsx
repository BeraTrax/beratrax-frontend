import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEffect, useMemo, useState } from "react";
import { FaKey } from "react-icons/fa";
import { LiaPowerOffSolid } from "react-icons/lia";
import { MdOutlineContentCopy, MdOutlineQrCode2 } from "react-icons/md";
import { checkClaimBtx, claimBtx } from "@beratrax/core/src/api/account";
import { notifyError } from "@beratrax/core/src/api/notify";
import GreenLogo from "@beratrax/core/src/assets/images/greenLogo.png";
import StakingLogo from "@beratrax/core/src/assets/images/stakingLogo.png";
import { EarnTrax } from "web/src/components/modals/EarnTrax/EarnTrax";
import { ExportPrivateKey } from "web/src/components/modals/ExportPrivateKey/ExportPrivateKey";
import { ExportPublicKey } from "web/src/components/modals/ExportPublicKey/ExportPublicKey";
import SuccessfulEarnTrax from "web/src/components/modals/SuccessfulEarnTrax/SuccessfulEarnTrax";
import { TermsOfUseModal } from "web/src/components/modals/TermsOfUseModal/TermsOfUseModal";
import { blockExplorersByChainId } from "@beratrax/core/src/config/constants/urls";
import { useVaults } from "@beratrax/core/src/hooks";
import { useWallet } from "@beratrax/core/src/hooks";
import { useAppDispatch, useAppSelector } from "@beratrax/core/src/state";
import { sendBtxToXFollower, setAccountConnector } from "@beratrax/core/src/state/account/accountReducer";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { CHAIN_ID } from "@beratrax/core/src/types/enums";
import { copyToClipboard } from "@beratrax/core/src/utils";
import { trackLogin } from "@beratrax/core/src/utils/analytics";
import { formatCurrency } from "@beratrax/core/src/utils/common";
import { useAccount, useChainId, useDisconnect, useSwitchChain } from "wagmi";
// import StakingModal from "web/src/pages/Dashboard/Staking/StakingModal";

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
			await dispatch(
				setAccountConnector({
					address: currentWallet!,
					connector: connector.id,
				})
			);
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

	const { earnedTrax, totalEarnedTrax, totalEarnedTraxByReferral, earnedTraxByReferral } = useAppSelector((state) => state.account);
	const stakingPoints = (totalEarnedTrax || 0) > (earnedTrax || 0) ? totalEarnedTrax : earnedTrax;
	const referralPoints = (totalEarnedTraxByReferral || 0) > (earnedTraxByReferral || 0) ? totalEarnedTraxByReferral : earnedTraxByReferral;

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
			{/* Terms of Use Modal */}
			{openTermsOfUseModal !== null && currentWallet && openTermsOfUseModal ? (
				<TermsOfUseModal setOpenModal={setOpenTermsOfUseModal} />
			) : null}
			{openStakingModal ? (
				<div className="h-[100vh] w-full bg-bgDark"></div>
			) : (
				<div className="p-5">
					<div className="bg-bgDark">
						{/* Wallet Connected */}
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
									{/* Logout Button */}
									<LiaPowerOffSolid onClick={() => disconnect()} className="w-8 h-8 text-textWhite cursor-pointer z-10" />
								</div>
							</div>
						) : (
							// Connect Wallet Button
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
						<div className="z-20 flex justify-self-end gap-4 relative">
							{/* export keys */}
							{isSocial && (
								<div className="flex gap-4 relative group py-2.5 px-5 mt-4 h-auto bg-gradientPrimary rounded-xl shadow-[var(--rk-shadows-connectButton)]">
									<FaKey cursor="pointer" size={20} onClick={() => setOpenPrivateKeyModal(true)} />
									<MdOutlineQrCode2 cursor="pointer" size={23} onClick={() => setOpenQrCodeModal(true)} />
									<span className="invisible group-hover:visible absolute left-0 top-full bg-bgDark p-2 rounded-md border border-borderDark text-xs text-textWhite">
										Export keys
									</span>
									{openPrivateKeyModal ? <ExportPrivateKey setOpenModal={setOpenPrivateKeyModal} /> : null}
									{openQrCodeModal ? <ExportPublicKey setOpenModal={setOpenQrCodeModal} /> : null}
								</div>
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
								<p className="font-arame-mono text-lg font-normal text-textWhite relative uppercase">TOTAL STAKED</p>
							</div>
							<p className="font-league-spartan text-5xl font-bold text-textWhite relative top-4">
								${formatCurrency(userEarnedAmountOnVaults)}
							</p>
							<p className="pb-8">
								<img className="w-72 absolute bottom-[-4rem] right-3" src={StakingLogo} alt="Staking Icon" />
							</p>
							<div className="flex gap-x-4"></div>
						</div>
					)}
				</div>
			)}

			{/* Staking Modal */}
			{/* <StakingModal open={openStakingModal} setOpen={setOpenStakingModal} /> */}

			{/* Earn Trax Modal */}
			{currentWallet && !earnTraxTermsAgreed && openEarnTraxModal && (
				<EarnTrax setOpenModal={setOpenEarnTraxModal} setCongModal={setCongModel} />
			)}

			{/* Successful Earn Trax Modal */}
			{congModel && <SuccessfulEarnTrax handleClose={() => setCongModel(false)} />}
		</div>
	);
};
