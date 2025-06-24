import { CHAIN_ID } from "./../../types/enums";
import { Address } from "viem";

export interface Addresses {
	factoryAddress: Address;
	wethAddress: Address;
	sushiAddress: Address;
	dodoTokenAddress: Address;
	dodoMineAddress: Address;
	usdcAddress: Address;
	usdtAddress: Address;
	bridgedUsdAddress?: Address;
	paymasterAddress?: Address;
	universalPaymaster?: Address;
	nativeUsdAddress?: Address;
	honeyAddress?: Address;
	beraAddress?: Address;
	btxAddress?: Address;
	stakingAddress?: Address;
	airdropAddress?: Address;
}

const berachainAddresses: Addresses = {
	factoryAddress: "" as Address,
	wethAddress: "0x6969696969696969696969696969696969696969",
	sushiAddress: "" as Address,
	dodoMineAddress: "" as Address,
	dodoTokenAddress: "" as Address,
	usdcAddress: "0xd6D83aF58a19Cd14eF3CF6fe848C9A4d21e5727c",
	usdtAddress: "" as Address,
	honeyAddress: "0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03",
	beraAddress: "0x6969696969696969696969696969696969696969",
	btxAddress: "0xAE24e5B7E669E87D88c5CD02Bcbb7DeF001A2612",
	stakingAddress: "0xD278E826eB2c5B85D85989aB842fa9788DD4bDaF",
	airdropAddress: "0x7d6cffa350E6725bA8BF3bcC876d9211DD071FBd",
};

export const addressesByChainId: { [key: number]: Addresses } = {
	[CHAIN_ID.BERACHAIN]: berachainAddresses,
};
