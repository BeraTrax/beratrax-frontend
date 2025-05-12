import { ReactNode } from "react";
import userguideimagefive from "@beratrax/core/src/assets/images/userguideimagefive.png";
import userguideimagefour from "@beratrax/core/src/assets/images/userguideimagefour.jpg";
import userguideimageone from "@beratrax/core/src/assets/images/userguideimageone.png";
import userguideimagesix from "@beratrax/core/src/assets/images/userguideimagesix.png";
import userguideimagethree from "@beratrax/core/src/assets/images/userguideimagethree.png";
import userguideimagetwo from "@beratrax/core/src/assets/images/userguideimagetwo.png";
import { View, Text, Image, ScrollView, TouchableOpacity, Linking, StyleSheet, ImageSourcePropType } from "react-native";
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
			<Text style={{ color: "white", lineHeight: 20, flex: 1 }}>{children}</Text>
		</View>
	);
};

export const UserGuide = () => {
	return (
		<ScrollView className="flex flex-1">
			<View className="p-5 gap-4">
				<Text className="text-white font-bold text-2xl uppercase">💰 BeraTrax User Guide: Your Gateway to Seamless DeFi on Berachain</Text>
				<Text style={styles.paragraph}>
					Welcome to <Text className="font-bold">BeraTrax</Text>, the easiest way to access{" "}
					<Text className="font-bold">
						yield-earning vaults, auto-compounded rewards, and Berachain's Proof of Liquidity system—all through your phone.
					</Text>
					Whether you're new to DeFi or a seasoned yield farmer, BeraTrax is built to{" "}
					<Text className="font-bold">remove the complexity</Text> and help you maximize your returns.
				</Text>

				{/* SECTION 1 GETTING STARTED*/}
				<>
					<Text style={styles.sectionTitle}>Getting Started with BeraTrax</Text>
					<Text style={styles.subTitle}>Step 1: Signing In</Text>
					<Text style={styles.paragraph}>BeraTrax offers two ways to get started:</Text>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="font-bold">Social Login</Text> – Sign in instantly using an email, Twitter, or Discord (you own your social
						wallet, & can export you key)
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

					<Image source={images.one} style={styles.image} resizeMode="contain" />

					<Text style={styles.subTitle}>Step 2: Funding Your Wallet</Text>

					<BulletPoint icon={<DiamondFillIcon />}>
						BeraTrax will soon have fiat onramps for you to purchase BERA directly to deposit into vaults
					</BulletPoint>

					<BulletPoint icon={<DiamondFillIcon />}>
						Until then, you must either have airdrop funds from Berachain, or bridge them over to your wallet.
					</BulletPoint>

					<Text style={styles.subTitle}>Step 3: Earn Rewards</Text>
					<Image source={images.two} style={styles.image} resizeMode="contain" />

					<BulletPoint icon={<DiamondFillIcon />}>
						Go to the "Earn" tab a the bottom of your screen (or on the side on desktop) & pick which vault you want to deposit into, tap
						it, and open up the details page.
					</BulletPoint>

					<BulletPoint icon={<DiamondFillIcon />}>
						If you wish to deposit, just tap deposit, type in your deposit amount (or tap "Max") and then confirm. That's all it takes!
					</BulletPoint>

					<Text style={styles.paragraph}>Each vault displays:</Text>

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
					<Text style={styles.sectionTitle}>Exploring the Dashboard</Text>
					<Text style={styles.paragraph}>
						After signing in, you'll land on the <Text className="font-bold">BeraTrax Dashboard.</Text>
					</Text>
					<Text style={styles.paragraph}>Here's what you'll see:</Text>
					<Image source={images.three} style={styles.image} resizeMode="contain" />

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
					<Text style={styles.sectionTitle}>Depositing into Yield Vaults (Earning Rewards)</Text>
					<Text style={styles.subTitle}>Step 1: Choosing a Vault</Text>
					<Text style={styles.paragraph}>
						Navigate to the <Text className="font-bold">"Earn" page</Text>, where you'll find all available vaults.
					</Text>
					<Image source={images.four} style={styles.image} resizeMode="contain" />
					<Text style={styles.paragraph}>Each vault displays:</Text>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="font-bold">Supported Assets</Text> – (e.g., BERA or HONEY)
					</BulletPoint>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="font-bold">Current APY</Text> – (estimated yield on our vaults)
					</BulletPoint>

					<BulletPoint icon={<CheckCircleIcon />}>
						<Text className="font-bold">Bonus Rewards</Text> – (e.g., BGT emissions, partner incentives)
					</BulletPoint>

					<Text style={styles.subTitle}>Step 2: Depositing Funds</Text>

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

					<Image source={images.five} style={styles.image} resizeMode="contain" />

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
					<Text style={styles.sectionTitle}>Withdrawing & Managing Funds</Text>
					<Text style={styles.subTitle}>Step 1: Withdrawing from a Vault</Text>
					<Image source={images.six} style={styles.image} resizeMode="contain" />

					<Text style={styles.paragraph}>
						Go to <Text className="font-bold">"My Vaults"</Text> on the Dashboard.
					</Text>

					<Text style={styles.paragraph}>
						Click the <Text className="font-bold">Withdraw</Text> button next to your staked position.
					</Text>

					<Text style={styles.paragraph}>
						Choose to withdraw <Text className="font-bold">partial or full </Text>funds.
					</Text>

					<Text style={styles.paragraph}>Confirm the transaction — your assets will be unstaked and sent to your wallet.</Text>

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="font-bold">BGT & BTX rewards remain in your account</Text>, even after withdrawal.
					</BulletPoint>
				</>

				{/* SECTION 5 Maximizing Rewards */}
				<>
					<Text style={styles.sectionTitle}>Maximizing Rewards with the BGT Flywheel</Text>
					<Text style={styles.paragraph}>
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

					<Text style={styles.paragraph}>
						You don't need to manually participate in Berachain's PoL system—BeraTrax <Text className="font-bold">does it all for you</Text>{" "}
						in the background.
					</Text>
				</>

				{/* SECTION 6 Maximizing Rewards */}
				<>
					<Text style={styles.sectionTitle}>Earning BTX Points by Staking & Referring</Text>

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="font-bold">BTX Points</Text>: Earn points for staking in vaults—these points determine your share of the
						upcoming BeraTrax token airdrop.
					</BulletPoint>

					<BulletPoint icon={<DiamondFillIcon />}>
						<Text className="font-bold">Referrals</Text>: Grab your unique referral link from the Dashboard. Earn the same BTX points as
						every user you bring into BeraTrax!
					</BulletPoint>

					<Text style={styles.paragraph}>~~ &nbsp;The more you stake and refer, the more rewards you earn! 🚀~~ &nbsp;</Text>
				</>

				{/* SECTION 7 FAQ */}
				<>
					<View className="h-px bg-[#999] my-5" />
					<Text style={styles.sectionTitle}>Frequently Asked Questions (FAQ)</Text>

					<BulletPoint icon={<QuestionIcon />}>
						<Text className="font-bold">What makes BeraTrax different from other DeFi platforms?</Text>
					</BulletPoint>

					<Text style={styles.paragraph}>
						BeraTrax <Text className="font-bold">removes complexity</Text>—one-click deposits, gas-free transactions, auto-compounding, and
						built-in PoL participation make it <Text className="font-bold">the easiest way to earn yield on Berachain</Text>.
					</Text>

					<BulletPoint icon={<QuestionIcon />}>
						<Text className="font-bold">Do I need BERA tokens for gas?</Text>
					</BulletPoint>

					<Text style={styles.paragraph}>
						No! <Text className="font-bold">BeraTrax covers all transaction fees</Text>, so you don't need BERA for gas.
					</Text>

					<BulletPoint icon={<QuestionIcon />}>
						<Text className="font-bold">How do I claim my BGT and iBGT rewards?</Text>
					</BulletPoint>

					<Text style={styles.paragraph}>
						Your earned rewards can be viewed on the <Text className="font-bold">Dashboard</Text> and claimed at any time. BeraTrax{" "}
						<Text className="font-bold">auto-compounds</Text> your rewards so that they are continuously reinvested for higher APY. BGT and
						iBGT earning opportunities are coming soon.
					</Text>

					<BulletPoint icon={<QuestionIcon />}>
						<Text className="font-bold">Is BeraTrax safe?</Text>
					</BulletPoint>

					<Text style={styles.paragraph}>
						Security is a top priority. BeraTrax only utilizes <Text className="font-bold">audited smart contracts</Text> and Berachain's{" "}
						<Text className="font-bold">native PoL</Text> system to ensure safe, trustless yield farming. We even protect against any
						unknown exploits using Spherex's zero day exploit protection on every one of our contracts!
					</Text>
				</>

				{/* SECTION 8 JOIN BERATRAX COMMUNITY */}
				<>
					<View className="h-px bg-[#999] my-5" />
					<Text style={styles.sectionTitle}>Join the BeraTrax Community</Text>
					<Text style={styles.paragraph}>Want to stay updated and get involved? Follow us here:</Text>

					<BulletPoint icon={<WebsiteIcon stroke={Colors.gradientLight} />}>
						<Text className="font-bold">Website: </Text>
						<Text style={styles.link} onPress={() => Linking.openURL("https://www.beratrax.com/")}>
							beratrax.com
						</Text>
					</BulletPoint>

					<BulletPoint icon={<Text style={{ fontSize: 18, width: 24, height: 24 }}>📢</Text>}>
						<Text className="font-bold">Twitter: </Text>
						<Text style={styles.link} onPress={() => Linking.openURL("https://twitter.com/BeraTrax")}>
							@BeraTrax
						</Text>
					</BulletPoint>

					<BulletPoint icon={<ChatCircleIcon />}>
						<Text className="font-bold">Discord: </Text>
						<Text style={styles.link} onPress={() => Linking.openURL("https://discord.gg/beratrax")}>
							Community Chat
						</Text>
					</BulletPoint>
				</>

				<View className={"items-center mt-4 mb-8"}>
					<TouchableOpacity
						className="py-3 px-6 rounded-lg bg-[#5B8E19]"
						onPress={() => Linking.openURL("https://docs.beratrax.com/beratrax-beta/")}
					>
						<Text className={"text-white font-bold uppercase"}>FULL USER DOCS</Text>
					</TouchableOpacity>
				</View>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	sectionTitle: {
		fontSize: 20,
		marginTop: 16,
		marginBottom: 8,
		color: "white",
	},
	subTitle: {
		fontSize: 18,
		marginTop: 8,
		marginBottom: 4,
		color: "white",
	},
	paragraph: {
		marginBottom: 8,
		lineHeight: 20,
		color: "white",
	},
	image: {
		width: "100%",
		height: 300,
		alignSelf: "center",
		marginVertical: 16,
	},
	link: {
		color: "#72b21f",
		textDecorationLine: "underline",
	},
});

export default UserGuide;
