const ETFVaultAbi = [
	{
		inputs: [
			{
				internalType: "string",
				name: "name",
				type: "string",
			},
			{
				internalType: "string",
				name: "symbol",
				type: "string",
			},
			{
				internalType: "contract IVault[]",
				name: "vaultAddresses",
				type: "address[]",
			},
			{
				internalType: "uint256[]",
				name: "targetRatios",
				type: "uint256[]",
			},
			{
				internalType: "contract IZapper[]",
				name: "zappers",
				type: "address[]",
			},
			{
				internalType: "enum IDexType.DexType[]",
				name: "dexTypes",
				type: "uint8[]",
			},
			{
				internalType: "address",
				name: "quoteRouter",
				type: "address",
			},
			{
				internalType: "address",
				name: "governance",
				type: "address",
			},
		],
		stateMutability: "nonpayable",
		type: "constructor",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "target",
				type: "address",
			},
		],
		name: "AddressEmptyCode",
		type: "error",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "account",
				type: "address",
			},
		],
		name: "AddressInsufficientBalance",
		type: "error",
	},
	{
		inputs: [],
		name: "AddressZero",
		type: "error",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "spender",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "allowance",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "needed",
				type: "uint256",
			},
		],
		name: "ERC20InsufficientAllowance",
		type: "error",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "sender",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "balance",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "needed",
				type: "uint256",
			},
		],
		name: "ERC20InsufficientBalance",
		type: "error",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "approver",
				type: "address",
			},
		],
		name: "ERC20InvalidApprover",
		type: "error",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "receiver",
				type: "address",
			},
		],
		name: "ERC20InvalidReceiver",
		type: "error",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "sender",
				type: "address",
			},
		],
		name: "ERC20InvalidSender",
		type: "error",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "spender",
				type: "address",
			},
		],
		name: "ERC20InvalidSpender",
		type: "error",
	},
	{
		inputs: [],
		name: "ETHNotAllowed",
		type: "error",
	},
	{
		inputs: [],
		name: "FailedInnerCall",
		type: "error",
	},
	{
		inputs: [],
		name: "InsufficientBalance",
		type: "error",
	},
	{
		inputs: [],
		name: "InvalidInput",
		type: "error",
	},
	{
		inputs: [],
		name: "NotGovernance",
		type: "error",
	},
	{
		inputs: [],
		name: "PriceNotSetForAsset",
		type: "error",
	},
	{
		inputs: [],
		name: "PriceNotSetForVault",
		type: "error",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address",
			},
		],
		name: "SafeERC20FailedOperation",
		type: "error",
	},
	{
		inputs: [],
		name: "SlippageTooHigh",
		type: "error",
	},
	{
		inputs: [],
		name: "UnsupportedDexType",
		type: "error",
	},
	{
		inputs: [],
		name: "ZapperNotSet",
		type: "error",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "owner",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "spender",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256",
			},
		],
		name: "Approval",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "user",
				type: "address",
			},
			{
				indexed: true,
				internalType: "uint256[]",
				name: "vaultIndices",
				type: "uint256[]",
			},
			{
				indexed: false,
				internalType: "address",
				name: "tokenIn",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "tokenInAmount",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "assetsIn",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "shares",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "fee",
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
				indexed: false,
				internalType: "struct IZapper.ReturnedAsset[]",
				name: "returnedAssets",
				type: "tuple[]",
			},
		],
		name: "Deposit",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint8",
				name: "dex",
				type: "uint8",
			},
		],
		name: "SetDefaultDex",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256",
			},
		],
		name: "Transfer",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "user",
				type: "address",
			},
			{
				indexed: true,
				internalType: "uint256[]",
				name: "vaultIndices",
				type: "uint256[]",
			},
			{
				indexed: false,
				internalType: "address",
				name: "tokenOut",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "tokenOutAmount",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "assetsOut",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "shares",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "fee",
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
				indexed: false,
				internalType: "struct IZapper.ReturnedAsset[]",
				name: "returnedAssets",
				type: "tuple[]",
			},
		],
		name: "Withdraw",
		type: "event",
	},
	{
		inputs: [],
		name: "REBALANCE_THRESHOLD",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "STABLECOIN",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address",
			},
			{
				internalType: "address",
				name: "spender",
				type: "address",
			},
		],
		name: "allowance",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "spender",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256",
			},
		],
		name: "approve",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		name: "assetDex",
		outputs: [
			{
				internalType: "enum IDexType.DexType",
				name: "",
				type: "uint8",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "account",
				type: "address",
			},
		],
		name: "balanceOf",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
		],
		name: "compareDepositWithdraw",
		outputs: [
			{
				internalType: "uint256[]",
				name: "depositIndices",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "depositAmounts",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "withdrawIndices",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "withdrawAmounts",
				type: "uint256[]",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "decimals",
		outputs: [
			{
				internalType: "uint8",
				name: "",
				type: "uint8",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256[]",
				name: "vaultIndices",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "vaultShareAmounts",
				type: "uint256[]",
			},
			{
				internalType: "uint256",
				name: "minETFShares",
				type: "uint256",
			},
		],
		name: "deposit",
		outputs: [
			{
				internalType: "uint256",
				name: "etfShares",
				type: "uint256",
			},
			{
				internalType: "uint256[]",
				name: "actualAmounts",
				type: "uint256[]",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "shares",
				type: "uint256",
			},
		],
		name: "emergencyWithdraw",
		outputs: [
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "getAllOverallocatedVaults",
		outputs: [
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "getAllUnderallocatedVaults",
		outputs: [
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "getAllocationPercentages",
		outputs: [
			{
				internalType: "uint256[]",
				name: "percentages",
				type: "uint256[]",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "asset",
				type: "address",
			},
		],
		name: "getAssetPriceUSD",
		outputs: [
			{
				internalType: "uint256",
				name: "price",
				type: "uint256",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "getETFTokenPriceUSD",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "totalDepositUSD",
				type: "uint256",
			},
		],
		name: "getOptimalDepositVaultShares",
		outputs: [
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "totalWithdrawUSD",
				type: "uint256",
			},
		],
		name: "getOptimalWithdrawVaultShares",
		outputs: [
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "getRebalancingStatus",
		outputs: [
			{
				internalType: "bool",
				name: "needsRebalancing",
				type: "bool",
			},
			{
				internalType: "uint256[]",
				name: "targetPercentages",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "currentPercentages",
				type: "uint256[]",
			},
			{
				internalType: "int256[]",
				name: "deviations",
				type: "int256[]",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "getTVL",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "getTargetRatios",
		outputs: [
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address",
			},
		],
		name: "getTokenPriceUSD",
		outputs: [
			{
				internalType: "uint256",
				name: "price",
				type: "uint256",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "getVaultDeviations",
		outputs: [
			{
				internalType: "int256[]",
				name: "",
				type: "int256[]",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "getVaultInfo",
		outputs: [
			{
				components: [
					{
						internalType: "uint256",
						name: "currentValueUSD",
						type: "uint256",
					},
					{
						internalType: "uint256",
						name: "currentRatio",
						type: "uint256",
					},
					{
						internalType: "uint256",
						name: "targetRatio",
						type: "uint256",
					},
					{
						internalType: "uint256",
						name: "balance",
						type: "uint256",
					},
				],
				internalType: "struct ETFLibrary.VaultInfo[]",
				name: "",
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
		],
		name: "getVaultTokenPriceUSD",
		outputs: [
			{
				internalType: "uint256",
				name: "price",
				type: "uint256",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "vaultIdx",
				type: "uint256",
			},
		],
		name: "getVaultTokens",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getVaults",
		outputs: [
			{
				internalType: "contract IVault[]",
				name: "",
				type: "address[]",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "governance",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		name: "isAssetSingleToken",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "isRebalanceNeeded",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "name",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256[]",
				name: "vaultIndices",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "vaultShareAmounts",
				type: "uint256[]",
			},
		],
		name: "previewDeposit",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256[]",
				name: "vaultIndices",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "vaultShareAmounts",
				type: "uint256[]",
			},
		],
		name: "previewWithdraw",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "totalDepositUSD",
				type: "uint256",
			},
		],
		name: "previewZapIn",
		outputs: [
			{
				internalType: "uint256[]",
				name: "vaultIndices",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "amountsUSD",
				type: "uint256[]",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "totalWithdrawUSD",
				type: "uint256",
			},
		],
		name: "previewZapOut",
		outputs: [
			{
				internalType: "uint256[]",
				name: "vaultIndices",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "quoteRouter",
		outputs: [
			{
				internalType: "contract IQuoteRouter",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address[]",
				name: "assets",
				type: "address[]",
			},
			{
				internalType: "bool[]",
				name: "isSingleToken",
				type: "bool[]",
			},
		],
		name: "setAssetInfo",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "_governance",
				type: "address",
			},
		],
		name: "setGovernance",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "_quoteRouter",
				type: "address",
			},
		],
		name: "setQuoteRouter",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
			{
				internalType: "bool",
				name: "isDeposit",
				type: "bool",
			},
		],
		name: "simulateRebalancingEffect",
		outputs: [
			{
				internalType: "uint256[]",
				name: "currentRatios",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "newRatios",
				type: "uint256[]",
			},
			{
				internalType: "int256",
				name: "improvement",
				type: "int256",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "symbol",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		name: "targetRatios",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "totalSupply",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256",
			},
		],
		name: "transfer",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "from",
				type: "address",
			},
			{
				internalType: "address",
				name: "to",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256",
			},
		],
		name: "transferFrom",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		name: "vaultZappers",
		outputs: [
			{
				internalType: "contract IZapper",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		name: "vaults",
		outputs: [
			{
				internalType: "contract IVault",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256[]",
				name: "vaultIndices",
				type: "uint256[]",
			},
			{
				internalType: "uint256[]",
				name: "vaultShareAmounts",
				type: "uint256[]",
			},
			{
				internalType: "uint256",
				name: "maxETFShares",
				type: "uint256",
			},
		],
		name: "withdraw",
		outputs: [
			{
				internalType: "uint256",
				name: "etfShares",
				type: "uint256",
			},
			{
				internalType: "uint256[]",
				name: "actualAmounts",
				type: "uint256[]",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "wrappedNative",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenIn",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "tokenInAmount",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "minShares",
				type: "uint256",
			},
		],
		name: "zapIn",
		outputs: [
			{
				internalType: "uint256",
				name: "shares",
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
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "etfShares",
				type: "uint256",
			},
			{
				internalType: "address",
				name: "tokenOut",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "minTokenOut",
				type: "uint256",
			},
		],
		name: "zapOut",
		outputs: [
			{
				internalType: "uint256",
				name: "tokenReceived",
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

export default ETFVaultAbi;
