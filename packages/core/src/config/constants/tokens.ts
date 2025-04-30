import { Address } from "viem";
import bgtLogo from "./../../assets/images/bgt.png";
import btxLogo from "./../../assets/images/btxTokenLogo.png";
import { CHAIN_ID } from "./../../types/enums";

const tokens: { address: Address; name: string; logo: string; decimals: number; chainId: number }[] = [
	{
		address: "0x656b95E550C07a9ffe548bd4085c72418Ceb1dba",
		name: "BGT",
		logo: bgtLogo,
		decimals: 18,
		chainId: CHAIN_ID.BERACHAIN,
	},
	{
		address: "0xAE24e5B7E669E87D88c5CD02Bcbb7DeF001A2612",
		name: "BTX",
		logo: btxLogo,
		decimals: 18,
		chainId: CHAIN_ID.BERACHAIN,
	},
];

export default tokens;
