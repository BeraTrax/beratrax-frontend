import { CHAIN_ID, FarmOriginPlatform } from "src/types/enums";
import { Address, zeroAddress } from "viem";

export interface PoolDef {
    isUpgradable: boolean;
    isDeprecated?: boolean;
    id: number;
    stableCoin?: boolean;
    originPlatform?: FarmOriginPlatform;
    master_chef?: string;
    pool_id?: number;
    token_type: "Token" | "LP Token";
    name: string;
    description?: string;
    source: string;
    chainId: CHAIN_ID;
    url_name: string;
    rewardVault?: Address;
    name1: string;
    name2?: string;
    name3?: string;
    platform: string;
    platform_alt: string;
    total_apy?: number;
    rewards_apy?: number;
    platform_logo: string;
    pair1: string;
    pair2?: string;
    pair3?: string;
    token1: Address;
    token2?: Address;
    token3?: Address;
    zapper_addr: Address;
    alt1: string;
    alt2?: string;
    alt3?: string;
    logo1: string;
    logo2?: string;
    logo3?: string;
    rewards1: string;
    rewards1_alt: string;
    rewards2?: string;
    rewards2_alt?: string;
    lp_address: Address;
    decimals: number;
    decimals1?: number;
    decimals2?: number;
    decimals3?: number;
    vault_addr: Address;
    zap_symbol?: string;
    apTkn?: Address;
    withdraw_decimals?: number;
    vault_decimals?: number;
    isCurrentWeeksRewardsVault?: boolean;
    isUpcoming?: boolean;
    secondary_platform?: string;
    secondary_platform_logo?: string;
    zap_currencies?: {
        symbol: string;
        address: Address;
        decimals: number;
    }[];
}

