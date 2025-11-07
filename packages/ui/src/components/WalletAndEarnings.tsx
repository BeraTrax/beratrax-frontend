import { useEffect, useMemo, useState, useCallback, memo } from "react";
import { checkClaimBtx, claimBtx } from "@beratrax/core/src/api/account";
import { notifyError } from "@beratrax/core/src/api/notify";
import BlueLeaf from "@beratrax/core/src/assets/images/blueLeaf.png";
import RewardGlowIcon from "@beratrax/core/src/assets/images/rewardGlowIcon.svg";
import { SvgImage } from "./SvgImage/SvgImage";
import "react-native-get-random-values";
import "@ethersproject/shims";

import { blockExplorersByChainId } from "@beratrax/core/src/config/constants/urls";
import { useVaults } from "@beratrax/core/src/hooks";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useWallet } from "@beratrax/core/src/hooks";
import { useAppDispatch, useAppSelector } from "@beratrax/core/src/state";
import { sendBtxToXFollower, setAccountConnector } from "@beratrax/core/src/state/account/accountReducer";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { CHAIN_ID } from "@beratrax/core/src/types/enums";
import { copyToClipboard } from "@beratrax/core/src/utils";
import { trackLogin } from "@beratrax/core/src/utils/analytics";
import { formatCurrency } from "@beratrax/core/src/utils/common";

import { useAccount, useChainId, useDisconnect, useSwitchChain } from "wagmi";
import {
	View,
	Text,
	Button,
	Image,
	ImageSourcePropType,
	Platform,
	TouchableOpacity,
	ScrollView,
	Pressable,
	Dimensions,
	StyleSheet,
} from "react-native";
import { Link } from "./Link";
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";
import { GradientText } from "./GradientText";
import { PowerIcon, CopyIcon, KeysIcon, QrcodeIcon } from "../icons";
import { ExportPublicKey } from "./ExportPublicKey/ExportPublicKey";
import { ExportPrivateKey } from "./ExportPrivateKey/ExportPrivateKey";
import { LoginModal } from "@beratrax/mobile/app/components/LoginModal/LoginModal";
// import StakingModal from "web/src/pages/Dashboard/Staking/StakingModal";

import { WalletHookType } from "packages/core/src/hooks/useWallet";

const ExportPrivateKeyButton = memo(({ onPress }: { onPress: () => void }) => (
	<TouchableOpacity onPress={onPress}>
		<View className="flex flex-row items-center gap-1">
			<KeysIcon size={28} color="black" strokeWidth={1.5} className="w-7 h-7" />
		</View>
	</TouchableOpacity>
));

const ExportQrCodeButton = memo(({ onPress }: { onPress: () => void }) => (
	<TouchableOpacity onPress={onPress}>
		<View className="flex flex-row items-center gap-1">
			<QrcodeIcon size={28} color="black" strokeWidth={1.5} className="w-7 h-7" />
		</View>
	</TouchableOpacity>
));

const ExportKeysSection = memo(
	({
		isSocial,
		showExportKeysTooltip,
		handleShowExportKeysTooltip,
		handleHideExportKeysTooltip,
		handleOpenPrivateKeyModal,
		handleOpenQrCodeModal,
	}: {
		isSocial: boolean;
		showExportKeysTooltip: boolean;
		handleShowExportKeysTooltip: () => void;
		handleHideExportKeysTooltip: () => void;
		handleOpenPrivateKeyModal: () => void;
		handleOpenQrCodeModal: () => void;
	}) => {
		if (!isSocial) return null;

		return (
			<View className="z-[1] w-full flex flex-row justify-end gap-4 relative">
				<Pressable
					className="flex flex-row gap-2 group relative py-1.5 px-5 bg-gradientPrimary rounded-xl"
					onPressIn={handleShowExportKeysTooltip}
					onPressOut={handleHideExportKeysTooltip}
				>
					<ExportPrivateKeyButton onPress={handleOpenPrivateKeyModal} />
					<ExportQrCodeButton onPress={handleOpenQrCodeModal} />
					{showExportKeysTooltip && (
						<Text className="absolute group-hover:opacity-100 opacity-0 left-0 top-full bg-bgDark p-2 rounded-md border border-borderDark text-xs text-textWhite">
							Export keys
						</Text>
					)}
				</Pressable>
			</View>
		);
	}
);

