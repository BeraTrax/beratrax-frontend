import userguideimagefive from "@beratrax/core/src/assets/images/userguideimagefive.png";
import userguideimagefour from "@beratrax/core/src/assets/images/userguideimagefour.jpg";
import userguideimageone from "@beratrax/core/src/assets/images/userguideimageone.png";
import userguideimagesix from "@beratrax/core/src/assets/images/userguideimagesix.png";
import userguideimagethree from "@beratrax/core/src/assets/images/userguideimagethree.png";
import userguideimagetwo from "@beratrax/core/src/assets/images/userguideimagetwo.png";
import { View, Text, Image, ScrollView, TouchableOpacity, Linking, StyleSheet, ImageSourcePropType, Platform } from "react-native";
import CheckMark from "@beratrax/core/src/assets/images/checkmark.png";
import { DiamondFillIcon } from "../icons/DiamondFill";
import { QuestionIcon } from "../icons/Question";
import { ChatCircleIcon } from "../icons/ChatCircle";
import { WebsiteIcon } from "../icons/Website";
import Colors from "@beratrax/typescript-config/Colors";

// Type the imported images explicitly as ImageSourcePropType
const images = {
	one: userguideimageone as ImageSourcePropType,
	two: userguideimagetwo as ImageSourcePropType,
	three: userguideimagethree as ImageSourcePropType,
	four: userguideimagefour as ImageSourcePropType,
	five: userguideimagefive as ImageSourcePropType,
	six: userguideimagesix as ImageSourcePropType,
};

function getImageSource() {
	return Platform.OS === "web" ? { uri: CheckMark } : require("@beratrax/core/src/assets/images/checkmark.png");
}

