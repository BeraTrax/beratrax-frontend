import { useState } from "react";
import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { ChatCircleIcon } from "@beratrax/ui/src/icons/ChatCircle";
import { QuestionIcon } from "@beratrax/ui/src/icons/Question";
import { WebsiteIcon } from "@beratrax/ui/src/icons/Website";
import { DiscordIcon } from "@beratrax/ui/src/icons/Discord";
import { TwitterIcon } from "@beratrax/ui/src/icons/Twitter";
import { MailIcon } from "@beratrax/ui/src/icons/Mail";
import { ChevronDownIcon } from "@beratrax/ui/src/icons/ChevronDown";
import { ChevronUpIcon } from "@beratrax/ui/src/icons/ChevronUp";
import { ExternalLinkIcon } from "@beratrax/ui/src/icons/ExternalLInk";
import { HorizontalLine } from "@beratrax/ui/src/components/HorizontalLine";

interface FAQItem {
	question: string;
	answer: string;
}

const faqData: FAQItem[] = [
	{
		question: "How do I connect my wallet to Trax?",
		answer:
			"To connect your wallet, click the 'Connect Wallet' button in the top right corner. We support MetaMask, WalletConnect, and other popular wallets. Make sure you're connected to Berachain network.",
	},
	{
		question: "What is the minimum amount to start earning?",
		answer:
			"There's no minimum amount required to start earning on Trax. You can deposit any amount into our vaults and start earning rewards immediately.",
	},
	{
		question: "How often are rewards distributed?",
		answer: "Rewards are distributed continuously as you earn them.",
	},
	{
		question: "How do I check my referral earnings?",
		answer: "You can view your referral earnings on the 'Dashboard'. This shows your total earnings from referrals.",
	},
	{
		question: "Is my investment safe on Trax?",
		answer:
			"Trax uses industry-standard security practices and smart contracts that have been audited. However, as with any DeFi protocol, there are inherent risks involved.",
	},
];

