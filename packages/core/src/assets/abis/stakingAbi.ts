const stakingAbi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "_governance",
                type: "address",
            },
            {
                internalType: "address",
                name: "_rewardToken",
                type: "address",
            },
            {
                internalType: "address",
                name: "_BTXToken",
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
        name: "AlreadyVoted",
        type: "error",
    },
    {
        inputs: [],
        name: "AmountLessThanStakedAmountOrZero",
        type: "error",
    },
    {
        inputs: [],
        name: "EthTransferNotAllowed",
        type: "error",
    },
    {
        inputs: [],
        name: "FailedInnerCall",
        type: "error",
    },
    {
        inputs: [],
        name: "InputLengthMismatch",
        type: "error",
    },
    {
        inputs: [],
        name: "InsufficientBTXFunds",
        type: "error",
    },
    {
        inputs: [],
        name: "InsufficientFunds",
        type: "error",
    },
    {
        inputs: [],
        name: "InvalidAsset",
        type: "error",
    },
    {
        inputs: [],
        name: "InvalidProposal",
        type: "error",
    },
    {
        inputs: [],
        name: "NoPendingRewardsToClaim",
        type: "error",
    },
    {
        inputs: [],
        name: "NoStakeFound",
        type: "error",
    },
    {
        inputs: [],
        name: "NotBenevolent",
        type: "error",
    },
    {
        inputs: [],
        name: "NotGovernance",
        type: "error",
    },
    {
        inputs: [],
        name: "RewardDistributionPeriodHasExpired",
        type: "error",
    },
    {
        inputs: [],
        name: "RewardPerBlockIsNotSet",
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
        name: "SameRewardToken",
        type: "error",
    },
    {
        inputs: [],
        name: "ZeroAddress",
        type: "error",
    },
    {
        inputs: [],
        name: "ZeroInput",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "_newVersion",
                type: "address",
            },
            {
                indexed: false,
                internalType: "contract IERC20Metadata[]",
                name: "_tokens",
                type: "address[]",
            },
            {
                indexed: false,
                internalType: "uint256[]",
                name: "_amounts",
                type: "uint256[]",
            },
        ],
        name: "FundsMigrated",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "oldGovernance",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newGovernance",
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
                indexed: false,
                internalType: "uint256",
                name: "numberBlocksToDistributeRewards",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newRewardPerBlock",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "rewardToDistribute",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "rewardExpirationBlock",
                type: "uint256",
            },
        ],
        name: "NewRewardPeriod",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "numberBlocksToDistributeRewards",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "rewardExpirationBlock",
                type: "uint256",
            },
        ],
        name: "PeriodEndBlockUpdate",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "oldRewardToken",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newRewardToken",
                type: "address",
            },
        ],
        name: "RewardTokenChanged",
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
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "pendingReward",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "enum IBTXStaking.TxType",
                name: "txType",
                type: "uint8",
            },
        ],
        name: "StakeOrUnstakeOrClaim",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "_proposalAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "_user",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "_epochId",
                type: "uint256",
            },
        ],
        name: "Vote",
        type: "event",
    },
    {
        inputs: [],
        name: "BTXToken",
        outputs: [
            {
                internalType: "contract IERC20Metadata",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "ONE",
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
        name: "accRewardPerBTX",
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
                name: "_user",
                type: "address",
            },
        ],
        name: "calculatePendingRewards",
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
        name: "claim",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "currentRewardPerBlock",
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
        name: "emergencyUnstake",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "epochId",
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
                internalType: "bool",
                name: "_all",
                type: "bool",
            },
        ],
        name: "getProposals",
        outputs: [
            {
                internalType: "address[]",
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
        name: "isProposal",
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
        name: "lastRewardBlock",
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
        name: "lastUpdateBlock",
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
        name: "lastUpdateRewardToken",
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
                name: "_newVersion",
                type: "address",
            },
            {
                internalType: "contract IERC20Metadata[]",
                name: "_tokens",
                type: "address[]",
            },
            {
                internalType: "uint256[]",
                name: "_amounts",
                type: "uint256[]",
            },
            {
                internalType: "bool",
                name: "_isBTXMigrate",
                type: "bool",
            },
        ],
        name: "migrateFunds",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "periodEndBlock",
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
                name: "",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        name: "proposalToVoteCount",
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
                name: "",
                type: "uint256",
            },
        ],
        name: "proposals",
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
        name: "rewardToken",
        outputs: [
            {
                internalType: "contract IERC20Metadata",
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
                name: "_newGovernance",
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
                name: "_to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256",
            },
        ],
        name: "stake",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "totalBTXStaked",
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
                name: "_amount",
                type: "uint256",
            },
        ],
        name: "unstake",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address[]",
                name: "_proposals",
                type: "address[]",
            },
            {
                internalType: "bool[]",
                name: "status",
                type: "bool[]",
            },
        ],
        name: "updateProposals",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_expireDurationInBlocks",
                type: "uint256",
            },
        ],
        name: "updateRewardEndBlock",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_newRewardToken",
                type: "address",
            },
        ],
        name: "updateRewardToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_reward",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_rewardDurationInBlocks",
                type: "uint256",
            },
        ],
        name: "updateRewards",
        outputs: [],
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
        name: "userInfo",
        outputs: [
            {
                internalType: "uint256",
                name: "lastUpdateRewardToken",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "rewardDebt",
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
                name: "",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        name: "userVote",
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
                name: "_proposalAddress",
                type: "address",
            },
        ],
        name: "vote",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        stateMutability: "payable",
        type: "receive",
    },
];

export default stakingAbi;
