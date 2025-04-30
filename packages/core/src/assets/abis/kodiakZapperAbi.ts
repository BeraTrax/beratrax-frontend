export const ZapperAbi = [
	{
		inputs: [
			{ indexed: true, name: "recipient", internalType: "address", type: "address" },
			{ indexed: false, name: "amountOut", internalType: "uint256", type: "uint256" },
		],
		name: "Withdraw",
		anonymous: false,
		type: "event",
	},
	{
		inputs: [
			{
				internalType: "contract IVault",
				name: "vault",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "withdrawAmount",
				type: "uint256",
			},
			{
				internalType: "contract IERC20",
				name: "desiredToken",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "desiredTokenOutMin",
				type: "uint256",
			},
		],
		name: "zapOutAndSwap",
		outputs: [
			{
				internalType: "uint256",
				name: "tokenOutAmount",
				type: "uint256",
			},
			{
				components: [
					{
						internalType: "address",
						name: "tokens",
						type: "address",
					},
					{
						internalType: "uint256",
						name: "amounts",
						type: "uint256",
					},
				],
				internalType: "struct IZapper.ReturnedAsset[]",
				name: "returnedAssets",
				type: "tuple[]",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "contract IVault",
				name: "vault",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "withdrawAmount",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "desiredTokenOutMin",
				type: "uint256",
			},
		],
		name: "zapOutAndSwapEth",
		outputs: [
			{
				internalType: "uint256",
				name: "tokenOutAmount",
				type: "uint256",
			},
			{
				components: [
					{
						internalType: "address",
						name: "tokens",
						type: "address",
					},
					{
						internalType: "uint256",
						name: "amounts",
						type: "uint256",
					},
				],
				internalType: "struct IZapper.ReturnedAsset[]",
				name: "returnedAssets",
				type: "tuple[]",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		stateMutability: "payable",
		type: "receive",
	},
] as const;
