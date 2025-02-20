import { CHAIN_ID, FarmOriginPlatform } from "src/types/enums";
import { Address, zeroAddress } from "viem";

export interface PoolDef {
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
    platform: string;
    platform_alt: string;
    total_apy?: number;
    rewards_apy?: number;
    platform_logo: string;
    pair1: string;
    pair2?: string;
    token1: Address;
    token2?: Address;
    zapper_addr: Address;
    alt1: string;
    alt2?: string;
    logo1: string;
    logo2?: string;
    rewards1: string;
    rewards1_alt: string;
    rewards2?: string;
    rewards2_alt?: string;
    lp_address: Address;
    decimals: number;
    decimals1?: number;
    decimals2?: number;
    vault_addr: Address;
    zap_symbol?: string;
    apTkn?: Address;
    withdraw_decimals?: number;
    vault_decimals?: number;
    isCurrentWeeksRewardsVault?: boolean;
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
            "This is vault is built on the iBGT vault on Infrared. Your funds will be zapped into iBGT and then the LP token will be created and deposited for you. You also earn BTX points on top.",
        stableCoin: false,
        platform: "Infrared",
        platform_alt: "Infrared logo",
        total_apy: 10.16,
        rewards_apy: 0,
        platform_logo: "infrared.ico",
        pair1: "iBGT",
        token1: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
        zapper_addr: "0x5441DB43f7A32719a607EB3Edcef080dA88e84AF",
        alt1: "iBGT logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x46eFC86F0D7455F135CC9df501673739d513E982/logo.png",
        rewards1: "infrared.ico",
        rewards1_alt: "Infrared logo",
        isDeprecated: false,
        lp_address: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
        decimals: 18,
        vault_addr: "0x813C9ecE1Da3B529656DfCc5D42815f9cCf60B2c",
        zap_symbol: "IBGT",
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
        name: "HONEY-WBERA",
        url_name: "HONEY-WBERA",
        originPlatform: FarmOriginPlatform.Steer,
        source: "https://app.steer.finance/vault/0xa7A15127c3b5a65244F07f6730E56F90918087e6",
        name1: "HONEY",
        name2: "WBERA",
        description:
            "This is vault is built on the HONEY-WBERA vault on Steer. Your funds will be zapped into HONEY and wrapped BERA, and then the LP token will be created and deposited for you. You also earn BTX points on top.",
        stableCoin: false,
        platform: "Steer",
        platform_alt: "Steer logo",
        total_apy: 14,
        rewards_apy: 0,
        platform_logo: "steer.ico",
        pair1: "HONEY",
        pair2: "WBERA",
        token1: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
        token2: "0x6969696969696969696969696969696969696969",
        zapper_addr: "0xBEea5847165828e2Da5be5eb3e93Faafd797F5A8",
        alt1: "HONEY logo",
        alt2: "WBERA logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png",
        rewards1: "steer.ico",
        rewards1_alt: "Steer logo",
        isDeprecated: false,
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
        name: "WBERA-WETH",
        url_name: "WBERA-WETH",
        originPlatform: FarmOriginPlatform.Steer,
        source: "https://app.steer.finance/vault/0x3C62a8Fcd7c4cf19Bf71DEB35b43aD976a541aCF",
        name1: "WBERA",
        name2: "WETH",
        description:
            "This is vault is built on the WBERA-WETH vault on Steer. Your funds will be zapped into WBERA and wrapped WETH, and then the LP token will be created and deposited for you. You also earn BTX points on top.",
        stableCoin: false,
        platform: "Steer",
        platform_alt: "Steer logo",
        total_apy: 14,
        rewards_apy: 0,
        platform_logo: "steer.ico",
        pair1: "WBERA",
        pair2: "WETH",
        token1: "0x6969696969696969696969696969696969696969",
        token2: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
        zapper_addr: "0xBEea5847165828e2Da5be5eb3e93Faafd797F5A8",
        alt1: "WBERA logo",
        alt2: "WETH logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0xE28AfD8c634946833e89ee3F122C06d7C537E8A8/logo.png",
        rewards1: "steer.ico",
        rewards1_alt: "Steer logo",
        isDeprecated: false,
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
        name: "HONEY-WETH",
        url_name: "HONEY-WETH",
        originPlatform: FarmOriginPlatform.Steer,
        source: "https://app.steer.finance/vault/0xcD02e0bC03593c4a38822A1226934742d4722988",
        name1: "HONEY",
        name2: "WETH",
        description:
            "This is vault is built on the HONEY-WETH vault on Steer. Your funds will be zapped into HONEY and wrapped WETH, and then the LP token will be created and deposited for you. You also earn BTX points on top.",
        stableCoin: false,
        platform: "Steer",
        platform_alt: "Steer logo",
        total_apy: 14,
        rewards_apy: 0,
        platform_logo: "steer.ico",
        pair1: "HONEY",
        pair2: "WETH",
        token1: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
        token2: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
        zapper_addr: "0xBEea5847165828e2Da5be5eb3e93Faafd797F5A8",
        alt1: "HONEY logo",
        alt2: "WETH logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0xE28AfD8c634946833e89ee3F122C06d7C537E8A8/logo.png",
        rewards1: "steer.ico",
        rewards1_alt: "Steer logo",
        isDeprecated: false,
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
        name: "HONEY-USDC",
        url_name: "HONEY-USDC",
        originPlatform: FarmOriginPlatform.Steer,
        source: "https://app.steer.finance/vault/0xdCb3E75CdbDDfe7b08494eaA6C0Df98189C65f03",
        name1: "HONEY",
        name2: "USDC",
        description:
            "This is vault is built on the HONEY-USDC vault on Steer. Your funds will be zapped into HONEY and wrapped USDC, and then the LP token will be created and deposited for you. You also earn BTX points on top.",
        stableCoin: false,
        platform: "Steer",
        platform_alt: "Steer logo",
        total_apy: 14,
        rewards_apy: 0,
        platform_logo: "steer.ico",
        pair1: "HONEY",
        pair2: "USDC",
        token1: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
        token2: "0x549943e04f40284185054145c6E4e9568C1D3241",
        zapper_addr: "0xBEea5847165828e2Da5be5eb3e93Faafd797F5A8",
        alt1: "HONEY logo",
        alt2: "USDC logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0xd6D83aF58a19Cd14eF3CF6fe848C9A4d21e5727c/logo.png",
        rewards1: "steer.ico",
        rewards1_alt: "Steer logo",
        isDeprecated: false,
        lp_address: "0xdCb3E75CdbDDfe7b08494eaA6C0Df98189C65f03",
        decimals: 18,
        vault_addr: "0x5d1F9ea2cDDEb3048d81Cb7aB7683C3c9F00D623",
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
        name: "HONEY-WBTC",
        url_name: "HONEY-WBTC",
        originPlatform: FarmOriginPlatform.Steer,
        source: "https://app.steer.finance/vault/0xa9CbF1DcdeD90E046F6D300A7050a40E7600f4eD",
        name1: "HONEY",
        name2: "WBTC",
        description:
            "This is vault is built on the HONEY-WBTC vault on Steer. Your funds will be zapped into HONEY and wrapped WBTC, and then the LP token will be created and deposited for you. You also earn BTX points on top.",
        stableCoin: false,
        platform: "Steer",
        platform_alt: "Steer logo",
        total_apy: 14,
        rewards_apy: 0,
        platform_logo: "steer.ico",
        pair1: "HONEY",
        pair2: "WBTC",
        token1: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
        token2: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
        zapper_addr: "0xBEea5847165828e2Da5be5eb3e93Faafd797F5A8",
        alt1: "HONEY logo",
        alt2: "WBTC logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x2577D24a26f8FA19c1058a8b0106E2c7303454a4/logo.png",
        rewards1: "steer.ico",
        rewards1_alt: "Steer logo",
        isDeprecated: false,
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
        name: "WBTC-WETH",
        url_name: "WBTC-WETH",
        originPlatform: FarmOriginPlatform.Steer,
        source: "https://app.steer.finance/vault/0x55c66603Ec52E4cD08e17BaF184BBB7a7e18DA11",
        name1: "WBTC",
        name2: "WETH",
        description:
            "This is vault is built on the WBTC-WETH vault on Steer. Your funds will be zapped into WBTC and wrapped WETH, and then the LP token will be created and deposited for you. You also earn BTX points on top.",
        stableCoin: false,
        platform: "Steer",
        platform_alt: "Steer logo",
        total_apy: 14,
        rewards_apy: 0,
        platform_logo: "steer.ico",
        pair1: "WBTC",
        pair2: "WETH",
        token1: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
        token2: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
        zapper_addr: "0xBEea5847165828e2Da5be5eb3e93Faafd797F5A8",
        alt1: "WBTC logo",
        alt2: "WETH logo",
        logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x2577D24a26f8FA19c1058a8b0106E2c7303454a4/logo.png",
        logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0xE28AfD8c634946833e89ee3F122C06d7C537E8A8/logo.png",
        rewards1: "steer.ico",
        rewards1_alt: "Steer logo",
        isDeprecated: false,
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
