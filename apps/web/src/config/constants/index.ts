import { CHAIN_ID } from "src/types/enums";

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
    DeprecatedVaults: "/deprecated-vaults",
};

export const SNAPSHOT_SPACE_ID = "contrax.eth";
export const SNAPSHOT_APP_NAME = "Beratrax Finance";
export const SNAPSHOT_HUB_URL = "https://hub.snapshot.org";
export const SNAPSHOT_GRAPHQL_URL = "https://hub.snapshot.org/graphql";
export const MAX_GAS_UNITS_PER_TRANSACTION = "700000";
export const defaultChainId = CHAIN_ID.BERACHAIN; // Berachain
export const defaultNetworkName = "berachain";
export const walletConnectProjectId = import.meta.env.REACT_APP_WALLET_CONNECT_PROJECT_ID as string;
export const isDev = import.meta.env.NODE_ENV === "development";
export const isStagging = window.location.hostname.includes("staging.beratrax.com");
export const GATEFI_MERCHANT_ID = import.meta.env.REACT_APP_GATEFI_MERCHANT_ID as string;
export const SOCKET_BRIDGE_KEY = import.meta.env.REACT_APP_SOCKET_BRIDGE_KEY;
export const SOCKET_API_KEY = import.meta.env.REACT_APP_SOCKET_BRIDGE_KEY;
export const RAMP_TRANSAK_API_KEY = import.meta.env.REACT_APP_RAMP_TRANSAK_API_KEY;
export const ZERODEV_PROJECT_ID = import.meta.env.REACT_APP_ZERODEV_PROJECT_ID!;
export const ZERODEV_PROJECT_ID_MAINNET = import.meta.env.REACT_APP_ZERODEV_PROJECT_ID_MAINNET!;
export const IS_LEGACY = import.meta.env.REACT_APP_IS_LEGACY === "true";
export const DODO_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-arbitrum";
export const FRAX_APR_API_URL = "https://stargate.finance/.netlify/functions/farms";
export const SUSHUISWAP_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/sushi-0m/sushiswap-arbitrum";
export const SHUSHISWAP_CHEF_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/jiro-ono/arbitrum-minichef-staging";
export const SWAPFISH_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/swapfish/swapfish";
export const WEB3AUTH_CLIENT_ID = import.meta.env.REACT_APP_WEB3AUTH_CLIENT_ID;
export const EARNINGS_GRAPH_URL =
    "https://api.goldsky.com/api/public/project_cm4bd2i5uaow101vy0y342dfg/subgraphs/beratrax-mainnet-subgraph/7.0.0/gn";
export const EARNINGS_GRAPH_URL_BASE =
    "https://gateway-arbitrum.network.thegraph.com/api/616d6a1cc1199359a718e468c9aec235/subgraphs/id/D7uDmHS7qoxRwxHPnYNQm2foppkWmi7r2TaH5qZDX2Dh";
export const HOP_EXCHANGE_APY_URL = "https://assets.hop.exchange/v1.1-pool-stats.json";
export const BACKEND_BASE_URL = "https://beratrax-mainnet-api-10de3bcaddfb.herokuapp.com/api/v1";
export const TENDERLY_ACCESS_TOKEN = import.meta.env.REACT_APP_TENDERLY_ACCESS_TOKEN;
export const TENDERLY_PROJECT_SLUG = import.meta.env.REACT_APP_TENDERLY_PROJECT_SLUG;
export const TENDERLY_USER_NAME = import.meta.env.REACT_APP_TENDERLY_USER_NAME;
export const WERT_PARTNER_ID = import.meta.env.REACT_APP_WERT_PARTNER_ID;
export const POLLING_INTERVAL = 30000;
export const INFURA_KEY = import.meta.env.REACT_APP_INFURA;
export const ALCHEMY_KEY = import.meta.env.REACT_APP_ALCHEMY;
console.log(process.env.REACT_APP_BARTIO_RPC_URL);
export const BARTIO_RPC_URL =
    import.meta.env.REACT_APP_BARTIO_RPC_URL ??
    "https://berachain-bartio.g.alchemy.com/v2/VUwkyWR596J0Wq8sxvXtBYH_8X7CLcNn";

// export const FRONT_URL = import.meta.env.REACT_APP_FRONT_URL_SANDBOX as string;
// export const FRONT_API_KEY = import.meta.env.REACT_APP_FRONT_API_KEY_SANDBOX as string;
export const FRONT_URL = import.meta.env.REACT_APP_FRONT_URL as string;
export const FRONT_API_KEY = import.meta.env.REACT_APP_FRONT_API_KEY as string;
export const FRONT_CLIENT_ID = import.meta.env.REACT_APP_FRONT_CLIENT_ID as string;
export const REACT_APP_GA_MEASUREMENT_ID = "G-60G0YWYR4G";

export const tenderlyRpcs: { [key: string]: string } = {
    [CHAIN_ID.ARBITRUM]: `https://arbitrum.gateway.tenderly.co/6YtRegY86MErUrbfeB4e8L`,
    [CHAIN_ID.BASE]: `https://base.gateway.tenderly.co/6lueMXUaDSXb1VtTVFELQ1`,
};

export const STEER_PROTOCOL_EARNINGS_GRAPH_URL =
    "https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-bera/prod/gn";
export const KODIAK_EARNINGS_GRAPH_URL =
    "https://api.goldsky.com/api/public/project_clpx84oel0al201r78jsl0r3i/subgraphs/kodiak-v3-berachain-mainnet/latest/gn";
export const BURRBEAR_EARNINGS_GRAPH_URL =
    "https://api.goldsky.com/api/public/project_cluukfpdrw61a01xag6yihcuy/subgraphs/berachain/prod/gn";