export const UserGuide = () => {
	return (
		<ScrollView style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>💰 BeraTrax User Guide: Your Gateway to Seamless DeFi on Berachain</Text>
				<Text style={styles.paragraph}>
					Welcome to <Text style={styles.bold}>BeraTrax</Text>, the easiest way to access{" "}
					<Text style={styles.bold}>
						yield-earning vaults, auto-compounded rewards, and Berachain's Proof of Liquidity system—all through your phone.
					</Text>
					Whether you're new to DeFi or a seasoned yield farmer, BeraTrax is built to <Text style={styles.bold}>remove the complexity</Text>{" "}
					and help you maximize your returns.
				</Text>

				{/* SECTION 1 GETTING STARTED*/}
				<>
					<Text style={styles.sectionTitle}>Getting Started with BeraTrax</Text>
					<Text style={styles.subTitle}>Step 1: Signing In</Text>
					<Text style={styles.paragraph}>BeraTrax offers two ways to get started:</Text>

					<Text style={styles.paragraph}>
						<View style={styles.iconContainer}>
							<Image source={getImageSource()} alt="Check mark" style={styles.icon} />
						</View>
						<Text style={styles.bold}>Social Login</Text> – Sign in instantly using an email, Twitter, or Discord (you own your social
						wallet, & can export you key)
					</Text>

					<Text style={styles.paragraph}>
						<View style={styles.iconContainer}>
							<Image source={getImageSource()} alt="Check mark" style={styles.icon} />
						</View>
						<Text style={styles.bold}>Wallet Connection</Text> – Use <Text style={styles.bold}>MetaMask, WalletConnect, or Ledger</Text> to
						connect an existing wallet.
					</Text>

					<Text style={styles.paragraph}>
						<View style={styles.iconContainer}>
							<DiamondFillIcon />
						</View>
						<Text style={styles.bold}>First-time users? </Text>
						If signing in via social login, BeraTrax will <Text style={styles.bold}>automatically create a wallet</Text> for you on
						Berachain's mainnet.
					</Text>

					<Text style={styles.paragraph}>
						<View style={styles.iconContainer}>
							<DiamondFillIcon />
						</View>
						<Text style={styles.bold}>Gas money? </Text>
						All transactions are covered on BeraTrax so you don't need have BERA to use it.
					</Text>

					<Image source={images.one} style={styles.image} resizeMode="contain" />

					<Text style={styles.subTitle}>Step 2: Funding Your Wallet</Text>

					<Text style={styles.paragraph}>
						<View style={styles.iconContainer}>
							<DiamondFillIcon />
						</View>
						BeraTrax will soon have fiat onramps for you to purchase BERA directly to deposit into vaults
					</Text>

					<Text style={styles.paragraph}>
						<View style={styles.iconContainer}>
							<DiamondFillIcon />
						</View>
						Until then, you must either have airdrop funds from Berachain, or bridge them over to your wallet.
					</Text>

					<Text style={styles.subTitle}>Step 3: Earn Rewards</Text>
					<Image source={images.two} style={styles.image} resizeMode="contain" />

					<Text style={styles.paragraph}>
						<View style={styles.iconContainer}>
							<DiamondFillIcon />
						</View>
						Go to the "Earn" tab a the bottom of your screen (or on the side on desktop) & pick which vault you want to deposit into, tap
						it, and open up the details page.
					</Text>

					<Text style={styles.paragraph}>
						<View style={styles.iconContainer}>
							<DiamondFillIcon />
						</View>
						If you wish to deposit, just tap deposit, type in your deposit amount (or tap "Max") and then confirm. That's all it takes!
					</Text>
				</>

				{/* SECTION 2 DASHBOARD */}
				<>
					<Text style={styles.sectionTitle}>Exploring the Dashboard</Text>
					<Text style={styles.paragraph}>
						After signing in, you'll land on the <Text style={styles.bold}>BeraTrax Dashboard.</Text>
					</Text>
					<Text style={styles.paragraph}>Here's what you'll see:</Text>
					<Image source={images.three} style={styles.image} resizeMode="contain" />

					<Text style={styles.paragraph}>
						<View style={styles.iconContainer}>
							<DiamondFillIcon />
						</View>
						<Text style={styles.bold}>Your Portfolio</Text> – Track your balances, staked assets, and earnings in real-time.
					</Text>

					<Text style={styles.paragraph}>
						<View style={styles.iconContainer}>
							<DiamondFillIcon />
						</View>
						<Text style={styles.bold}>Transaction History</Text> – Review past deposits, claims, and withdrawals.
					</Text>

					<Text style={styles.paragraph}>
						<View style={styles.iconContainer}>
							<DiamondFillIcon />
						</View>
						<Text style={styles.bold}>BTX Points</Text> – Monitor your earned{" "}
						<Text style={styles.bold}>BTX governance points and BGT staking rewards (coming soon).</Text>
					</Text>
				</>

				{/* SECTION 3 DEPOSITING */}
				<>
					<Text style={styles.sectionTitle}>Depositing into Yield Vaults (Earning Rewards)</Text>
					<Text style={styles.subTitle}>Step 1: Choosing a Vault</Text>
					<Text style={styles.paragraph}>
						Navigate to the <Text style={styles.bold}>"Earn" page</Text>, where you'll find all available vaults.
					</Text>
					<Image source={images.four} style={styles.image} resizeMode="contain" />
					<Text style={styles.paragraph}>Each vault displays:</Text>

					<Text style={styles.paragraph}>
						<Image source={getImageSource()} alt="Check mark" style={styles.icon} />
						<Text style={styles.bold}>Supported Assets</Text> – (e.g., BERA or HONEY)
					</Text>

					<Text style={styles.paragraph}>
						<Image source={getImageSource()} alt="Check mark" style={styles.icon} />
						<Text style={styles.bold}>Current APY</Text> – (estimated yield on our vaults)
					</Text>

					<Text style={styles.paragraph}>
						<Image source={getImageSource()} alt="Check mark" style={styles.icon} />
						<Text style={styles.bold}>Bonus Rewards</Text> – (e.g., BGT emissions, partner incentives)
					</Text>

					<Text style={styles.subTitle}>Step 2: Depositing Funds</Text>

					<Text style={styles.paragraph}>
						<Text style={styles.bold}>Tap on a vault</Text> to see details and performance history.
					</Text>

					<Text style={styles.paragraph}>
						<Text style={styles.bold}>Select your deposit asset</Text> (BeraTrax will auto-convert unsupported assets).
					</Text>

					<Text style={styles.paragraph}>
						<Text style={styles.bold}>Enter the amount you want to stake.</Text>
					</Text>

					<Text style={styles.paragraph}>
						<Text style={styles.bold}>Confirm your deposit</Text> — BeraTrax automates swaps, LP creation, and vault deposits for you!
					</Text>

					<Image source={images.five} style={styles.image} resizeMode="contain" />

					<Text style={styles.paragraph}>
						<Image source={getImageSource()} alt="Check mark" style={styles.icon} />
						<Text style={styles.bold}>Auto-compounding is enabled by default</Text> — your rewards are continuously reinvested to maximize
						yield.
					</Text>

					<Text style={styles.paragraph}>
						<Image source={getImageSource()} alt="Check mark" style={styles.icon} />
						<Text style={styles.bold}>Deposits are gas-free</Text> — BeraTrax covers transaction costs for you.
					</Text>
				</>

				{/* SECTION 4 WITHDRAWING */}
				<>
					<Text style={styles.sectionTitle}>Withdrawing & Managing Funds</Text>
					<Text style={styles.subTitle}>Step 1: Withdrawing from a Vault</Text>
					<Image source={images.six} style={styles.image} resizeMode="contain" />

					<Text style={styles.paragraph}>
						Go to <Text style={styles.bold}>"My Vaults"</Text> on the Dashboard.
					</Text>

					<Text style={styles.paragraph}>
						Click the <Text style={styles.bold}>Withdraw</Text> button next to your staked position.
					</Text>

					<Text style={styles.paragraph}>
						Choose to withdraw <Text style={styles.bold}>partial or full </Text>funds.
					</Text>

					<Text style={styles.paragraph}>Confirm the transaction — your assets will be unstaked and sent to your wallet.</Text>

					<Text style={styles.paragraph}>
						<View style={styles.iconContainer}>
							<DiamondFillIcon />
						</View>
						<Text style={styles.bold}>BGT & BTX rewards remain in your account</Text>, even after withdrawal.
					</Text>
				</>

				{/* SECTION 5 Maximizing Rewards */}
				<>
					<Text style={styles.sectionTitle}>Maximizing Rewards with the BGT Flywheel</Text>
					<Text style={styles.paragraph}>
						BeraTrax <Text style={styles.bold}>automatically optimizes yield</Text> using Berachain's{" "}
						<Text style={styles.bold}>Proof of Liquidity (PoL)</Text> mechanism:
					</Text>

					<Text style={styles.paragraph}>
						<Image source={getImageSource()} alt="Check mark" style={styles.icon} />
						<Text style={styles.bold}>All vault fees are pooled and used to bribe validators</Text>, increasing BGT emissions for staked
						users.
					</Text>

					<Text style={styles.paragraph}>
						<Image source={getImageSource()} alt="Check mark" style={styles.icon} />
						Users can <Text style={styles.bold}>opt-in to auto-convert BGT into iBGT</Text>, earning{" "}
						<Text style={styles.bold}>boosted validator rewards</Text> without extra steps.
					</Text>

					<Text style={styles.paragraph}>
						<Image source={getImageSource()} alt="Check mark" style={styles.icon} />
						<Text style={styles.bold}>iBGT is liquid</Text>—users can swap, stake, or hold for further rewards.
					</Text>

					<Text style={styles.paragraph}>
						You don't need to manually participate in Berachain's PoL system—BeraTrax <Text style={styles.bold}>does it all for you</Text>{" "}
						in the background.
					</Text>
				</>

				{/* SECTION 6 Maximizing Rewards */}
				<>
					<Text style={styles.sectionTitle}>Earning BTX Points by Staking & Referring</Text>

					<Text style={styles.paragraph}>
						<View style={styles.iconContainer}>
							<DiamondFillIcon />
						</View>
						<Text style={styles.bold}>BTX Points</Text>: Earn points for staking in vaults—these points determine your share of the upcoming
						BeraTrax token airdrop.
					</Text>

					<Text style={styles.paragraph}>
						<View style={styles.iconContainer}>
							<DiamondFillIcon />
						</View>
						<Text style={styles.bold}>Referrals</Text>: Grab your unique referral link from the Dashboard. Earn the same BTX points as every
						user you bring into BeraTrax!
					</Text>

					<Text style={styles.paragraph}>~~ &nbsp;The more you stake and refer, the more rewards you earn! 🚀~~ &nbsp;</Text>
				</>

				{/* SECTION 7 FAQ */}
				<>
					<View style={styles.divider} />
					<Text style={styles.sectionTitle}>Frequently Asked Questions (FAQ)</Text>

					<Text style={styles.paragraph}>
						<View style={styles.iconContainer}>
							<QuestionIcon />
						</View>
						<Text style={styles.bold}>What makes BeraTrax different from other DeFi platforms?</Text>
					</Text>

					<Text style={styles.paragraph}>
						BeraTrax <Text style={styles.bold}>removes complexity</Text>—one-click deposits, gas-free transactions, auto-compounding, and
						built-in PoL participation make it <Text style={styles.bold}>the easiest way to earn yield on Berachain</Text>.
					</Text>

					<Text style={styles.paragraph}>
						<View style={styles.iconContainer}>
							<QuestionIcon />
						</View>
						<Text style={styles.bold}>Do I need BERA tokens for gas?</Text>
					</Text>

					<Text style={styles.paragraph}>
						No! <Text style={styles.bold}>BeraTrax covers all transaction fees</Text>, so you don't need BERA for gas.
					</Text>

					<Text style={styles.paragraph}>
						<View style={styles.iconContainer}>
							<QuestionIcon />
						</View>
						<Text style={styles.bold}>How do I claim my BGT and iBGT rewards?</Text>
					</Text>

					<Text style={styles.paragraph}>
						Your earned rewards can be viewed on the <Text style={styles.bold}>Dashboard</Text> and claimed at any time. BeraTrax{" "}
						<Text style={styles.bold}>auto-compounds</Text> your rewards so that they are continuously reinvested for higher APY. BGT and
						iBGT earning opportunities are coming soon.
					</Text>

					<Text style={styles.paragraph}>
						<View style={styles.iconContainer}>
							<QuestionIcon />
						</View>
						<Text style={styles.bold}>Is BeraTrax safe?</Text>
					</Text>

					<Text style={styles.paragraph}>
						Security is a top priority. BeraTrax only utilizes <Text style={styles.bold}>audited smart contracts</Text> and Berachain's{" "}
						<Text style={styles.bold}>native PoL</Text> system to ensure safe, trustless yield farming. We even protect against any unknown
						exploits using Spherex's zero day exploit protection on every one of our contracts!
					</Text>
				</>

				{/* SECTION 8 JOIN BERATRAX COMMUNITY */}
				<>
					<View style={styles.divider} />
					<Text style={styles.sectionTitle}>Join the BeraTrax Community</Text>
					<Text style={styles.paragraph}>Want to stay updated and get involved? Follow us here:</Text>

					<Text style={styles.paragraph}>
						<View style={styles.iconContainer}>
							<WebsiteIcon />
						</View>
						<Text style={styles.bold}>Website: </Text>
						<Text style={styles.link} onPress={() => Linking.openURL("https://www.beratrax.com/")}>
							beratrax.com
						</Text>
					</Text>

					<Text style={styles.paragraph}>
						📢 <Text style={styles.bold}>Twitter: </Text>
						<Text style={styles.link} onPress={() => Linking.openURL("https://twitter.com/BeraTrax")}>
							@BeraTrax
						</Text>
					</Text>

					<Text style={styles.paragraph}>
						<View style={styles.iconContainer}>
							<ChatCircleIcon />
						</View>
						<Text style={styles.bold}>Discord: </Text>
						<Text style={styles.link} onPress={() => Linking.openURL("https://discord.gg/beratrax")}>
							Community Chat
						</Text>
					</Text>
				</>

				<View style={styles.buttonContainer}>
					<TouchableOpacity style={styles.button} onPress={() => Linking.openURL("https://docs.beratrax.com/beratrax-beta/")}>
						<Text style={styles.buttonText}>FULL USER DOCS</Text>
					</TouchableOpacity>
				</View>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		padding: 20,
		gap: 16,
	},
	title: {
		fontWeight: "bold",
		fontSize: 24,
		textTransform: "uppercase",
		color: "white",
	},
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
	bold: {
		fontWeight: "bold",
	},
	image: {
		width: "100%",
		height: 300,
		alignSelf: "center",
		marginVertical: 16,
	},
	divider: {
		height: 1,
		backgroundColor: "#999",
		marginVertical: 20,
	},
	link: {
		color: "#72b21f",
		textDecorationLine: "underline",
	},
	buttonContainer: {
		alignItems: "center",
		marginTop: 16,
		marginBottom: 32,
	},
	button: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		backgroundColor: "#5B8E19",
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		textTransform: "uppercase",
	},
	iconContainer: {
		marginRight: 8,
		width: 24,
		flexShrink: 0,
		alignItems: "center",
		justifyContent: "center",
	},
	icon: {
		width: 26,
		height: 24,
	},
});

export default UserGuide;
