import { ReactNode } from "react";
import userguideimagefive from "@beratrax/core/src/assets/images/userguideimagefive.png";
import userguideimagefour from "@beratrax/core/src/assets/images/userguideimagefour.jpg";
import userguideimageone from "@beratrax/core/src/assets/images/userguideimageone.png";
import userguideimagesix from "@beratrax/core/src/assets/images/userguideimagesix.png";
import userguideimagethree from "@beratrax/core/src/assets/images/userguideimagethree.png";
import userguideimagetwo from "@beratrax/core/src/assets/images/userguideimagetwo.png";
import { View, Text, Image, ScrollView, TouchableOpacity, ImageSourcePropType, Dimensions } from "react-native";
import { Link } from "expo-router";
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

// Type the imported images explicitly as ImageSourcePropType
const images = {
	one: userguideimageone as ImageSourcePropType,
	two: userguideimagetwo as ImageSourcePropType,
	three: userguideimagethree as ImageSourcePropType,
	four: userguideimagefour as ImageSourcePropType,
	five: userguideimagefive as ImageSourcePropType,
	six: userguideimagesix as ImageSourcePropType,
};

const BulletPoint = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => {
	return (
		<View className="flex flex-row items-start items-stretch mb-2">
			<View className="shrink-0 mr-2">{icon}</View>
			<Text style={{ color: "white", lineHeight: 20, flex: 1, fontSize: 20 }}>{children}</Text>
		</View>
	);
};

const sectionTitleStyle = "text-[36px] mt-4 mb-2 text-white";
const subTitleStyle = "text-[28px] mt-2 mb-1 text-white";
const paragraphStyle = "text-[20px] text-textWhite font-light";
const linkStyle = "text-[#72b21f] underline";

