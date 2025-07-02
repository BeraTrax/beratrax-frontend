import { CHAIN_ID } from "./../../types/enums";

export const RoutesPaths = {
	Home: "/",
	Farms: "/earn",
	Swap: "/swap",
	Bridge: "/bridge",
	Buy: "/buy",
	Mesh: "/import-crypto",
	Stats: "/stats",
	Governance: "/governance",
	ReferralDashboard: "/referral-dashboard",
	Test: "/Test",
	Test_pro_max: "/test_pro_max",
	Deposit: "/deposit",
	UserGuide: "/user-guide",
	Leaderboard: "/leaderboard",
	BurrBearAdmin: "/admin/burrbear",
	Status: "/status",
};

// Utility function to get environment variables across platforms
const getEnvVar = (key: string): string | undefined => {
	const envKey = `EXPO_PUBLIC_${key}`;
	return process.env[envKey];
};

export const BACKEND_BASE_URL = "https://api.beratrax.io/api/v1/";
export const EARNINGS_GRAPH_URL =
	"https://api.goldsky.com/api/public/project_cm4bd2i5uaow101vy0y342dfg/subgraphs/beratrax-mainnet-subgraph/prod/gn";
export const EARNINGS_GRAPH_URL_BASE =
	"https://gateway-arbitrum.network.thegraph.com/api/616d6a1cc1199359a718e468c9aec235/subgraphs/id/D7uDmHS7qoxRwxHPnYNQm2foppkWmi7r2TaH5qZDX2Dh";
export const STEER_PROTOCOL_EARNINGS_GRAPH_URL =
	"https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-bera/prod/gn";
export const KODIAK_EARNINGS_GRAPH_URL =
	"https://api.goldsky.com/api/public/project_clpx84oel0al201r78jsl0r3i/subgraphs/kodiak-v3-berachain-mainnet/latest/gn";
export const BURRBEAR_EARNINGS_GRAPH_URL =
	"https://api.goldsky.com/api/public/project_cluukfpdrw61a01xag6yihcuy/subgraphs/berachain/prod/gn";

export const MAX_GAS_UNITS_PER_TRANSACTION = "700000";
export const POLLING_INTERVAL = 30000;
export const defaultChainId = CHAIN_ID.BERACHAIN; // Berachain
export const defaultNetworkName = "berachain";
export const REACT_APP_GA_MEASUREMENT_ID = "G-60G0YWYR4G";
export const VAULT_NEW_DURATION = 5 * 24 * 60 * 60; // 5 days

// Update environment variable access to use the utility function
export const [walletConnectProjectId, web3authClientId, productionTransakKey, stagingTransakKey, HOLYHELD_API_KEY, nodeEnv, IS_LEGACY] = [
	"WALLET_CONNECT_PROJECT_ID",
	"WEB3AUTH_CLIENT_ID",
	"RAMP_TRANSAK_API_KEY",
	"STAGING_RAMP_TRANSAK_API_KEY",
	"HOLYHELD_API_KEY",
	"NODE_ENV",
	"IS_LEGACY",
].map(getEnvVar) as Array<string>;

export const isDev = nodeEnv === "development";
export const isStagging = nodeEnv === "staging";
export const isProduction = nodeEnv === "production";
export const isExperimental = nodeEnv === "experimental";
export const RAMP_TRANSAK_API_KEY = isStagging ? stagingTransakKey : productionTransakKey;
