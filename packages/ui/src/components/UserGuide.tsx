import { ReactNode } from "react";
import userguideimagefive from "@beratrax/core/src/assets/images/userguideimagefive.png";
import userguideimagefour from "@beratrax/core/src/assets/images/userguideimagefour.png";
import userguideimageone from "@beratrax/core/src/assets/images/userguideimageone.png";
import userguideimagesix from "@beratrax/core/src/assets/images/userguideimagesix.png";
import userguideimagethree from "@beratrax/core/src/assets/images/userguideimagethree.png";
import userguideimagetwo from "@beratrax/core/src/assets/images/userguideimagetwo.png";
import { View, Text, Image, ScrollView, ImageSourcePropType, Dimensions, Platform, Linking, Pressable } from "react-native";
import { DiamondFillIcon } from "../icons/DiamondFill";
import { QuestionIcon } from "../icons/Question";
import { ChatCircleIcon } from "../icons/ChatCircle";
import { WebsiteIcon } from "../icons/Website";
import Colors from "@beratrax/typescript-config/Colors";
import { CheckCircleIcon } from "../icons/CheckCircle";
import { CircleOneIcon } from "../icons/CircleOne";
import { CircleTwoIcon } from "../icons/CircleTwo";
import { CircleThreeIcon } from "../icons/CircleThree";
import { CircleFourIcon } from "../icons/CircleFour";
import { ExternalLinkIcon } from "@beratrax/ui/src/icons/ExternalLInk";
import { HorizontalLine } from "./HorizontalLine";
// Type the imported images explicitly as ImageSourcePropType
const images = {
	one: userguideimageone as ImageSourcePropType,
	two: userguideimagetwo as ImageSourcePropType,
	three: userguideimagethree as ImageSourcePropType,
	four: userguideimagefour as ImageSourcePropType,
	five: userguideimagefive as ImageSourcePropType,
	six: userguideimagesix as ImageSourcePropType,
};

const BulletPoint = ({ icon, children, className }: { icon: ReactNode; children: ReactNode; className?: string }) => {
	return (
		<View className={`flex flex-row items-start mb-2 ${className}`}>
			<View className="shrink-0 mr-2 mt-1">{icon}</View>
			<View className="flex-1">
				{typeof children === "string" ? (
					<Text className={`font-league-spartan ${Platform.OS === "web" ? "text-xl" : "text-base"} text-textWhite`}>{children}</Text>
				) : (
					children
				)}
			</View>
		</View>
	);
};

function isPlatformWeb() {
	return Platform.OS === "web";
}

const sectionTitleStyle = `font-league-spartan ${isPlatformWeb() ? "text-4xl" : "text-[23px]"} mt-4 mb-2 text-textWhite leading-none uppercase`;
const subTitleStyle = `font-league-spartan ${isPlatformWeb() ? "text-[28px]" : "text-[20px]"} mt-2 mb-1 text-textWhite leading-none`;
const paragraphStyle = `font-league-spartan ${isPlatformWeb() ? "text-[20px]" : "text-[16px]"} text-textWhite font-light`;
const linkStyle = "text-[#2d72da] underline";

const ResponsiveImage = ({
	source,
	aspectRatio = 1.4,
	width: customWidth,
}: {
	source: ImageSourcePropType;
	aspectRatio?: number;
	width?: number;
}) => {
	const screenWidth = Dimensions.get("window").width;

	// calculates the optimal width for the image based on the device's screen width
	const width = customWidth ?? Math.min(screenWidth - 40, 600);

	return (
		<View className="w-full max-w-full overflow-hidden items-center my-4">
			<Image
				source={source}
				style={{
					width: width,
					height: width / aspectRatio,
					maxWidth: "100%",
				}}
				resizeMode="contain"
			/>
		</View>
	);
};