const ResponsiveImage = ({ source, aspectRatio = 1.4 }: { source: ImageSourcePropType; aspectRatio?: number }) => {
	const screenWidth = Dimensions.get("window").width;

	// calculates the optimal width for the image based on the device's screen width
	const width = Math.min(screenWidth - 40, 600);

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
				<Text className="font-bold text-4xl leading-none uppercase text-textWhite">
					💰 BeraTrax User Guide: Your Gateway to Seamless DeFi on Berachain
				</Text>
				<Text className={paragraphStyle}>
					Welcome to <Text className="font-bold">BeraTrax</Text>, the easiest way to access{" "}
					<Text className="font-bold">
						yield-earning vaults, auto-compounded rewards, and Berachain's Proof of Liquidity system—all through your phone.
					</Text>
					Whether you're new to DeFi or a seasoned yield farmer, BeraTrax is built to{" "}
					<Text className="font-bold">remove the complexity</Text> and help you maximize your returns.
				</Text>

				{/* SECTION 1 GETTING STARTED*/}
				<>
					<Text className={sectionTitleStyle}>Getting Started with BeraTrax</Text>
					<Text className={subTitleStyle}>Step 1: Signing In</Text>
					<Text className={paragraphStyle}>BeraTrax offers two ways to get started:</Text>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="font-bold">Social Login</Text> – Sign in instantly using an email, Twitter, or Discord (you own your social
						wallet, &amp; can export you key)
					</BulletPoint>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="font-bold">Wallet Connection</Text> – Use <Text className="font-bold">MetaMask, WalletConnect, or Ledger</Text>{" "}
						to connect an existing wallet.
					</BulletPoint>

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="font-bold">First-time users? </Text>
						If signing in via social login, BeraTrax will
						<Text className="font-bold"> automatically create a wallet</Text> for you on Berachain's mainnet.
					</BulletPoint>

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="font-bold">Gas money? </Text>
						All transactions are covered on BeraTrax so you don't need to have BERA to use it.
					</BulletPoint>

					<ResponsiveImage source={images.one} aspectRatio={600 / 425} />

					<Text className={subTitleStyle}>Step 2: Funding Your Wallet</Text>

					<BulletPoint icon={<DiamondFillIcon />}>
						BeraTrax will soon have fiat onramps for you to purchase BERA directly to deposit into vaults
					</BulletPoint>

					<BulletPoint icon={<DiamondFillIcon />}>
						Until then, you must either have airdrop funds from Berachain, or bridge them over to your wallet.
					</BulletPoint>

					<Text className={subTitleStyle}>Step 3: Earn Rewards</Text>
					<ResponsiveImage source={images.two} aspectRatio={800 / 80} />

					<BulletPoint icon={<DiamondFillIcon />}>
						Go to the "Earn" tab a the bottom of your screen (or on the side on desktop) &amp; pick which vault you want to deposit into,
						tap it, and open up the details page.
					</BulletPoint>

					<BulletPoint icon={<DiamondFillIcon />}>
						If you wish to deposit, just tap deposit, type in your deposit amount (or tap "Max") and then confirm. That's all it takes!
					</BulletPoint>

					<Text className={paragraphStyle}>Each vault displays:</Text>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="font-bold">Supported Assets</Text> – (e.g., BERA or HONEY)
					</BulletPoint>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="font-bold">Current APY</Text> – (estimated yield on our vaults)
					</BulletPoint>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="font-bold">Bonus Rewards</Text> – (e.g., BGT emissions, partner incentives)
					</BulletPoint>
				</>

				{/* SECTION 2 DASHBOARD */}
				<>
					<Text className={sectionTitleStyle}>Exploring the Dashboard</Text>
					<Text className={paragraphStyle}>
						After signing in, you'll land on the <Text className="font-bold">BeraTrax Dashboard.</Text>
					</Text>
					<Text className={paragraphStyle}>Here's what you'll see:</Text>
					<ResponsiveImage source={images.three} aspectRatio={600 / 375} />

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="font-bold">Your Portfolio</Text> – Track your balances, staked assets, and earnings in real-time.
					</BulletPoint>

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="font-bold">Transaction History</Text> – Review past deposits, claims, and withdrawals.
					</BulletPoint>

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="font-bold">BTX Points</Text> – Monitor your earned{" "}
						<Text className="font-bold">BTX governance points and BGT staking rewards (coming soon).</Text>
					</BulletPoint>
				</>

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
						<Text className="font-bold">Supported Assets</Text> – (e.g., BERA or HONEY)
					</BulletPoint>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="font-bold">Current APY</Text> – (estimated yield on our vaults)
					</BulletPoint>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="font-bold">Bonus Rewards</Text> – (e.g., BGT emissions, partner incentives)
					</BulletPoint>

					<Text className={subTitleStyle}>Step 2: Depositing Funds</Text>

					<BulletPoint icon={<CircleOneIcon />}>
						<Text className="font-bold">Tap on a vault</Text> to see details and performance history.
					</BulletPoint>

					<BulletPoint icon={<CircleTwoIcon />}>
						<Text className="font-bold">Select your deposit asset</Text> (BeraTrax will auto-convert unsupported assets).
					</BulletPoint>

					<BulletPoint icon={<CircleThreeIcon />}>
						<Text className="font-bold">Enter the amount you want to stake.</Text>
					</BulletPoint>

					<BulletPoint icon={<CircleFourIcon />}>
						<Text className="font-bold">Confirm your deposit</Text> — BeraTrax automates swaps, LP creation, and vault deposits for you!
					</BulletPoint>

					<ResponsiveImage source={images.five} aspectRatio={400 / 730} />

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="font-bold">Auto-compounding is enabled by default</Text> — your rewards are continuously reinvested to maximize
						yield.
					</BulletPoint>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="font-bold">Deposits are gas-free</Text> — BeraTrax covers transaction costs for you.
					</BulletPoint>
				</>

				{/* SECTION 4 WITHDRAWING */}
				<>
					<Text className={sectionTitleStyle}>Withdrawing &amp; Managing Funds</Text>
					<Text className={subTitleStyle}>Step 1: Withdrawing from a Vault</Text>
					<ResponsiveImage source={images.six} aspectRatio={700 / 150} />

					<Text className={paragraphStyle}>
						Go to <Text className="font-bold">"My Vaults"</Text> on the Dashboard.
					</Text>

					<Text className={paragraphStyle}>
						Click the <Text className="font-bold">Withdraw</Text> button next to your staked position.
					</Text>

					<Text className={paragraphStyle}>
						Choose to withdraw <Text className="font-bold">partial or full </Text>funds.
					</Text>

					<Text className={paragraphStyle}>Confirm the transaction — your assets will be unstaked and sent to your wallet.</Text>

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="font-bold">BGT &amp; BTX rewards remain in your account</Text>, even after withdrawal.
					</BulletPoint>
				</>

				{/* SECTION 5 Maximizing Rewards */}
				<>
					<Text className={sectionTitleStyle}>Maximizing Rewards with the BGT Flywheel</Text>
					<Text className={paragraphStyle}>
						BeraTrax <Text className="font-bold">automatically optimizes yield</Text> using Berachain's{" "}
						<Text className="font-bold">Proof of Liquidity (PoL)</Text> mechanism:
					</Text>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="font-bold">All vault fees are pooled and used to bribe validators</Text>, increasing BGT emissions for staked
						users.
					</BulletPoint>

					<BulletPoint icon={<CheckCircleIcon />}>
						Users can <Text className="font-bold">opt-in to auto-convert BGT into iBGT</Text>, earning{" "}
						<Text className="font-bold">boosted validator rewards</Text> without extra steps.
					</BulletPoint>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="font-bold">iBGT is liquid</Text>—users can swap, stake, or hold for further rewards.
					</BulletPoint>

					<Text className={paragraphStyle}>
						You don't need to manually participate in Berachain's PoL system—BeraTrax <Text className="font-bold">does it all for you</Text>{" "}
						in the background.
					</Text>
				</>

				{/* SECTION 6 Maximizing Rewards */}
				<>
					<Text className={sectionTitleStyle}>Earning BTX Points by Staking &amp; Referring</Text>

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="font-bold">BTX Points</Text>: Earn points for staking in vaults—these points determine your share of the
						upcoming BeraTrax token airdrop.
					</BulletPoint>

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="font-bold">Referrals</Text>: Grab your unique referral link from the Dashboard. Earn the same BTX points as
						every user you bring into BeraTrax!
					</BulletPoint>

					<Text className={paragraphStyle}>~~ &nbsp;The more you stake and refer, the more rewards you earn! 🚀~~ &nbsp;</Text>
				</>

				{/* SECTION 7 FAQ */}
				<>
					<View className="h-px bg-[#999] my-5" />
					<Text className={sectionTitleStyle}>Frequently Asked Questions (FAQ)</Text>

					<BulletPoint icon={<QuestionIcon stroke="maroon" strokeWidth={3} />}>
						<Text className="font-bold">What makes BeraTrax different from other DeFi platforms?</Text>
					</BulletPoint>

					<Text className={paragraphStyle}>
						BeraTrax <Text className="font-bold">removes complexity</Text>—one-click deposits, gas-free transactions, auto-compounding, and
						built-in PoL participation make it <Text className="font-bold">the easiest way to earn yield on Berachain</Text>.
					</Text>

					<BulletPoint icon={<QuestionIcon stroke="maroon" strokeWidth={3} />}>
						<Text className="font-bold">Do I need BERA tokens for gas?</Text>
					</BulletPoint>

					<Text className={paragraphStyle}>
						No! <Text className="font-bold">BeraTrax covers all transaction fees</Text>, so you don't need BERA for gas.
					</Text>

					<BulletPoint icon={<QuestionIcon stroke="maroon" strokeWidth={3} />}>
						<Text className="font-bold">How do I claim my BGT and iBGT rewards?</Text>
					</BulletPoint>

					<Text className={paragraphStyle}>
						Your earned rewards can be viewed on the <Text className="font-bold">Dashboard</Text> and claimed at any time. BeraTrax{" "}
						<Text className="font-bold">auto-compounds</Text> your rewards so that they are continuously reinvested for higher APY. BGT and
						iBGT earning opportunities are coming soon.
					</Text>

					<BulletPoint icon={<QuestionIcon stroke="maroon" strokeWidth={3} />}>
						<Text className="font-bold">Is BeraTrax safe?</Text>
					</BulletPoint>

					<Text className={paragraphStyle}>
						Security is a top priority. BeraTrax only utilizes <Text className="font-bold">audited smart contracts</Text> and Berachain's{" "}
						<Text className="font-bold">native PoL</Text> system to ensure safe, trustless yield farming. We even protect against any
						unknown exploits using Spherex's zero day exploit protection on every one of our contracts!
					</Text>
				</>

				{/* SECTION 8 JOIN BERATRAX COMMUNITY */}
				<>
					<View className="h-px bg-[#999] my-5" />
					<Text className={sectionTitleStyle}>Join the BeraTrax Community</Text>
					<Text className={paragraphStyle}>Want to stay updated and get involved? Follow us here:</Text>

					<BulletPoint icon={<WebsiteIcon stroke={Colors.gradientLight} />}>
						<Text className="font-bold">Website: </Text>
						<Link href="https://www.beratrax.com/" className={linkStyle} target="_blank" rel="noopener noreferrer">
							beratrax.com
						</Link>
					</BulletPoint>

					<BulletPoint icon={<Text style={{ fontSize: 18, width: 24, height: 24 }}>📢</Text>}>
						<Text className="font-bold">Twitter: </Text>
						<Link href="https://twitter.com/BeraTrax" className={linkStyle} target="_blank" rel="noopener noreferrer">
							@BeraTrax
						</Link>
					</BulletPoint>

					<BulletPoint icon={<ChatCircleIcon />}>
						<Text className="font-bold">Discord: </Text>
						<Link href="https://discord.gg/beratrax" className={linkStyle} target="_blank" rel="noopener noreferrer">
							Community Chat
						</Link>
					</BulletPoint>
				</>

				<View className={"flex mt-4 mb-8"}>
					<TouchableOpacity
						className="self-center justify-self-center text-center uppercase border border-bgPrimary text-bgSecondary bg-bgPrimary hover:border hover:bg-bgSecondary hover:border-gradientPrimary hover:text-gradientPrimary flex items-center gap-2 px-7 py-5 rounded-lg cursor-pointer mb-1
									transition-all duration-200 ease-in-out"
						onPress={() => window.open("https://docs.beratrax.com/beratrax-beta/", "_blank")}
					>
						<Text className={"text-white font-bold uppercase"}>FULL USER DOCS</Text>
					</TouchableOpacity>
				</View>
			</View>
		</ScrollView>
	);
};

export default UserGuide;