const FAQItem = ({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) => {
	return (
		<View className="mb-4 border border-gray-700 rounded-lg overflow-hidden">
			<Pressable onPress={onToggle} className="p-4 bg-gray-800/50 flex-row justify-between items-center">
				<Text className="font-league-spartan text-lg text-textWhite flex-1 pr-4">{item.question}</Text>
				{isOpen ? <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : <ChevronDownIcon className="w-5 h-5 text-gray-400" />}
			</Pressable>
			{isOpen && (
				<View className="p-4 bg-gray-800/30">
					<Text className="font-league-spartan text-base text-gray-300 leading-relaxed">{item.answer}</Text>
				</View>
			)}
		</View>
	);
};

const ContactCard = ({
	title,
	description,
	icon: Icon,
	action,
	actionText,
	href,
}: {
	title: string;
	description: string;
	icon: any;
	action?: () => void;
	actionText?: string;
	href?: string;
}) => {
	const handlePress = () => {
		if (href) {
			Linking.openURL(href);
		} else if (action) {
			action();
		}
	};

	return (
		<View className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex-1 min-w-[280px]">
			<View className="flex-row items-center mb-3">
				<Icon className="w-6 h-6 text-[#2d72da] mr-3" />
				<Text className="font-league-spartan text-xl font-bold text-textWhite">{title}</Text>
			</View>
			<Text className="font-league-spartan text-base text-gray-300 mb-4 leading-relaxed">{description}</Text>
			{(action || href) && (
				<Pressable onPress={handlePress} className="bg-[#2d72da] py-2 px-4 rounded-lg self-start flex-row items-center">
					<Text className="font-league-spartan text-white font-medium mr-2">{actionText}</Text>
					<ExternalLinkIcon className="w-4 h-4 text-white" />
				</Pressable>
			)}
		</View>
	);
};

export const Support = () => {
	const [openFAQ, setOpenFAQ] = useState<number | null>(null);

	const toggleFAQ = (index: number) => {
		setOpenFAQ(openFAQ === index ? null : index);
	};

	const handleEmailSupport = () => {
		Linking.openURL("mailto:admin@trax.finance");
	};

	return (
		<ScrollView className="flex flex-1 overflow-auto" contentContainerStyle={{ flexGrow: 1 }} showsHorizontalScrollIndicator={false}>
			<View className="p-5 gap-6">
				{/* Header */}
				<View className="mb-6">
					<Text className="font-league-spartan font-bold text-4xl leading-none uppercase text-textWhite mb-2">🎧 Support Center</Text>
					<Text className="font-league-spartan text-xl text-gray-300 leading-relaxed">
						Need help? We're here to assist you with any questions about Trax and your DeFi journey.
					</Text>
				</View>

				{/* Contact Cards */}
				<View className="mb-8">
					<Text className="font-league-spartan text-2xl font-bold text-textWhite mb-4">Get in Touch</Text>
					<View className="flex-row flex-wrap gap-4">
						<ContactCard
							title="Discord Community"
							description="Join our Discord server for real-time support, community discussions, and the latest updates."
							icon={DiscordIcon}
							actionText="Join Discord"
							href="https://discord.com/invite/beratrax"
						/>
						<ContactCard
							title="Email Support"
							description="Send us a detailed message and we'll get back to you within 24 hours."
							icon={MailIcon}
							actionText="Send Email"
							action={handleEmailSupport}
						/>
						<ContactCard
							title="Documentation"
							description="Browse our comprehensive documentation and user guides for detailed information."
							icon={WebsiteIcon}
							actionText="View Docs"
							href="/user-guide"
						/>
					</View>
				</View>

				<HorizontalLine />

				{/* FAQ Section */}
				<View className="mb-8">
					<View className="flex-row items-center mb-6">
						<QuestionIcon className="w-8 h-8 text-[#2d72da] mr-3" />
						<Text className="font-league-spartan text-2xl font-bold text-textWhite">Frequently Asked Questions</Text>
					</View>
					<View>
						{faqData.map((item, index) => (
							<FAQItem key={index} item={item} isOpen={openFAQ === index} onToggle={() => toggleFAQ(index)} />
						))}
					</View>
				</View>

				<HorizontalLine />

				{/* Social Links */}
				<View className="mb-8">
					<Text className="font-league-spartan text-2xl font-bold text-textWhite mb-4">Stay Connected</Text>
					<Text className="font-league-spartan text-base text-gray-300 mb-6 leading-relaxed">
						Follow us on social media for the latest updates, announcements, and community highlights.
					</Text>
					<View className="flex-row flex-wrap gap-4">
						<Pressable
							onPress={() => Linking.openURL("https://twitter.com/beratrax")}
							className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex-row items-center"
						>
							<TwitterIcon className="w-6 h-6 text-[#1DA1F2] mr-3" />
							<Text className="font-league-spartan text-white font-medium">Twitter</Text>
						</Pressable>
						<Pressable
							onPress={() => Linking.openURL("https://discord.com/invite/beratrax")}
							className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex-row items-center"
						>
							<DiscordIcon className="w-6 h-6 text-[#5865F2] mr-3" />
							<Text className="font-league-spartan text-white font-medium">Discord</Text>
						</Pressable>
					</View>
				</View>

				{/* Quick Help */}
				<View className="bg-gradient-to-r from-[#2d72da]/20 to-[#2d72da]/10 border border-[#2d72da]/30 rounded-lg p-6">
					<View className="flex-row items-center mb-3">
						<ChatCircleIcon className="w-6 h-6 text-[#2d72da] mr-3" />
						<Text className="font-league-spartan text-xl font-bold text-textWhite">Quick Help</Text>
					</View>
					<Text className="font-league-spartan text-base text-gray-300 leading-relaxed">
						Can't find what you're looking for? Our community is always ready to help. Join our Discord server for instant support from both
						our team and fellow users.
					</Text>
				</View>
			</View>
		</ScrollView>
	);
};

export default Support;
