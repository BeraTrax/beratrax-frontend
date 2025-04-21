import { ZerionPositionWithChainIdString } from "src/state/tokens/types";
import { CHAIN_ID, FarmType } from "src/types/enums";
import { getAddress, zeroAddress } from "viem";
import { addressesByChainId } from "src/config/constants/contracts";
import tokens from "src/config/constants/tokens";
import { Token } from "src/types";

export const copyToClipboard = (text: string, cb: Function | null = null) => {
    navigator.clipboard.writeText(text);
    setTimeout(() => {
        if (cb) cb();
    }, 1000);
};

export const getPositionSuffix = (index: number) => {
    const j = index % 10,
        k = index % 100;
    if (j == 1 && k != 11) {
        return index + "st";
    }
    if (j == 2 && k != 12) {
        return index + "nd";
    }
    if (j == 3 && k != 13) {
        return index + "rd";
    }
    return index + "th";
};

export const isNumber = (value: any) => {
    return typeof value === "number" && !isNaN(parseFloat(value.toString()));
};

export const limitDecimals = (value: string, decimals: number) => {
    const [integer, decimal] = value.split(".");
    if (decimal) {
        return `${integer}.${decimal.slice(0, decimals)}`;
    }
    return value;
};

/**
 * Transforms Zerion API position data into our standard Token format.
 * This function handles both single positions and arrays of positions, filtering out invalid tokens
 * and standardizing the data structure for use throughout the application.
 * 
 * @param position - Single position or array of positions from Zerion API
 * @returns Array of Token, filtered and standardized
 */
export const transformZerionToExternalBalances = (positions: ZerionPositionWithChainIdString[]): Token[] => {

    // Handle single position case (same logic as above)
    return positions
        .map((position): Token | null => {
            const impl = position.attributes.fungible_info.implementations.find(impl => impl.chain_id === "berachain");

            // Early return conditions for filtering invalid tokens
            if (!impl) return null;
            const tokenAddress = impl.address ? getAddress(impl.address) : zeroAddress;
            const tokenIcon = position.attributes.fungible_info.icon;
            const tokenPrice = position.attributes.price;
            const usdBalance = position.attributes.value

            // 1. Skip zero address (native currency handled separately)
            // 2. Skip tokens without icons (for UI consistency)
            // 3. Skip tokens with zero price (likely invalid or not supported)
            // (not included) 4. Skip LP tokens and platform-specific tokens (handled by farm system)
            if (!tokenAddress || tokenAddress === zeroAddress || tokenAddress === addressesByChainId[CHAIN_ID.BERACHAIN].beraAddress) return null;
            if (!tokenIcon) return null;
            if (tokenPrice === 0 && tokens.find(tok => tok.address === tokenAddress)) return null;
            if (!usdBalance) return null;

            // if (tokenSymbol.includes('vault') || tokenSymbol.includes('lp') || tokenSymbol.includes('uni-v2') || tokenSymbol.includes('cake-lp')) return null;
            return {
                address: tokenAddress,
                name: position.attributes.fungible_info.symbol,
                token_type: FarmType.normal,
                logo: tokenIcon.url,
                balance: position.attributes.quantity.numeric,
                usdBalance: position.attributes.value.toString(),
                decimals: impl.decimals,
                networkId: Number(CHAIN_ID.BERACHAIN),
                network: impl.chain_id,
                price: tokenPrice
            };
        }).filter(tok => tok !== null);
};