export const UserGuide = () => {
	return (
		<ScrollView
			className="flex flex-1 overflow-auto"
			contentContainerStyle={{ flexGrow: 1 }}
			showsHorizontalScrollIndicator={false}
			horizontal={false}
		>
			<View className="p-5 gap-4 text-xl">
				<Text
					className={`font-league-spartan font-bold ${isPlatformWeb() ? "text-4xl" : "text-2xl"} leading-none uppercase text-textWhite`}
				>
					💰 Trax User Guide: Your Gateway to Seamless DeFi on Berachain
				</Text>
				<Text className={paragraphStyle}>
					Welcome to <Text className="font-bold"> Trax</Text>, the easiest way to access{" "}
					<Text className="font-bold">
						yield-earning vaults, auto-compounded rewards, and Berachain's Proof of Liquidity system—all through your phone.
					</Text>
					Whether you're new to DeFi or a seasoned yield farmer, Trax is built to <Text className="font-bold">remove the complexity</Text>{" "}
					and help you maximize your returns.
				</Text>
				<HorizontalLine />

				{/* SECTION 1 GETTING STARTED*/}
				<>
					<Text className={sectionTitleStyle}>Getting Started with Trax</Text>
					<Text className={subTitleStyle}>Step 1: Signing In</Text>
					<Text className={`${paragraphStyle} my-4`}> Trax offers two ways to get started:</Text>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className={`font-league-spartan ${Platform.OS === "web" ? "text-xl" : "text-base"} text-textWhite`}>
							<Text className="font-bold">Social Login</Text> – Sign in instantly using an email, Twitter, or Discord (you own your social
							wallet, &amp; can export you key)
						</Text>
					</BulletPoint>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className={`font-league-spartan ${Platform.OS === "web" ? "text-xl" : "text-base"} text-textWhite`}>
							<Text className="font-bold">Wallet Connection</Text> – Use{" "}
							<Text className="font-bold">MetaMask, WalletConnect, or Ledger</Text> to connect an existing wallet.
						</Text>
					</BulletPoint>

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className={`font-league-spartan ${Platform.OS === "web" ? "text-xl" : "text-base"} text-textWhite`}>
							<Text className="font-bold">First-time users? </Text>
							If signing in via social login, Trax will
							<Text className="font-bold"> automatically create a wallet</Text> for you on Berachain's mainnet.
						</Text>
					</BulletPoint>

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className={`font-league-spartan ${Platform.OS === "web" ? "text-xl" : "text-base"} text-textWhite`}>
							<Text className="font-bold">Gas money? </Text>
							All transactions are covered on Trax so you don't need to have BERA to use it.
						</Text>
					</BulletPoint>

					<ResponsiveImage source={images.one} aspectRatio={600 / 425} />

					<Text className={subTitleStyle}>Step 2: Funding Your Wallet</Text>

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							Trax will soon have fiat onramps for you to purchase BERA directly to deposit into vaults
						</Text>
					</BulletPoint>

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							Until then, you must either have airdrop funds from Berachain, or bridge them over to your wallet.
						</Text>
					</BulletPoint>

					<Text className={subTitleStyle}>Step 3: Earn Rewards</Text>
					<ResponsiveImage source={images.two} aspectRatio={800 / 80} width={1000} />

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							Go to the "Earn" tab a the bottom of your screen (or on the side on desktop) &amp; pick which vault you want to deposit into,
							tap it, and open up the details page.
						</Text>
					</BulletPoint>

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							If you wish to deposit, just tap deposit, type in your deposit amount (or tap "Max") and then confirm. That's all it takes!
						</Text>
					</BulletPoint>

					<Text className="text-textWhite text-xl font-league-spartan">Each vault displays:</Text>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite text-xl font-league-spartan">Supported Assets</Text> – (e.g., BERA or HONEY)
						</Text>
					</BulletPoint>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">Current APY</Text> – (estimated yield on our vaults)
						</Text>
					</BulletPoint>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">Bonus Rewards</Text> – (e.g., BGT emissions, partner incentives)
						</Text>
					</BulletPoint>
				</>
				<HorizontalLine />

				{/* SECTION 2 DASHBOARD */}
				<>
					<Text className={sectionTitleStyle}>Exploring the Dashboard</Text>
					<Text className={paragraphStyle}>
						After signing in, you'll land on the <Text className="font-bold"> Trax Dashboard.</Text>
					</Text>
					<Text className={paragraphStyle}>Here's what you'll see:</Text>
					<ResponsiveImage source={images.three} width={700} />

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">Your Portfolio</Text> – Track your balances, staked assets, and earnings in
							real-time.
						</Text>
					</BulletPoint>

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">Transaction History</Text> – Review past deposits, claims, and withdrawals.
						</Text>
					</BulletPoint>

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">BTX Points</Text> – Monitor your earned{" "}
							<Text className="font-bold text-textWhite">BTX governance points and BGT staking rewards (coming soon).</Text>
						</Text>
					</BulletPoint>
				</>
				<HorizontalLine />
				{/* SECTION 3 DEPOSITING */}
				<>
					<Text className={sectionTitleStyle}>Depositing into Yield Vaults (Earning Rewards)</Text>
					<Text className={subTitleStyle}>Step 1: Choosing a Vault</Text>
					<Text className={paragraphStyle}>
						Navigate to the <Text className="font-bold">"Earn" page</Text>, where you'll find all available vaults.
					</Text>
					<ResponsiveImage source={images.four} aspectRatio={500 / 600} />
					<Text className={paragraphStyle}>Each vault displays:</Text>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">Supported Assets</Text> – (e.g., BERA or HONEY)
						</Text>
					</BulletPoint>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">Current APY</Text> – (estimated yield on our vaults)
						</Text>
					</BulletPoint>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">Bonus Rewards</Text> – (e.g., BGT emissions, partner incentives)
						</Text>
					</BulletPoint>

					<Text className={subTitleStyle}>Step 2: Depositing Funds</Text>

					<BulletPoint icon={<CircleOneIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">Tap on a vault</Text> to see details and performance history.
						</Text>
					</BulletPoint>

					<BulletPoint icon={<CircleTwoIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">Select your deposit asset</Text> ( Trax will auto-convert unsupported assets).
						</Text>
					</BulletPoint>

					<BulletPoint icon={<CircleThreeIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">Enter the amount you want to stake.</Text>
						</Text>
					</BulletPoint>

					<BulletPoint icon={<CircleFourIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">Confirm your deposit</Text> — Trax automates swaps, LP creation, and vault deposits
							for you!
						</Text>
					</BulletPoint>

					<ResponsiveImage source={images.five} aspectRatio={400 / 730} width={400} />

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">Auto-compounding is enabled by default</Text> — your rewards are continuously
							reinvested to maximize yield.
						</Text>
					</BulletPoint>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">Deposits are gas-free</Text> — Trax covers transaction costs for you.
						</Text>
					</BulletPoint>
				</>
				<HorizontalLine />
				{/* SECTION 4 WITHDRAWING */}
				<>
					<Text className={sectionTitleStyle}>Withdrawing &amp; Managing Funds</Text>
					<Text className={subTitleStyle}>Step 1: Withdrawing from a Vault</Text>
					<ResponsiveImage source={images.six} aspectRatio={700 / 150} width={1200} />

					<BulletPoint icon={<CircleOneIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							Go to <Text className="font-bold">"My Vaults"</Text> on the Dashboard.
						</Text>
					</BulletPoint>

					<BulletPoint icon={<CircleTwoIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							Click the <Text className="font-bold">Withdraw</Text> button next to your staked position.
						</Text>
					</BulletPoint>

					<BulletPoint icon={<CircleThreeIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							Choose to withdraw <Text className="font-bold">partial or full </Text>funds.
						</Text>
					</BulletPoint>

					<BulletPoint icon={<CircleFourIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							Confirm the transaction — your assets will be unstaked and sent to your wallet.
						</Text>
					</BulletPoint>

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">BGT &amp; BTX rewards remain in your account</Text>, even after withdrawal.
						</Text>
					</BulletPoint>
				</>

				<HorizontalLine />
				{/* SECTION 5 Maximizing Rewards */}
				<>
					<Text className={sectionTitleStyle}>Maximizing Rewards with the BGT Flywheel</Text>
					<Text className={paragraphStyle}>
						Trax <Text className="font-bold">automatically optimizes yield</Text> using Berachain's{" "}
						<Text className="font-bold text-textWhite">Proof of Liquidity (PoL)</Text> mechanism:
					</Text>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">All vault fees are pooled and used to bribe validators</Text>, increasing BGT
							emissions for staked users.
						</Text>
					</BulletPoint>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							Users can <Text className="font-bold text-textWhite">opt-in to auto-convert BGT into iBGT</Text>, earning{" "}
							<Text className="font-bold">boosted validator rewards</Text> without extra steps.
						</Text>
					</BulletPoint>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">iBGT is liquid</Text>—users can swap, stake, or hold for further rewards.
						</Text>
					</BulletPoint>

					<Text className={paragraphStyle}>
						You don't need to manually participate in Berachain's PoL system—Trax <Text className="font-bold">does it all for you</Text> in
						the background.
					</Text>
				</>
				<HorizontalLine />

				{/* SECTION 6 Maximizing Rewards */}
				<>
					<Text className={sectionTitleStyle}>Earning BTX Points by Staking &amp; Referring</Text>

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">BTX Points</Text>: Earn points for staking in vaults—these points determine your
							share of the upcoming Trax token airdrop.
						</Text>
					</BulletPoint>

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">Referrals</Text>: Grab your unique referral link from the Dashboard. Earn the same
							BTX points as every user you bring into Trax!
						</Text>
					</BulletPoint>

					<Text className={paragraphStyle}>~~ &nbsp;The more you stake and refer, the more rewards you earn! 🚀~~ &nbsp;</Text>
				</>
				<HorizontalLine />

				{/* SECTION 7 FAQ */}
				<>
					<Text className={sectionTitleStyle}>Frequently Asked Questions (FAQ)</Text>

					<BulletPoint icon={<QuestionIcon stroke="maroon" strokeWidth={3} />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">What makes Trax different from other DeFi platforms?</Text>
						</Text>
					</BulletPoint>

					<Text className={paragraphStyle}>
						Trax <Text className="font-bold text-textWhite">removes complexity</Text>—one-click deposits, gas-free transactions,
						auto-compounding, and built-in PoL participation make it{" "}
						<Text className="font-bold text-textWhite">the easiest way to earn yield on Berachain</Text>.
					</Text>

					<BulletPoint icon={<QuestionIcon stroke="maroon" strokeWidth={3} />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">Do I need BERA tokens for gas?</Text>
						</Text>
					</BulletPoint>

					<Text className={paragraphStyle}>
						No! <Text className="font-bold text-textWhite"> Trax covers all transaction fees</Text>, so you don't need BERA for gas.
					</Text>

					<BulletPoint icon={<QuestionIcon stroke="maroon" strokeWidth={3} />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">How do I claim my BGT and iBGT rewards?</Text>
						</Text>
					</BulletPoint>

					<Text className={paragraphStyle}>
						Your earned rewards can be viewed on the <Text className="font-bold">Dashboard</Text> and claimed at any time. Trax{" "}
						<Text className="font-bold">auto-compounds</Text> your rewards so that they are continuously reinvested for higher APY. BGT and
						iBGT earning opportunities are coming soon.
					</Text>

					<BulletPoint icon={<QuestionIcon stroke="maroon" strokeWidth={3} />}>
						<Text className="text-textWhite text-xl font-league-spartan">
							<Text className="font-bold text-textWhite">Is Trax safe?</Text>
						</Text>
					</BulletPoint>

					<Text className={paragraphStyle}>
						Security is a top priority. Trax only utilizes <Text className="font-bold">audited smart contracts</Text> and Berachain's{" "}
						<Text className="font-bold">native PoL</Text> system to ensure safe, trustless yield farming. We even protect against any
						unknown exploits using Spherex's zero day exploit protection on every one of our contracts!
					</Text>
				</>
				<HorizontalLine />
				{/* SECTION 8 JOIN TRAX COMMUNITY */}
				<>
					<Text className={sectionTitleStyle}>Join the Trax Community</Text>
					<Text className={paragraphStyle}>Want to stay updated and get involved? Follow us here:</Text>

					<BulletPoint icon={<WebsiteIcon stroke={Colors.gradientLight} />} className="items-center">
						<View className="flex flex-row items-center">
							<Text className={`font-league-spartan ${Platform.OS === "web" ? "text-xl" : "text-base"} font-bold text-textWhite`}>
								Website:{" "}
							</Text>
							<Pressable
								onPress={() => Linking.openURL("https://www.beratrax.com/")}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
								style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
							>
								<Text className={`${linkStyle} font-league-spartan ${Platform.OS === "web" ? "text-xl" : "text-base"}`}>trax.finance</Text>
							</Pressable>
						</View>
					</BulletPoint>

					<BulletPoint icon={<Text style={{ fontSize: 18, width: 24, height: 24 }}>📢</Text>} className="items-center">
						<View className="flex flex-row items-center">
							<Text className={`font-league-spartan ${Platform.OS === "web" ? "text-xl" : "text-base"} font-bold text-textWhite`}>
								Twitter:{" "}
							</Text>
							<Pressable
								onPress={() => Linking.openURL("https://twitter.com/ Trax")}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
								style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
							>
								<Text className={`${linkStyle} font-league-spartan ${Platform.OS === "web" ? "text-xl" : "text-base"}`}>@Trax</Text>
							</Pressable>
						</View>
					</BulletPoint>

					<BulletPoint icon={<ChatCircleIcon />} className="items-center">
						<View className="flex flex-row items-center">
							<Text className={`font-league-spartan ${Platform.OS === "web" ? "text-xl" : "text-base"} font-bold text-textWhite`}>
								Discord:{" "}
							</Text>
							<Pressable
								onPress={() => Linking.openURL("https://discord.gg/traxdefi")}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
								style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
							>
								<Text className={`${linkStyle} font-league-spartan ${Platform.OS === "web" ? "text-xl" : "text-base"}`}>
									Community Chat
								</Text>
							</Pressable>
						</View>
					</BulletPoint>
				</>

				<View className={"flex mt-4 mb-8 pb-10"}>
					<Pressable
						onPress={() => Linking.openURL("https://docs.beratrax.com/beratrax-beta/")}
						className="self-center justify-self-center text-center uppercase border border-bgPrimary text-bgSecondary bg-bgPrimary hover:border hover:bg-bgSecondary hover:border-gradientPrimary hover:text-gradientPrimary flex items-center gap-2 px-5 py-4 rounded-lg cursor-pointer mb-1
									transition-all duration-200 ease-in-out text-xl font-league-spartan"
					>
						<View className="flex flex-row items-center gap-2">
							<Text className="font-bold text-textWhite">FULL USER DOCS</Text>
							<ExternalLinkIcon />
						</View>
					</Pressable>
				</View>
			</View>
		</ScrollView>
	);
};

export default UserGuide;
