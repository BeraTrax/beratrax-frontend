const zapperAbi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "devAddress",
                type: "address",
            },
            {
                internalType: "address",
                name: "wrappedNative",
                type: "address",
            },
            {
                internalType: "address",
                name: "stablecoin",
                type: "address",
            },
            {
                internalType: "address",
                name: "swapRouter",
                type: "address",
            },
            {
                internalType: "address",
                name: "lpRouter",
                type: "address",
            },
            {
                internalType: "address",
                name: "feeRecipient",
                type: "address",
            },
            {
                internalType: "uint16",
                name: "zapInFee",
                type: "uint16",
            },
            {
                internalType: "uint16",
                name: "zapOutFee",
                type: "uint16",
            },
            {
                internalType: "address",
                name: "indexUtilsAddress",
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
        name: "ETHTransferFailed",
        type: "error",
    },
    {
        inputs: [],
        name: "FailedInnerCall",
        type: "error",
    },
    {
        inputs: [],
        name: "FeeTooHigh",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "provided",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "minimum",
                type: "uint256",
            },
        ],
        name: "InsufficientInputAmount",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "received",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "minimum",
                type: "uint256",
            },
        ],
        name: "InsufficientOutputAmount",
        type: "error",
    },
    {
        inputs: [],
        name: "NotGovernance",
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
        name: "TokenNotApproved",
        type: "error",
    },
    {
        inputs: [],
        name: "ZeroAddress",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "oldRecipient",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newRecipient",
                type: "address",
            },
        ],
        name: "FeeRecipientChanged",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "newGovernance",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "oldGovernance",
                type: "address",
            },
        ],
        name: "GovernanceChanged",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "newLpRouter",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "oldLpRouter",
                type: "address",
            },
        ],
        name: "LpRouterChanged",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "newStableCoin",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "oldStableCoin",
                type: "address",
            },
        ],
        name: "StableCoinChanged",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "newSwapRouter",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "oldSwapRouter",
                type: "address",
            },
        ],
        name: "SwapRouterChanged",
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
                internalType: "address",
                name: "vault",
                type: "address",
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
                name: "shares",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "fee",
                type: "uint256",
            },
        ],
        name: "ZapIn",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint16",
                name: "oldFee",
                type: "uint16",
            },
            {
                indexed: false,
                internalType: "uint16",
                name: "newFee",
                type: "uint16",
            },
        ],
        name: "ZapInFeeChanged",
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
                internalType: "address",
                name: "vault",
                type: "address",
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
                name: "shares",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "fee",
                type: "uint256",
            },
        ],
        name: "ZapOut",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint16",
                name: "oldFee",
                type: "uint16",
            },
            {
                indexed: false,
                internalType: "uint16",
                name: "newFee",
                type: "uint16",
            },
        ],
        name: "ZapOutFeeChanged",
        type: "event",
    },
    {
        inputs: [],
        name: "MAX_FEE",
        outputs: [
            {
                internalType: "uint16",
                name: "",
                type: "uint16",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "MAX_FEE_BPS",
        outputs: [
            {
                internalType: "uint16",
                name: "",
                type: "uint16",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "MINIMUM_AMOUNT",
        outputs: [
            {
                internalType: "uint16",
                name: "",
                type: "uint16",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "feeRecipient",
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
        inputs: [],
        name: "indexUtils",
        outputs: [
            {
                internalType: "contract IIndexUtils",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "lpRouter",
        outputs: [
            {
                internalType: "contract ILpRouter",
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
                name: "newRecipient",
                type: "address",
            },
        ],
        name: "setFeeRecipient",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "governanceAddress",
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
                name: "routerAddress",
                type: "address",
            },
        ],
        name: "setLpRouter",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "stablecoinAddress",
                type: "address",
            },
        ],
        name: "setStableCoin",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "routerAddress",
                type: "address",
            },
        ],
        name: "setSwapRouter",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint16",
                name: "newFee",
                type: "uint16",
            },
        ],
        name: "setZapInFee",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint16",
                name: "newFee",
                type: "uint16",
            },
        ],
        name: "setZapOutFee",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "stablecoin",
        outputs: [
            {
                internalType: "contract IERC20",
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
                name: "asset",
                type: "address",
            },
            {
                internalType: "address",
                name: "tokenOut",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "assetsInAmount",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "recipient",
                type: "address",
            },
        ],
        name: "swapFromAssets",
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
                internalType: "address",
                name: "asset",
                type: "address",
            },
            {
                internalType: "address",
                name: "tokenOut",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "assetsInAmount",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "recipient",
                type: "address",
            },
        ],
        name: "swapFromAssetsWithBond",
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
        inputs: [],
        name: "swapRouter",
        outputs: [
            {
                internalType: "contract ISwapRouter",
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
                name: "asset",
                type: "address",
            },
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
                internalType: "address",
                name: "recipient",
                type: "address",
            },
        ],
        name: "swapToAssets",
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
                internalType: "address",
                name: "asset",
                type: "address",
            },
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
                internalType: "address",
                name: "recipient",
                type: "address",
            },
        ],
        name: "swapToAssetsWithBond",
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
        inputs: [],
        name: "wrappedNative",
        outputs: [
            {
                internalType: "contract IWETH",
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
                internalType: "contract IVault",
                name: "vault",
                type: "address",
            },
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
        inputs: [],
        name: "zapInFee",
        outputs: [
            {
                internalType: "uint16",
                name: "",
                type: "uint16",
            },
        ],
        stateMutability: "view",
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
        name: "zapInWithBond",
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
                internalType: "contract IVault",
                name: "vault",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "sharesAmount",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "tokenOut",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "minTokenOutAmount",
                type: "uint256",
            },
        ],
        name: "zapOut",
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
        inputs: [],
        name: "zapOutFee",
        outputs: [
            {
                internalType: "uint16",
                name: "",
                type: "uint16",
            },
        ],
        stateMutability: "view",
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
                name: "sharesAmount",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "tokenOut",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "minTokenOutAmount",
                type: "uint256",
            },
        ],
        name: "zapOutWithBond",
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

export default zapperAbi;
