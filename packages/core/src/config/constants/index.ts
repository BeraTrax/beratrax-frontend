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
};

export const BACKEND_BASE_URL = "https://api.beratrax.io/api/v1";
export const EARNINGS_GRAPH_URL =
	"https://api.goldsky.com/api/public/project_cm4bd2i5uaow101vy0y342dfg/subgraphs/beratrax-mainnet-subgraph/10.0.0/gn";
export const MAX_GAS_UNITS_PER_TRANSACTION = "700000";
export const POLLING_INTERVAL = 30000;
export const defaultChainId = CHAIN_ID.BERACHAIN; // Berachain
export const defaultNetworkName = "berachain";

// Utility function to get environment variables across platforms
const getEnvVar = (key: string): string | undefined => {
	const envKey = `EXPO_PUBLIC_${key}`;
	return process.env[envKey];
};

// Update environment variable access to use the utility function
export const walletConnectProjectId = getEnvVar("WALLET_CONNECT_PROJECT_ID") as string;
export const isDev = getEnvVar("NODE_ENV") === "development";
export const isStagging = false;

export const IS_LEGACY = getEnvVar("IS_LEGACY") === "true";
export const WEB3AUTH_CLIENT_ID = getEnvVar("WEB3AUTH_CLIENT_ID");
export const REACT_APP_GA_MEASUREMENT_ID = "G-60G0YWYR4G";
