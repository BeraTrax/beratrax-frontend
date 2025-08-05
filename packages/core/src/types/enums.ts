export enum FarmTransactionType {
	Deposit = "Deposit",
	Withdraw = "Withdraw",
}
export const FarmOriginPlatform = {
	Hop: { name: "Hop", logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/platform-logos/hop/hop.svg" },
	Clipper: { name: "Clipper", logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/platform-logos/clipper/clipper.svg" },
	Steer: { name: "Steer", logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/platform-logos/steer/steer.ico" },
	Core: { name: "Core", logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/platform-logos/core/core.png" },
	Gamma: { name: "Gamma", logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/platform-logos/gamma/gamma.svg" },
	Kodiak: { name: "Kodiak", logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/platform-logos/kodiak/kodiak.ico" },
	Infrared: { name: "Infrared", logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/platform-logos/infrared/infrared.ico" },
	Arbera: { name: "Arbera", logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/platform-logos/arbera/arbera.ico" },
	Beradrome: {
		name: "Beradrome",
		logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/platform-logos/beradrome/beradrome.ico",
	},
	Burrbear: { name: "Burrbear", logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/platform-logos/burrbear/burrbear.ico" },
	Yeet: { name: "Yeet", logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/platform-logos/yeet/yeet.ico" },
	Bex: { name: "Bex", logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/platform-logos/bex/bex.ico" },
	Wasabee: { name: "Wasabee", logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/platform-logos/wasabee/wasabee.ico" },
	BeraPaw: { name: "BeraPaw", logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/platform-logos/berapaw/berapaw.ico" },
	Trax: { name: "Trax", logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/trax-logo/logo.png" },
	XTF: { name: "XTF", logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/trax-logo/logo.png" },
	Bearn: { name: "Bearn", logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/platform-logos/bearn/bearn.ico" },
	Beraborrow: {
		name: "Beraborrow",
		logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/platform-logos/beraborrow/beraborrow.ico",
	},
};
export enum FarmTableColumns {
	Token = "Vaults",
	Dual_Token = "Advanced Vaults",
	Deposited = "Deposited",
	APY = "Apy",
	EARNED = "Earned",
}

export enum FarmType {
	normal = "Token",
	advanced = "LP Token",
}

export enum CHAIN_ID {
	MAINNET = 1,
	POLYGON = 137,
	ARBITRUM = 42161,
	LINEA = 59144,
	OPTIMISM = 10,
	BASE = 8453,
	CORE = 1116,
	BERACHAIN = 80094,
}
export enum FarmSortOptions {
	Default = "Default",
	APY_Low_to_High = "APY: Low to High",
	APY_High_to_Low = "APY High to Low",
	Deposit_High_to_Low = "Deposit High to Low",
	Deposit_Low_to_High = "Deposit Low to High",
	New = "New",
}

export enum UsersTableColumns {
	Address = "address",
	TVL = "tvl",
	Referrer = "referrer",
	TraxEarned = "earnedTrax",
	TraxEarnedRefferal = "earnedTraxByReferral",
	ReferralCount = "referralCount",
	Multiplier = "multiplier",
	LeaderboardRanking = "leaderboardRanking",
	GalxeRanking = "galxeRanking",
	ReferralCountWithNonZeroStake = "referralCountWithNonZeroStake",
}

export enum VaultsTableColumns {
	Title = "Title",
	DepositedTvl = "Deposited Tvl",
	AverageDeposits = "Average Deposits",
	NoOfDeposits = "No of Deposits",
}