const pools_json: PoolDef[] = [
    {
        id: 7,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "iBGT",
        url_name: "iBGT",
        originPlatform: FarmOriginPlatform.Infrared,
        source: "https://infrared.finance/ibgt",
        name1: "iBGT",
        description:
            "This vault is built on Infared's iBGT vault. Your deposit is automatically staked, and all rewards are claimed and auto-compounded every minute. You can deposit directly with iBGT or zap in using HONEY or BERA. Additionally, you'll accumulate BTX points for our future airdrop, and keep any airdrops to any of the underlying vaults. (Note: Although BeraTrax does not have a deposit/withdraw fee, third party slippage applies for zaps. Your actual deposit is in iBGT, not your starting token before zapping.) ",
        stableCoin: false,
        platform: "Infrared",
        platform_alt: "Infrared logo",
        total_apy: 10.16,
        rewards_apy: 0,
        platform_logo: "infrared.ico",
        pair1: "iBGT",
        token1: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
        zapper_addr: "0x1891c027B42C108D97EaBa80c910E86CD6c6A520",
        alt1: "iBGT logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x46eFC86F0D7455F135CC9df501673739d513E982/logo.png",
        rewards1: "infrared.ico",
        rewards1_alt: "Infrared logo",
        isDeprecated: false,
        isUpgradable: false,
        lp_address: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
        decimals: 18,
        vault_addr: "0x813C9ecE1Da3B529656DfCc5D42815f9cCf60B2c",
        zap_symbol: "iBGT",
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
            {
                symbol: "iBGT",
                address: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
                decimals: 18,
            },
        ],
    },
    {
        id: 8,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "wBERA-HONEY",
        url_name: "wBERA-HONEY",
        originPlatform: FarmOriginPlatform.Infrared,
        secondary_platform: FarmOriginPlatform.Bex,
        secondary_platform_logo: "bex.ico",
        source: "https://infrared.finance/vaults/bex-honey-wbera",
        name1: "wBERA",
        name2: "HONEY",
        description:
            "This vault is built on the wBERA-HONEY vault on Infared. Your deposit is automatically converted into the wBERA-HONEY LP and deposited on BEX, then staked on Infared. You’ll earn iBGT, which is claimed and compounded once a minute. You can withdraw some or all of your position as BERA, HONEY, or iBGT (thoon) at anytime. Additionally, you’ll accumulate BTX points for our future airdrop. (Note: Although BeraTrax does not have a deposit/withdraw fee, third party slippage applies for zaps. Your actual deposit is in the LP, not your starting token before zapping.)",
        stableCoin: false,
        platform: "Infrared",
        platform_alt: "Infrared logo",
        total_apy: 14,
        rewards_apy: 0,
        platform_logo: "infrared.ico",
        pair1: "wBERA",
        pair2: "HONEY",
        token1: "0x6969696969696969696969696969696969696969",
        token2: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
        zapper_addr: "0x1891c027B42C108D97EaBa80c910E86CD6c6A520",
        alt1: "wBERA logo",
        alt2: "HONEY logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03/logo.png",
        rewards1: "infrared.ico",
        rewards1_alt: "Infrared logo",
        isDeprecated: false,
        isUpgradable: false,
        lp_address: "0x2c4a603A2aA5596287A06886862dc29d56DbC354",
        decimals: 18,
        vault_addr: "0x9bC238c1e0f31a5e016Ea484a698Ee7B4c3B219c",
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
            {
                symbol: "iBGT",
                address: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
                decimals: 18,
            },
        ],
    },
    {
        id: 9,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "wBERA-wBTC",
        url_name: "wBERA-wBTC",
        originPlatform: FarmOriginPlatform.Infrared,
        secondary_platform: FarmOriginPlatform.Bex,
        source: "https://infrared.finance/vaults/bex-wbera-wbtc",
        name1: "wBERA",
        name2: "wBTC",
        description:
            "This vault is built on the wBERA-wBTC vault on Infared. Your deposit is automatically converted into the wBERA-wBTC LP and deposited on BEX, then staked on Infared. You’ll earn iBGT, which is claimed and compounded once a minute. You can withdraw some or all of your position as BERA, HONEY, or iBGT (thoon) at anytime. Additionally, you’ll accumulate BTX points for our future airdrop. (Note: Although BeraTrax does not have a deposit/withdraw fee, third party slippage applies for zaps. Your actual deposit is in the LP, not your starting token before zapping.)",
        stableCoin: false,
        platform: "Infrared",
        platform_alt: "Infrared logo",
        total_apy: 14,
        rewards_apy: 0,
        platform_logo: "infrared.ico",
        secondary_platform_logo: "bex.ico",
        pair1: "wBERA",
        pair2: "wBTC",
        token1: "0x6969696969696969696969696969696969696969",
        token2: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
        zapper_addr: "0x1891c027B42C108D97EaBa80c910E86CD6c6A520",
        alt1: "wBERA logo",
        alt2: "wBTC logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x2577D24a26f8FA19c1058a8b0106E2c7303454a4/logo.png",
        rewards1: "infrared.ico",
        rewards1_alt: "Infrared logo",
        isDeprecated: false,
        isUpgradable: false,
        lp_address: "0x38fdD999Fe8783037dB1bBFE465759e312f2d809",
        decimals: 18,
        vault_addr: "0x45114A8fCFa77967FDb33E87f6284fc119128836",
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
            {
                symbol: "iBGT",
                address: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
                decimals: 18,
            },
        ],
    },
    {
        id: 10,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "wBERA-wETH",
        url_name: "wBERA-wETH",
        originPlatform: FarmOriginPlatform.Infrared,
        secondary_platform: FarmOriginPlatform.Bex,
        source: "https://infrared.finance/vaults/bex-wbera-weth",
        name1: "wBERA",
        name2: "wETH",
        description:
            "This vault is built on the wBERA-wETH vault on Infared. Your deposit is automatically converted into the wBERA-wETH LP and deposited on BEX, then staked on Infared. You’ll earn iBGT, which is claimed and compounded once a minute. You can withdraw some or all of your position as BERA, HONEY, or iBGT (thoon) at anytime. Additionally, you’ll accumulate BTX points for our future airdrop, as well as any aidrops any of the underlying. (Note: Although BeraTrax does not have a deposit/withdraw fee, third party slippage applies for zaps. Your actual deposit is in the LP, not your starting token before zapping.)",
        stableCoin: false,
        platform: "Infrared",
        platform_alt: "Infrared logo",
        secondary_platform_logo: "bex.ico",
        total_apy: 14,
        rewards_apy: 0,
        platform_logo: "infrared.ico",
        pair1: "wBERA",
        pair2: "wETH",
        token1: "0x6969696969696969696969696969696969696969",
        token2: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
        zapper_addr: "0x1891c027B42C108D97EaBa80c910E86CD6c6A520",
        alt1: "wBERA logo",
        alt2: "wETH logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0xE28AfD8c634946833e89ee3F122C06d7C537E8A8/logo.png",
        rewards1: "infrared.ico",
        rewards1_alt: "Infrared logo",
        isDeprecated: false,
        isUpgradable: false,
        lp_address: "0xDd70A5eF7d8CfE5C5134b5f9874b09Fb5Ce812b4",
        decimals: 18,
        vault_addr: "0x76BAe24B0fc180B98A613E3AF19F1A6AE8E4d4F4",
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
            {
                symbol: "iBGT",
                address: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
                decimals: 18,
            },
        ],
    },
    {
        id: 22,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "Nect-USDC-Honey",
        url_name: "Nect-USDC-Honey",
        originPlatform: FarmOriginPlatform.Burrbear,
        source: "https://app.burrbear.io/#/berachain/pool/0xd10e65a5f8ca6f835f2b1832e37cf150fb955f23000000000000000000000004",
        name1: "Nect",
        name2: "USDC",
        name3: "HONEY",
        description:
            "This vault is built on Burrbear's Nect-USDCe-Honey vault. Your deposit is automatically converted into the Nect-USDCe-Honey LP and deposited for you. You’ll earn WBERA, which is claimed and compounded once a minute. You can zap in using HONEY or BERA. Additionally, you'll accumulate BTX points for our future airdrop, and keep any airdrops to any of the underlying vaults. (Note: Although BeraTrax does not have a deposit/withdraw fee, third party slippage applies for zaps. Your actual deposit is in Nect-USDCe-Honey, not your starting token before zapping.) ",
        stableCoin: false,
        platform: "Burrbear",
        platform_alt: "Burrbear logo",
        total_apy: 36.477,
        rewards_apy: 0,
        platform_logo: "burrbear.ico",
        pair1: "Nect",
        pair2: "USDC",
        pair3: "HONEY",
        token1: "0x1cE0a25D13CE4d52071aE7e02Cf1F6606F4C79d3",
        token2: "0x549943e04f40284185054145c6E4e9568C1D3241",
        token3: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
        zapper_addr: "0xa600A42327779a6b3e0ef31E2d377814195E9cD6",
        alt1: "Nect logo",
        alt2: "USDC logo",
        alt3: "HONEY logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x1ce0a25d13ce4d52071ae7e02cf1f6606f4c79d3/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0xd6D83aF58a19Cd14eF3CF6fe848C9A4d21e5727c/logo.png",
        logo3: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03/logo.png",
        rewards1: "burrbear.ico",
        rewards1_alt: "Burrbear logo",
        isDeprecated: false,
        isUpgradable: false,
        lp_address: "0xD10E65A5F8cA6f835F2B1832e37cF150fb955f23",
        decimals: 18,
        vault_addr: "0xFD2dE4473577fd5a786E0DFaA611Bbd334fAc8eA",
        zap_symbol: "HONEY",
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
        ],
    },
    {
        id: 20,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "HONEY-BYUSD",
        url_name: "HONEY-BYUSD",
        originPlatform: FarmOriginPlatform.Infrared,
        secondary_platform: FarmOriginPlatform.Bex,
        secondary_platform_logo: "bex.ico",
        source: "https://infrared.finance/vaults/bex-byusd-honey",
        name1: "HONEY",
        name2: "BYUSD",
        description:
            "This vault is built on Infared's HONEY-BYUSD vault. Your deposit is automatically staked, and all rewards are claimed and auto-compounded every minute. You can deposit directly with iBGT or zap in using HONEY or BERA. Additionally, you'll accumulate BTX points for our future airdrop, and keep any airdrops to any of the underlying vaults. (Note: Although BeraTrax does not have a deposit/withdraw fee, third party slippage applies for zaps. Your actual deposit is in HONEY-BYUSD, not your starting token before zapping.) ",
        stableCoin: false,
        platform: "Infrared",
        platform_alt: "Infrared logo",
        total_apy: 10.16,
        rewards_apy: 0,
        platform_logo: "infrared.ico",
        pair1: "HONEY",
        pair2: "BYUSD",
        token1: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
        token2: "0x688e72142674041f8f6Af4c808a4045cA1D6aC82",
        zapper_addr: "0xbEDc2b73feBa033Cc2b6F7FC20b5a474CD5e6b4f",
        alt1: "HONEY logo",
        alt2: "BYUSD logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x688e72142674041f8f6Af4c808a4045cA1D6aC82/logo.png",
        rewards1: "infrared.ico",
        rewards1_alt: "Infrared logo",
        isDeprecated: false,
        isUpgradable: false,
        lp_address: "0xdE04c469Ad658163e2a5E860a03A86B52f6FA8C8",
        decimals: 18,
        vault_addr: "0xe88e01F2e3eb8E867Bf38E873DCC229264696098",
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
            {
                symbol: "iBGT",
                address: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
                decimals: 18,
            },
        ],
    },
    {
        id: 21,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "USDC-HONEY",
        url_name: "USDC-HONEY",
        originPlatform: FarmOriginPlatform.Infrared,
        secondary_platform: FarmOriginPlatform.Bex,
        secondary_platform_logo: "bex.ico",
        source: "https://infrared.finance/vaults/bex-usdc.e-honey",
        name1: "USDC",
        name2: "HONEY",
        description:
            "This vault is built on Infared's USDC-HONEY vault. Your deposit is automatically staked, and all rewards are claimed and auto-compounded every minute. You can deposit directly with iBGT or zap in using HONEY or BERA. Additionally, you'll accumulate BTX points for our future airdrop, and keep any airdrops to any of the underlying vaults. (Note: Although BeraTrax does not have a deposit/withdraw fee, third party slippage applies for zaps. Your actual deposit is in USDC-HONEY, not your starting token before zapping.) ",
        stableCoin: false,
        platform: "Infrared",
        platform_alt: "Infrared logo",
        total_apy: 10.16,
        rewards_apy: 0,
        platform_logo: "infrared.ico",
        pair1: "USDC",
        pair2: "HONEY",
        token1: "0x549943e04f40284185054145c6e4e9568c1d3241",
        token2: "0x688e72142674041f8f6Af4c808a4045cA1D6aC82",
        zapper_addr: "0xbEDc2b73feBa033Cc2b6F7FC20b5a474CD5e6b4f",
        alt1: "USDC logo",
        alt2: "HONEY logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0xd6D83aF58a19Cd14eF3CF6fe848C9A4d21e5727c/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03/logo.png",
        rewards1: "infrared.ico",
        rewards1_alt: "Infrared logo",
        isDeprecated: false,
        isUpgradable: false,
        lp_address: "0xF961a8f6d8c69E7321e78d254ecAfBcc3A637621",
        decimals: 18,
        vault_addr: "0x7c04723AB200D55d1C826160340c089E7CaAFEea",
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
            {
                symbol: "iBGT",
                address: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
                decimals: 18,
            },
        ],
    },
    {
        id: 11,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "wBERA-HONEY",
        url_name: "wBERA-HONEY",
        originPlatform: FarmOriginPlatform.Kodiak,
        source: "https://app.kodiak.finance/#/liquidity/pools/0x4a254b11810b8ebb63c5468e438fc561cb1bb1da?farm=0x40c4d0a87157c3c1df26267ac02505d930baeeeb&chain=berachain_mainnet",
        name1: "wBERA",
        name2: "HONEY",
        description:
            "This vault is built on the wBERA-HONEY vault on Kodiak. Your deposit is automatically converted into the wBERA-HONEY LP and deposited for you. You can withdraw some or all of your position as BERA or HONEY at any time. Additionally, you'll accumulate BTX points for our future airdrop, and keep any airdrops to any of the underlying vaults. (Note: Although BeraTrax does not have a deposit/withdraw fee, third-party slippage applies for zaps. Your actual deposit is in the LP, not your starting token before zapping.)",
        stableCoin: false,
        platform: "Kodiak",
        platform_alt: "Kodiak logo",
        total_apy: 14,
        rewards_apy: 0,
        platform_logo: "kodiak.jpg",
        pair1: "wBERA",
        pair2: "HONEY",
        token1: "0x6969696969696969696969696969696969696969",
        token2: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
        zapper_addr: "0x59527EA4F285164eaA687cBD11Ac8886bad83eb8",
        alt1: "wBERA logo",
        alt2: "HONEY logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03/logo.png",
        rewards1: "kodiak.jpg",
        rewards1_alt: "Kodiak logo",
        isDeprecated: false,
        isUpgradable: false,
        lp_address: "0x4a254B11810B8EBb63C5468E438FC561Cb1bB1da",
        decimals: 18,
        vault_addr: "0x69D08aaCd061B4054036BE42D6807cf669de13bd",
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
        ],
    },
    {
        id: 12,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "wBERA-wETH",
        url_name: "wBERA-wETH",
        originPlatform: FarmOriginPlatform.Kodiak,
        source: "https://app.kodiak.finance/#/liquidity/pools/0x9659dc8c1565e0bd82627267e3b4eed1a377ebe6?farm=0xf41ecc551e3c7449e74a7a7464bb2674fa76954c&chain=berachain_mainnet",
        name1: "wBERA",
        name2: "wETH",
        description:
            "This vault is built on the wBERA-wETH vault on Kodiak. Your deposit is automatically converted into the wBERA-wETH LP and deposited for you. You can withdraw some or all of your position as BERA or HONEY at any time. Additionally, you'll accumulate BTX points for our future airdrop, and keep any airdrops to any of the underlying vaults. (Note: Although BeraTrax does not have a deposit/withdraw fee, third-party slippage applies for zaps. Your actual deposit is in the LP, not your starting token before zapping.)",
        stableCoin: false,
        platform: "Kodiak",
        platform_alt: "Kodiak logo",
        total_apy: 14,
        rewards_apy: 0,
        platform_logo: "kodiak.jpg",
        pair1: "wBERA",
        pair2: "wETH",
        token1: "0x6969696969696969696969696969696969696969",
        token2: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
        zapper_addr: "0x59527EA4F285164eaA687cBD11Ac8886bad83eb8",
        alt1: "wBERA logo",
        alt2: "wETH logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0xE28AfD8c634946833e89ee3F122C06d7C537E8A8/logo.png",
        rewards1: "kodiak.jpg",
        rewards1_alt: "Kodiak logo",
        isDeprecated: false,
        isUpgradable: false,
        lp_address: "0x9659dc8c1565E0bd82627267e3b4eEd1a377ebE6",
        decimals: 18,
        vault_addr: "0xf279F04E3976cc9b32A4ce0402620d2D4C8C692C",
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
        ],
    },
    {
        id: 13,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "wBERA-YEET",
        url_name: "wBERA-YEET",
        originPlatform: FarmOriginPlatform.Kodiak,
        source: "https://app.kodiak.finance/#/liquidity/pools/0xec8ba456b4e009408d0776cde8b91f8717d13fa1?farm=0x1c8e199c6c42d5cce652cf02002694d937118177&chain=berachain_mainnet",
        name1: "wBERA",
        name2: "YEET",
        description:
            "This vault is built on the wBERA-YEET vault on Kodiak. Your deposit is automatically converted into the wBERA-YEET LP and deposited for you. You can withdraw some or all of your position as BERA or HONEY at any time. Additionally, you'll accumulate BTX points for our future airdrop, and keep any airdrops to any of the underlying vaults. (Note: Although BeraTrax does not have a deposit/withdraw fee, third-party slippage applies for zaps. Your actual deposit is in the LP, not your starting token before zapping.)",
        stableCoin: false,
        platform: "Kodiak",
        platform_alt: "Kodiak logo",
        total_apy: 14,
        rewards_apy: 0,
        platform_logo: "kodiak.jpg",
        pair1: "wBERA",
        pair2: "YEET",
        token1: "0x6969696969696969696969696969696969696969",
        token2: "0x08A38Caa631DE329FF2DAD1656CE789F31AF3142",
        zapper_addr: "0x59527EA4F285164eaA687cBD11Ac8886bad83eb8",
        alt1: "wBERA logo",
        alt2: "YEET logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x1740F679325ef3686B2f574e392007A92e4BeD41/logo.png",
        rewards1: "kodiak.jpg",
        rewards1_alt: "Kodiak logo",
        isDeprecated: false,
        isUpgradable: false,
        lp_address: "0xEc8BA456b4e009408d0776cdE8B91f8717D13Fa1",
        decimals: 18,
        vault_addr: "0x8C8ed236D367F7885478959aD5af37E5a1575afA",
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
        ],
    },
    {
        id: 14,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "wBERA-RAMEN",
        url_name: "wBERA-RAMEN",
        originPlatform: FarmOriginPlatform.Kodiak,
        source: "https://app.kodiak.finance/#/liquidity/pools/0x93a913351cae2d8c82c4b85f699726947eb76d32?farm=0x6f22221dc5845a25597bc96629d92f2b4979d943&chain=berachain_mainnet",
        name1: "wBERA",
        name2: "RAMEN",
        description:
            "This vault is built on the wBERA-RAMEN vault on Kodiak. Your deposit is automatically converted into the wBERA-RAMEN LP and deposited for you. You can withdraw some or all of your position as BERA or HONEY at any time. Additionally, you'll accumulate BTX points for our future airdrop, and keep any airdrops to any of the underlying vaults. (Note: Although BeraTrax does not have a deposit/withdraw fee, third-party slippage applies for zaps. Your actual deposit is in the LP, not your starting token before zapping.)",
        stableCoin: false,
        platform: "Kodiak",
        platform_alt: "Kodiak logo",
        total_apy: 14,
        rewards_apy: 0,
        platform_logo: "kodiak.jpg",
        pair1: "wBERA",
        pair2: "RAMEN",
        token1: "0x6969696969696969696969696969696969696969",
        token2: "0xb8B1Af593Dc37B33a2c87C8Db1c9051FC32858B7",
        zapper_addr: "0x59527EA4F285164eaA687cBD11Ac8886bad83eb8",
        alt1: "wBERA logo",
        alt2: "RAMEN logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0xb8B1Af593Dc37B33a2c87C8Db1c9051FC32858B7/logo.png",
        rewards1: "kodiak.jpg",
        rewards1_alt: "Kodiak logo",
        isDeprecated: false,
        isUpgradable: false,
        lp_address: "0x93A913351CaE2D8C82C4b85f699726947eB76d32",
        decimals: 18,
        vault_addr: "0x2C368aD56E801ed8E8590DF84Cb537E98f566460",
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
        ],
    },
    {
        id: 15,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "wBERA-wBTC",
        url_name: "wBERA-wBTC",
        originPlatform: FarmOriginPlatform.Kodiak,
        source: "https://app.kodiak.finance/#/liquidity/pools/0xf06ea29fcf4765200742d29e685973a1870eac98?farm=0x0d74359866a86d0f192f5cd53d103d299043165b&chain=berachain_mainnet",
        name1: "wBERA",
        name2: "wBTC",
        description:
            "This vault is built on the wBERA-wBTC vault on Kodiak. Your deposit is automatically converted into the wBERA-wBTC LP and deposited for you. You can withdraw some or all of your position as BERA or HONEY at any time. Additionally, you'll accumulate BTX points for our future airdrop, and keep any airdrops to any of the underlying vaults. (Note: Although BeraTrax does not have a deposit/withdraw fee, third-party slippage applies for zaps. Your actual deposit is in the LP, not your starting token before zapping.)",
        stableCoin: false,
        platform: "Kodiak",
        platform_alt: "Kodiak logo",
        total_apy: 14,
        rewards_apy: 0,
        platform_logo: "kodiak.jpg",
        pair1: "wBERA",
        pair2: "wBTC",
        token1: "0x6969696969696969696969696969696969696969",
        token2: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
        zapper_addr: "0x59527EA4F285164eaA687cBD11Ac8886bad83eb8",
        alt1: "wBERA logo",
        alt2: "wBTC logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03/logo.png",
        rewards1: "kodiak.jpg",
        rewards1_alt: "Kodiak logo",
        isDeprecated: false,
        isUpgradable: false,
        lp_address: "0xF06EA29FCF4765200742d29E685973a1870EaC98",
        decimals: 18,
        vault_addr: "0x388FF9498b8d967DE373b4a440a7A54A34Ec2743",
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
        ],
    },
    {
        id: 16,
        isUpcoming: true,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "iBERA",
        url_name: "iBERA",
        originPlatform: FarmOriginPlatform.Infrared,
        source: "https://infrared.finance/ibera",
        name1: "iBERA",
        description:
            "This vault is built on Infared's iBERA vault. Your deposit is automatically staked, and all rewards are claimed and auto-compounded every minute. You can deposit directly with iBGT or zap in using HONEY or BERA. Additionally, you'll accumulate BTX points for our future airdrop, and keep any airdrops to any of the underlying vaults. (Note: Although BeraTrax does not have a deposit/withdraw fee, third party slippage applies for zaps. Your actual deposit is in iBERA, not your starting token before zapping.) ",
        stableCoin: false,
        platform: "Infrared",
        platform_alt: "Infrared logo",
        total_apy: 7.24,
        rewards_apy: 0,
        platform_logo: "infrared.ico",
        pair1: "iBERA",
        token1: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
        zapper_addr: "0x1891c027B42C108D97EaBa80c910E86CD6c6A520",
        alt1: "iBGT logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x9b6761bf2397bb5a6624a856cc84a3a14dcd3fe5/logo.png",
        rewards1: "infrared.ico",
        rewards1_alt: "Infrared logo",
        isDeprecated: false,
        isUpgradable: false,
        lp_address: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
        decimals: 18,
        vault_addr: "0x813C9ecE1Da3B529656DfCc5D42815f9cCf60B2c",
        zap_symbol: "iBGT",
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
            {
                symbol: "iBGT",
                address: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
                decimals: 18,
            },
        ],
    },
    {
        id: 18,
        isUpcoming: true,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "Yeet-wBERA",
        url_name: "Yeet-wBERA",
        originPlatform: FarmOriginPlatform.Yeet,
        source: "https://vault.yeetit.xyz/",
        name1: "Yeet",
        name2: "wBERA",
        description:
            "This vault is built on Yeet's Yeet-wBERA vault. Your deposit is automatically staked, and all rewards are claimed and auto-compounded every minute. You can directly zap in using HONEY or BERA. Additionally, you'll accumulate BTX points for our future airdrop, and keep any airdrops to any of the underlying vaults. (Note: Although BeraTrax does not have a deposit/withdraw fee, third party slippage applies for zaps. Your actual deposit is in Yeet-wBERA, not your starting token before zapping.) ",
        stableCoin: false,
        platform: "Yeet",
        platform_alt: "Yeet logo",
        total_apy: 10.16,
        rewards_apy: 0,
        platform_logo: "yeet.ico",
        pair1: "Yeet",
        pair2: "wBERA",
        token1: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
        token2: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
        zapper_addr: "0x1891c027B42C108D97EaBa80c910E86CD6c6A520",
        alt1: "Yeet logo",
        alt2: "wBERA logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x1740F679325ef3686B2f574e392007A92e4BeD41/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png",
        rewards1: "yeet.ico",
        rewards1_alt: "Yeet logo",
        isDeprecated: false,
        isUpgradable: false,
        lp_address: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
        decimals: 18,
        vault_addr: "0x813C9ecE1Da3B529656DfCc5D42815f9cCf60B2c",
        zap_symbol: "iBGT",
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
        ],
    },
    {
        id: 19,
        isUpcoming: true,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "wBERA-HONEY",
        url_name: "wBERA-HONEY",
        originPlatform: FarmOriginPlatform.Kodiak,
        source: "https://app.kodiak.finance/#/liquidity/pools/0x4a254b11810b8ebb63c5468e438fc561cb1bb1da?farm=0x40c4d0a87157c3c1df26267ac02505d930baeeeb&chain=berachain_mainnet",
        name1: "wBERA",
        name2: "HONEY",
        description:
            "This vault is built on Kodiak's wBERA-HONEY vault. Your deposit is automatically staked, and all rewards are claimed and auto-compounded every minute. You can directly zap in using HONEY or BERA. Additionally, you'll accumulate BTX points for our future airdrop, and keep any airdrops to any of the underlying vaults. (Note: Although BeraTrax does not have a deposit/withdraw fee, third party slippage applies for zaps. Your actual deposit is in wBERA-HONEY, not your starting token before zapping.) ",
        stableCoin: false,
        platform: "Kodiak",
        platform_alt: "Kodiak logo",
        total_apy: 26.29,
        rewards_apy: 0,
        platform_logo: "kodiak.jpg",
        pair1: "wBERA",
        pair2: "HONEY",
        token1: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
        token2: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
        zapper_addr: "0x1891c027B42C108D97EaBa80c910E86CD6c6A520",
        alt1: "wBERA logo",
        alt2: "HONEY logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03/logo.png",
        rewards1: "kodiak.ico",
        rewards1_alt: "Kodiak logo",
        isDeprecated: false,
        isUpgradable: false,
        lp_address: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
        decimals: 18,
        vault_addr: "0x813C9ecE1Da3B529656DfCc5D42815f9cCf60B2c",
        zap_symbol: "iBGT",
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
        ],
    },

    {
        id: 1,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "wBERA-HONEY",
        url_name: "wBERA-HONEY",
        originPlatform: FarmOriginPlatform.Steer,
        source: "https://app.steer.finance/vault/0xa7A15127c3b5a65244F07f6730E56F90918087e6",
        name1: "wBERA",
        name2: "HONEY",
        description:
            "This vault is built on the wBERA-HONEY vault on Kodiak, which is rebalanced for a higher APY with Steer. Your deposit is automatically converted into the wBERA-HONEY LP and deposited for you. You can withdraw some or all of your position as BERA or HONEY at any time. Additionally, you'll accumulate BTX points for our future airdrop, and keep any airdrops to any of the underlying vaults. (Note: Although BeraTrax does not have a deposit/withdraw fee, third-party slippage applies for zaps. Your actual deposit is in the LP, not your starting token before zapping.)",
        stableCoin: false,
        platform: "Steer",
        platform_alt: "Steer logo",
        secondary_platform: "Kodiak",
        secondary_platform_logo: "kodiak.jpg",
        total_apy: 14,
        rewards_apy: 0,
        platform_logo: "steer.ico",
        pair1: "wBERA",
        pair2: "HONEY",
        token1: "0x6969696969696969696969696969696969696969",
        token2: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
        zapper_addr: "0x56C71eD9aA842E290aB061DE27eb2CE446fd2145",
        alt1: "wBERA logo",
        alt2: "HONEY logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03/logo.png",
        rewards1: "steer.ico",
        rewards1_alt: "Steer logo",
        isDeprecated: false,
        isUpgradable: false,
        lp_address: "0xa7A15127c3b5a65244F07f6730E56F90918087e6",
        decimals: 18,
        vault_addr: "0x1a80d8e5dA17D15A8140B0910c08634C83995D96",
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
        ],
    },
    {
        id: 5,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "wBERA-wETH",
        url_name: "wBERA-wETH",
        originPlatform: FarmOriginPlatform.Steer,
        source: "https://app.steer.finance/vault/0x3C62a8Fcd7c4cf19Bf71DEB35b43aD976a541aCF",
        name1: "wBERA",
        name2: "wETH",
        description:
            "This vault is built on the wBERA-wETH vault on Kodiak, which is rebalanced for a higher APY with Steer. Your deposit is automatically converted into the wBERA-wETH LP and deposited for you. You can withdraw some or all of your position as BERA or HONEY at any time. Additionally, you'll accumulate BTX points for our future airdrop, and keep any airdrops to any of the underlying vaults. (Note: Although BeraTrax does not have a deposit/withdraw fee, third-party slippage applies for zaps. Your actual deposit is in the LP, not your starting token before zapping.)",
        stableCoin: false,
        platform: "Steer",
        platform_alt: "Steer logo",
        secondary_platform: "Kodiak",
        secondary_platform_logo: "kodiak.jpg",
        total_apy: 14,
        rewards_apy: 0,
        platform_logo: "steer.ico",
        pair1: "wBERA",
        pair2: "wETH",
        token1: "0x6969696969696969696969696969696969696969",
        token2: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
        zapper_addr: "0x56C71eD9aA842E290aB061DE27eb2CE446fd2145",
        alt1: "wBERA logo",
        alt2: "wETH logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0xE28AfD8c634946833e89ee3F122C06d7C537E8A8/logo.png",
        rewards1: "steer.ico",
        rewards1_alt: "Steer logo",
        isDeprecated: false,
        isUpgradable: false,
        lp_address: "0x3C62a8Fcd7c4cf19Bf71DEB35b43aD976a541aCF",
        decimals: 18,
        vault_addr: "0x1d4AAA36e2a6362C73a221f546813f1E48C41c11",
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
        ],
    },

    {
        id: 4,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "wETH-HONEY",
        url_name: "wETH-HONEY",
        originPlatform: FarmOriginPlatform.Steer,
        source: "https://app.steer.finance/vault/0xcD02e0bC03593c4a38822A1226934742d4722988",
        name1: "wETH",
        name2: "HONEY",
        description:
            "This vault is built on the wETH-HONEY vault on Kodiak, which is rebalanced for a higher APY with Steer. Your deposit is automatically converted into the wETH-HONEY LP and deposited for you. You can withdraw some or all of your position as BERA or HONEY at any time. Additionally, you'll accumulate BTX points for our future airdrop, and keep any airdrops to any of the underlying vaults. (Note: Although BeraTrax does not have a deposit/withdraw fee, third-party slippage applies for zaps. Your actual deposit is in the LP, not your starting token before zapping.)",
        stableCoin: false,
        platform: "Steer",
        platform_alt: "Steer logo",
        secondary_platform: "Kodiak",
        secondary_platform_logo: "kodiak.jpg",
        total_apy: 14,
        rewards_apy: 0,
        platform_logo: "steer.ico",
        pair1: "wETH",
        pair2: "HONEY",
        token1: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
        token2: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
        zapper_addr: "0x56C71eD9aA842E290aB061DE27eb2CE446fd2145",
        alt1: "wETH logo",
        alt2: "HONEY logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0xE28AfD8c634946833e89ee3F122C06d7C537E8A8/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03/logo.png",
        rewards1: "steer.ico",
        rewards1_alt: "Steer logo",
        isDeprecated: true,
        isUpgradable: false,
        lp_address: "0xcD02e0bC03593c4a38822A1226934742d4722988",
        decimals: 18,
        vault_addr: "0x79e14058406d8FdB91a59e29b3F127FA8Cdc2075",
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
        ],
    },

    {
        id: 2,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "USDC-HONEY",
        url_name: "USDC-HONEY",
        originPlatform: FarmOriginPlatform.Steer,
        source: "https://app.steer.finance/vault/0xdCb3E75CdbDDfe7b08494eaA6C0Df98189C65f03",
        name1: "USDC",
        name2: "HONEY",
        description:
            "This vault is built on the USDC-HONEY vault on Kodiak, which is rebalanced for a higher APY with Steer. Your deposit is automatically converted into the USDC-HONEY LP and deposited for you. You can withdraw some or all of your position as BERA or HONEY at any time. Additionally, you'll accumulate BTX points for our future airdrop, and keep any airdrops to any of the underlying vaults. (Note: Although BeraTrax does not have a deposit/withdraw fee, third-party slippage applies for zaps. Your actual deposit is in the LP, not your starting token before zapping.)",
        stableCoin: false,
        platform: "Steer",
        platform_alt: "Steer logo",
        secondary_platform: "Kodiak",
        secondary_platform_logo: "kodiak.jpg",
        total_apy: 14,
        rewards_apy: 0,
        platform_logo: "steer.ico",
        pair1: "USDC",
        pair2: "HONEY",
        token1: "0x549943e04f40284185054145c6E4e9568C1D3241",
        token2: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
        zapper_addr: "0x56C71eD9aA842E290aB061DE27eb2CE446fd2145",
        alt1: "USDC logo",
        alt2: "HONEY logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0xd6D83aF58a19Cd14eF3CF6fe848C9A4d21e5727c/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03/logo.png",
        rewards1: "steer.ico",
        rewards1_alt: "Steer logo",
        lp_address: "0xdCb3E75CdbDDfe7b08494eaA6C0Df98189C65f03",
        decimals: 18,
        vault_addr: "0x5d1F9ea2cDDEb3048d81Cb7aB7683C3c9F00D623",
        isDeprecated: true,
        isUpgradable: false,
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
        ],
    },

    {
        id: 3,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "wBTC-HONEY",
        url_name: "wBTC-HONEY",
        originPlatform: FarmOriginPlatform.Steer,
        source: "https://app.steer.finance/vault/0xa9CbF1DcdeD90E046F6D300A7050a40E7600f4eD",
        name1: "wBTC",
        name2: "HONEY",
        description:
            "This vault is built on the wBTC-HONEY vault on Kodiak, which is rebalanced for a higher APY with Steer. Your deposit is automatically converted into the wBTC-HONEY LP and deposited for you. You can withdraw some or all of your position as BERA or HONEY at any time. Additionally, you'll accumulate BTX points for our future airdrop, and keep any airdrops to any of the underlying vaults. (Note: Although BeraTrax does not have a deposit/withdraw fee, third-party slippage applies for zaps. Your actual deposit is in the LP, not your starting token before zapping.)",
        stableCoin: false,
        platform: "Steer",
        platform_alt: "Steer logo",
        secondary_platform: "Kodiak",
        secondary_platform_logo: "kodiak.jpg",
        total_apy: 14,
        rewards_apy: 0,
        platform_logo: "steer.ico",
        pair1: "wBTC",
        pair2: "HONEY",
        token1: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
        token2: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
        zapper_addr: "0x56C71eD9aA842E290aB061DE27eb2CE446fd2145",
        alt1: "wBTC logo",
        alt2: "HONEY logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x2577D24a26f8FA19c1058a8b0106E2c7303454a4/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03/logo.png",
        rewards1: "steer.ico",
        rewards1_alt: "Steer logo",
        isDeprecated: false,
        isUpgradable: false,
        lp_address: "0xa9CbF1DcdeD90E046F6D300A7050a40E7600f4eD",
        decimals: 18,
        vault_addr: "0xD72B83dE434171d0Fa5336f1854125dFF0f84824",
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
        ],
    },

    {
        id: 6,
        chainId: CHAIN_ID.BERACHAIN,
        token_type: "Token",
        name: "wBTC-wETH",
        url_name: "wBTC-wETH",
        originPlatform: FarmOriginPlatform.Steer,
        source: "https://app.steer.finance/vault/0x55c66603Ec52E4cD08e17BaF184BBB7a7e18DA11",
        name1: "wBTC",
        name2: "wETH",
        description:
            "This vault is built on the wBTC-wETH vault on Kodiak, which is rebalanced for a higher APY with Steer. Your deposit is automatically converted into the wBTC-wETH LP and deposited for you. You can withdraw some or all of your position as BERA or HONEY at any time. Additionally, you'll accumulate BTX points for our future airdrop, and keep any airdrops to any of the underlying vaults. (Note: Although BeraTrax does not have a deposit/withdraw fee, third-party slippage applies for zaps. Your actual deposit is in the LP, not your starting token before zapping.)",
        stableCoin: false,
        platform: "Steer",
        platform_alt: "Steer logo",
        total_apy: 14,
        rewards_apy: 0,
        platform_logo: "steer.ico",
        secondary_platform: "Kodiak",
        secondary_platform_logo: "kodiak.jpg",
        pair1: "wBTC",
        pair2: "wETH",
        token1: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
        token2: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
        zapper_addr: "0x56C71eD9aA842E290aB061DE27eb2CE446fd2145",
        alt1: "wBTC logo",
        alt2: "wETH logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x2577D24a26f8FA19c1058a8b0106E2c7303454a4/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0xE28AfD8c634946833e89ee3F122C06d7C537E8A8/logo.png",
        rewards1: "steer.ico",
        rewards1_alt: "Steer logo",
        isDeprecated: true,
        isUpgradable: false,
        lp_address: "0x55c66603Ec52E4cD08e17BaF184BBB7a7e18DA11",
        decimals: 18,
        vault_addr: "0xBfF450EfF556cb54F4b762bAfb9565266c35917D",
        zap_currencies: [
            {
                symbol: "HONEY",
                address: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
                decimals: 18,
            },
            {
                symbol: "BERA",
                address: zeroAddress,
                decimals: 18,
            },
        ],
    },
];