export const WalletAndEarnings: React.FC<WalletHookType> = ({ connectWallet }) => {
	const {
		referralCode,
		connector: connectorId,
		xFollower,
		earnTraxTermsAgreed,
		termsOfUseAgreed,
	} = useAppSelector((state) => state.account);
	const { earningsUsd, isVaultEarningsFirstLoad } = useAppSelector((state) => state.farms);
	const { currentWallet, isConnecting, isSocial, getPublicClient } = useWallet();
	const { disconnect } = useDisconnect();
	const { switchChain } = useSwitchChain();
	const { openConnectModal } = useConnectModal();
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
	const [showExportKeysTooltip, setShowExportKeysTooltip] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);

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

	const handleConnect = useCallback(() => {
		if (Platform.OS === "web" && openConnectModal) {
			openConnectModal();
		} else {
			setShowLoginModal(true);
		}
	}, [Platform.OS, openConnectModal]);

	const connectButtonText = useMemo(
		() => <Text className="text-white font-medium font-league-spartan">{isConnecting ? "Connecting..." : "Sign In/Up"}</Text>,
		[isConnecting]
	);

	// Memoize the handlers to prevent recreation on each render
	const handleShowExportKeysTooltip = useCallback(() => setShowExportKeysTooltip(true), []);
	const handleHideExportKeysTooltip = useCallback(() => setShowExportKeysTooltip(false), []);
	const handleOpenPrivateKeyModal = useCallback(() => setOpenPrivateKeyModal(true), []);
	const handleOpenQrCodeModal = useCallback(() => setOpenQrCodeModal(true), []);

	return (
		<View className="z-[1] bg-bgDark bg-[100%_20%] bg-no-repeat rounded-[2.5rem] rounded-tl-none rounded-tr-none border-b border-borderDark relative overflow-hidden">
			{/* Shutdown Banner */}
			<View className="w-full bg-red-600 border-b border-red-500">
				<Text className="text-white text-center px-4 py-3 text-sm leading-5">
					The Trax project, platform, and token support are shutting down. Autocompounding will not be supported from November 15th. The
					website and apps will go down on December 31st. Please withdraw your funds. Open a ticket in Discord for withdraw support
				</Text>
			</View>
			{/* Terms of Use Modal */}
			{openTermsOfUseModal !== null && currentWallet && openTermsOfUseModal
				? null // <TermsOfUseModal setOpenModal={setOpenTermsOfUseModal} />
				: null}

			<View className="p-5">
				<View>
					{/* Wallet Connected */}
					{currentWallet ? (
						<View className="flex flex-row items-center justify-between p-4">
							<View className="flex flex-col gap-y-4">
								{/* Address */}
								<View className="flex flex-row items-center relative">
									<Image className="w-8 h-8 mr-2" source={BlueLeaf as ImageSourcePropType} alt="Staking Icon" />
									<View className="flex flex-col pl-2">
										<View className="flex flex-row items-center">
											<Link
												target="_blank"
												href={`${blockExplorersByChainId[chainId]}/address/${currentWallet}`}
												className="no-underline text-lg text-white leading-5 uppercase font-arame-mono font-normal"
											>
												<Text>{truncatedAddress}</Text>
											</Link>
											<TouchableOpacity onPress={copy}>
												<Text className="h-6 text-white ml-4 cursor-pointer">
													<CopyIcon />
												</Text>
											</TouchableOpacity>
											{showCopyFeedback && (
												<View className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-bgPrimary text-white px-2 py-1 rounded text-xs text-center whitespace-nowrap">
													<Text className="text-white whitespace-nowrap">Address copied!</Text>
												</View>
											)}
										</View>
										{/* Beraname */}
										{!openPrivateKeyModal &&
											!openQrCodeModal && ( // TODO: remove this once we have a better way to handle MaskedView hiding the modal
												<GradientText className="text-lg uppercase font-arame-mono font-normal">
													{ensName || referralCode ? `${ensName || referralCode}` : ""}
												</GradientText>
											)}
									</View>
								</View>
							</View>
							{/* Switch to Berachain */}
							<View className="flex flex-row items-center gap-4">
								{!isSocial && chainId !== CHAIN_ID.BERACHAIN && (
									<Pressable
										onPress={() => {
											switchChain({ chainId: CHAIN_ID.BERACHAIN });
										}}
										className="bg-bgPrimary text-white font-medium font-league-spartan rounded-xl px-4 py-2 cursor-pointer"
									>
										<Text className="text-white font-medium font-league-spartan">Switch to Berachain</Text>
									</Pressable>
								)}
								<PowerIcon
									onPress={() => {
										disconnect();
									}}
									size={42}
									strokeWidth={2}
									className="text-textWhite cursor-pointer z-[1]"
								/>
							</View>
						</View>
					) : (
						// Connect Wallet Button
						<View className="flex flex-row justify-end">
							<Pressable
								onPress={handleConnect}
								className="bg-bgPrimary text-white font-medium font-league-spartan rounded-xl px-4 py-2 m-4 cursor-pointer"
							>
								{connectButtonText}
							</Pressable>
						</View>
					)}
				</View>

				{/* export keys */}
				{currentWallet && (
					<ExportKeysSection
						isSocial={isSocial}
						showExportKeysTooltip={showExportKeysTooltip}
						handleShowExportKeysTooltip={handleShowExportKeysTooltip}
						handleHideExportKeysTooltip={handleHideExportKeysTooltip}
						handleOpenPrivateKeyModal={handleOpenPrivateKeyModal}
						handleOpenQrCodeModal={handleOpenQrCodeModal}
					/>
				)}

				{/* Points for staking */}
				{currentWallet && (
					<View className="mt-20 relative z-[-1]">
						<View className="absolute w-[26rem] h-[26rem] bottom-[-10rem] right-[-8rem]">
							<Svg height="100%" width="100%" viewBox="0 0 520 520">
								<Defs>
									<RadialGradient id="grad" cx="320" cy="320" rx="320" ry="320" fx="320" fy="320" gradientUnits="userSpaceOnUse">
										<Stop offset="0" stopColor="#3B7EE3" stopOpacity="1" />
										<Stop offset="0.3" stopColor="#3B7EE3" stopOpacity="0.95" />
										<Stop offset="0.5" stopColor="#3B7EE3" stopOpacity="0.85" />
										<Stop offset="0.65" stopColor="#3B7EE3" stopOpacity="0.7" />
										<Stop offset="0.75" stopColor="#3B7EE3" stopOpacity="0.5" />
										<Stop offset="0.85" stopColor="#3B7EE3" stopOpacity="0.3" />
										<Stop offset="0.92" stopColor="#3B7EE3" stopOpacity="0.15" />
										<Stop offset="0.97" stopColor="#3B7EE3" stopOpacity="0.05" />
										<Stop offset="1" stopColor="#3B7EE3" stopOpacity="0" />
									</RadialGradient>
								</Defs>
								<Circle cx="320" cy="320" r="320" fill="url(#grad)" />
							</Svg>
						</View>
						<View className="flex flex-row items-center gap-x-2 justify-start">
							<Text className="font-arame-mono text-lg font-normal text-textWhite relative uppercase">TOTAL Earnings</Text>
						</View>
						{isVaultEarningsFirstLoad || earningsUsd === null || earningsUsd === undefined ? (
							<View className="flex items-start h-[3.75rem] mt-4">
								<View className="h-12 w-32 bg-white/30 rounded-md animate-pulse"></View>
							</View>
						) : (
							<Text className="font-league-spartan text-5xl font-bold text-textWhite relative top-4">${formatCurrency(earningsUsd)}</Text>
						)}
						<View className="pb-8 absolute bottom-[-3rem] right-[1rem]">
							<SvgImage source={RewardGlowIcon} width={130} height={200} />
						</View>
						<View className="flex gap-x-4"></View>
					</View>
				)}
			</View>

			{/* Staking Modal */}
			{/* <StakingModal open={openStakingModal} setOpen={setOpenStakingModal} /> */}

			{/* Earn Trax Modal */}
			{/* {currentWallet && !earnTraxTermsAgreed && openEarnTraxModal && (
        <EarnTrax setOpenModal={setOpenEarnTraxModal} setCongModal={setCongModel} />
      )} */}

			{/* Successful Earn Trax Modal */}
			{/* {congModel && <SuccessfulEarnTrax handleClose={() => setCongModel(false)} />} */}

			{openPrivateKeyModal ? <ExportPrivateKey setOpenModal={setOpenPrivateKeyModal} /> : null}
			{openQrCodeModal ? <ExportPublicKey setOpenModal={setOpenQrCodeModal} /> : null}

			{/* Login Modal */}
			{/* only for mobile app */}
			{showLoginModal && connectWallet && (
				// @ts-ignore
				<LoginModal visible={showLoginModal} onClose={() => setShowLoginModal(false)} connectWallet={connectWallet} />
			)}
		</View>
	);
};