export default pools_json;

export const pools_chain_ids = Array.from(pools_json.reduce((acc, curr) => acc.add(curr.chainId), new Set<number>()));

export let Common_Chains_State: Record<number, Record<any, any>> = {};
pools_chain_ids.forEach((item) => {
    Common_Chains_State[item] = [] as any;
});

export const platformNames = pools_json.reduce((acc, curr) => {
    if (curr.platform && curr.platform_logo) {
        const exists = acc.some((item) => item.name === curr.platform);
        if (!exists) {
            const count = pools_json.filter((item) => item.platform === curr.platform && !item.isDeprecated).length;
            acc.push({
                name: curr.platform,
                logo: curr.platform_logo,
                count,
            });
        }
    }
    return acc;
}, [] as { name: string; logo: string; count: number }[]);

export const tokenImages = pools_json.reduce((acc, curr) => {
    if (curr.logo1) {
        const exists = acc.some((item) => item.name === curr.name1);
        if (!exists) {
            acc.push({
                name: curr.name1,
                logo: curr.logo1,
            });
        }
    }
    if (curr.logo2) {
        const exists2 = acc.some((item) => item.name === curr.name2);
        if (!exists2) {
            acc.push({
                name: curr.name2 || "",
                logo: curr.logo2 || "",
            });
        }
    }
    return acc;
}, [] as { name: string; logo: string }[]);

export const tokenNamesAndImages = pools_json.reduce(
    (acc, curr) => {
        if (curr.isUpcoming) return acc;
        acc[curr.token1] = { name: curr.name1.toUpperCase(), logos: [curr.logo1] };
        acc[curr.lp_address] = { name: curr.name.toUpperCase(), logos: [curr.logo1] };
        if (curr.token2 && curr.name2 && curr.logo2) {
            acc[curr.token2] = { name: curr.name2.toUpperCase(), logos: [curr.logo2] };
            acc[curr.lp_address].logos.push(curr.logo2);
        }
        return acc;
    },
    {
        [zeroAddress]: {
            name: "BERA",
            logos: [
                "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png",
            ],
        },
    } as Record<string, { name: string; logos: string[] }>
);
