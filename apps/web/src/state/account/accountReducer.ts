import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { StateInterface } from "./types";
import {
    postAccountData as postAccountDataApi,
    getAccountData as getAccountDataApi,
    getReferalEarning as getReferalEarningApi,
    setAccountConnector as setAccountConnectorApi,
    disableZapWarning as disableZapWarningApi,
    updatePointsEarning,
    sendBtxForXFollow,
    agreeTermsOfUse as agreeTermsOfUseApi,
    getAirdropClaim,
    getAdditionalAirdropClaim,
} from "src/api/account";
import { addressesByChainId } from "src/config/constants/contracts";
import { pointsStakingAndClaimAbi } from "../../assets/abis/pointsStakingAndClaim";
import { additionalAirdropClaimAbi } from "../../assets/abis/additionalAirdropClaim";
import { Address, getContract, encodeFunctionData } from "viem";
import { CHAIN_ID } from "src/types/enums";
import { awaitTransaction } from "src/utils/common";
import { IClients } from "src/types";

// #region Initial State
const initialState: StateInterface = {
    estimatedTraxPerDay: [],
    refCodeLoaded: false,
    error: null,
    airdrop: {
        isClaimed: false,
        isInitialLoading: true,
        claimData: null,
        stakeInfo: "0",
        pendingRewards: "0",
        isLoading: false,
        isWithdrawLoading: false,
        isClaimRewardsLoading: false,
        isStakeLoading: false,
    },
    additionalAirdrop: {
        isClaimed: false,
        isInitialLoading: true,
        claimData: null,
        stakeInfo: "0",
        pendingRewards: "0",
        isLoading: false,
        isWithdrawLoading: false,
        isClaimRewardsLoading: false,
        isStakeLoading: false,
        //[mainnet, testnet, steddy teddy, social]
        //first for mainnet points, 2nd for testnet, 3rd for social user points, 4th for teddy nft points
    },
};
// #endregion

// #region Account Async Actions
const getAccountData = createAsyncThunk(
    "account/getAccountData",
    async ({ address, referralCodeFromUrl }: { address: string; referralCodeFromUrl: string }, thunkApi) => {
        try {
            if (!address) {
                thunkApi.dispatch(reset());
                return;
            }
            const accountData = await getAccountDataApi(address);
            if (!accountData) {
                thunkApi.dispatch(reset());
                return;
            }
            // @ts-ignore
            thunkApi.dispatch(updateAccountField({ field: "referrerCode", value: referralCodeFromUrl || "" }));
            if (accountData.referralCode) {
                thunkApi.dispatch(updateAccountField({ field: "referralCode", value: accountData.referralCode }));
            }
            if (accountData.referrer) {
                thunkApi.dispatch(
                    updateAccountField({ field: "referrerAddress", value: accountData.referrer.address })
                );
            }
        } catch (error) {
            console.error("Error in getAccountData", error);
            return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to fetch account data");
        }
    }
);

export const addAccount = createAsyncThunk(
    "account/addAccount",
    async (
        {
            address,
            referrerCode,
            referralCodeFromUrl,
        }: { address?: string; referrerCode?: string; referralCodeFromUrl?: string },
        thunkApi
    ) => {
        try {
            if (!address) {
                thunkApi.dispatch(reset());
                return;
            }
            // Get current account data
            const existingAccountData = await getAccountDataApi(address);

            // if account is not exist, create new account
            if (!existingAccountData) {
                // Create
                const newAccountResponse = await postAccountDataApi(address, referrerCode);

                // Save
                if (newAccountResponse?.address) {
                    thunkApi.dispatch(
                        getAccountData({
                            address: newAccountResponse.address,
                            referralCodeFromUrl: referralCodeFromUrl!,
                        })
                    );
                    // remove code of person whose link used to come on site
                }
            } else {
                // remove code of person whose link used to come on site
                // @ts-ignore
                thunkApi.dispatch(
                    updateAccountField({ field: "estimatedTraxPerDay", value: existingAccountData.estimatedTraxPerDay })
                );
                thunkApi.dispatch(updateAccountField({ field: "referrerCode", value: referrerCode || "" }));
                if (existingAccountData.referrer) {
                    thunkApi.dispatch(
                        updateAccountField({ field: "referrerAddress", value: existingAccountData.referrer.address })
                    );
                }
                if (existingAccountData.xFollower) {
                    thunkApi.dispatch(updateAccountField({ field: "xFollower", value: existingAccountData.xFollower }));
                }
                thunkApi.dispatch(
                    updateAccountField({
                        field: "earnTraxTermsAgreed",
                        value: existingAccountData.earnTraxTermsAgreed || false,
                    })
                );
                thunkApi.dispatch(
                    updateAccountField({ field: "referralCode", value: existingAccountData.referralCode || "" })
                );
                thunkApi.dispatch(
                    updateAccountField({ field: "earnedTrax", value: existingAccountData.earnedTrax || 0 })
                );
                thunkApi.dispatch(
                    updateAccountField({
                        field: "earnedTraxByReferral",
                        value: existingAccountData.earnedTraxByReferral || 0,
                    })
                );
                thunkApi.dispatch(
                    updateAccountField({ field: "totalEarnedTrax", value: existingAccountData.totalEarnedTrax || 0 })
                );
                thunkApi.dispatch(
                    updateAccountField({ field: "earnedArb", value: existingAccountData.earnedArb || 0 })
                );
                thunkApi.dispatch(
                    updateAccountField({ field: "emmitedArb", value: existingAccountData.emmitedArb || 0 })
                );
                thunkApi.dispatch(
                    updateAccountField({
                        field: "totalEarnedTraxByReferral",
                        value: existingAccountData.totalEarnedTraxByReferral || 0,
                    })
                );
                thunkApi.dispatch(
                    updateAccountField({
                        field: "traxCalculatedTimestamp",
                        value: existingAccountData.traxCalculatedTimestamp || 0,
                    })
                );
                thunkApi.dispatch(updateAccountField({ field: "boosts", value: existingAccountData.boosts || [] }));
                thunkApi.dispatch(
                    updateAccountField({ field: "referralCount", value: existingAccountData.referralCount || 0 })
                );
                thunkApi.dispatch(
                    updateAccountField({ field: "connector", value: existingAccountData.connector || "" })
                );
                thunkApi.dispatch(
                    updateAccountField({
                        field: "termsOfUseAgreed",
                        value: existingAccountData.termsOfUseAgreed || false,
                    })
                );
                thunkApi.dispatch(
                    updateAccountField({
                        field: "disableZapWarning",
                        value: existingAccountData.disableZapWarning || false,
                    })
                );
            }
        } catch (error) {
            console.error("Cannot create new account", error);
            return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to create new account");
        }
    }
);

export const setAccountConnector = createAsyncThunk(
    "account/setAccountConnector",
    async ({ address, connector }: { address: string; connector: string }, thunkApi) => {
        try {
            await setAccountConnectorApi(address, connector);
            thunkApi.dispatch(updateAccountField({ field: "connector", value: connector }));
        } catch (error) {
            console.error("Error in setAccountConnector", error);
            return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to set account connector");
        }
    }
);

export const sendBtxToXFollower = createAsyncThunk(
    "account/sendBtxToXFollower",
    async ({ address }: { address: string }, thunkApi) => {
        try {
            await sendBtxForXFollow(address);
            thunkApi.dispatch(updateAccountField({ field: "xFollower", value: true }));

            const existingAccountData = await getAccountDataApi(address);
            if (existingAccountData) {
                thunkApi.dispatch(updateAccountField({ field: "earnedTrax", value: existingAccountData.earnedTrax }));
            }
        } catch (error) {
            console.error("Error in sendBtxToXFollower", error);
            return thunkApi.rejectWithValue(
                error instanceof Error ? error.message : "Failed to send btx to x follower"
            );
        }
    }
);

export const getReferralEarning = createAsyncThunk("account/getReferralEarning", async (address: string, thunkApi) => {
    try {
        const referralEarningInUSD = await getReferalEarningApi(address);
        return referralEarningInUSD;
    } catch (error) {
        console.error("Error in getReferralEarning", error);
        return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to fetch referral earning");
    }
});

export const updatePoints = createAsyncThunk("account/updatePoints", async (address: string, thunkApi) => {
    try {
        await updatePointsEarning(address);
        thunkApi.dispatch(addAccount({ address }));
    } catch (error) {
        console.error("Error in updatePoints", error);
        return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to update points");
    }
});

export const agreeTermsOfUse = createAsyncThunk("account/agreeTermsOfUse", async (address: string, thunkApi) => {
    try {
        await agreeTermsOfUseApi(address);
        thunkApi.dispatch(updateAccountField({ field: "termsOfUseAgreed", value: true }));
    } catch (error) {
        console.error("Error in agreeTermsOfUse", error);
        return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to agree terms of use");
    }
});

export const disableZapWarning = createAsyncThunk(
    "account/disableZapWarning",
    async ({ address, value }: { address: string; value: boolean }, thunkApi) => {
        try {
            await disableZapWarningApi(address, value);
            thunkApi.dispatch(updateAccountField({ field: "disableZapWarning", value }));
        } catch (error) {
            console.error("Error in disableZapWarning", error);
            return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to disable zap warning");
        }
    }
);
// #endregion
// #region Airdrop
export const fetchAirdropData = createAsyncThunk(
    "account/fetchAirdropData",
    async (
        { address, getClients }: { address: string; getClients: (chainId: number) => Promise<IClients> },
        thunkApi
    ) => {
        try {
            const airdropAddress = addressesByChainId[CHAIN_ID.BERACHAIN].airdropAddress;
            if (!airdropAddress || !address) return;

            // Get airdrop claim data
            const airdropClaimResponse = await getAirdropClaim(address);
            const airdropClaimData = airdropClaimResponse.data;

            // Get contract data
            const clients = await getClients(CHAIN_ID.BERACHAIN);
            const contract = getContract({
                address: airdropAddress,
                abi: pointsStakingAndClaimAbi,
                client: clients.public,
            });

            const [amount, pendingRewards, claimed] = await Promise.all([
                contract.read.stakes([address as Address]),
                contract.read.pendingRewards([address as Address]),
                contract.read.isClaimed([address as Address]),
            ]);

            return {
                claimData: airdropClaimData,
                stakeInfo: amount[0].toString(),
                pendingRewards: pendingRewards.toString(),
                isClaimed: claimed,
            };
        } catch (error) {
            console.error("Error in fetchAirdropData", error);
            return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to fetch airdrop data");
        }
    }
);

export const claimAirdrop = createAsyncThunk(
    "account/claimAirdrop",
    async ({ claim, getClients }: { claim: boolean; getClients: (chainId: number) => Promise<IClients> }, thunkApi) => {
        try {
            const state = thunkApi.getState() as { account: StateInterface };
            const airdropClaimData = state.account.airdrop?.claimData;

            if (!airdropClaimData) throw new Error("Airdrop claim not found");

            const airdropAddress = addressesByChainId[CHAIN_ID.BERACHAIN].airdropAddress;
            const clients = await getClients(CHAIN_ID.BERACHAIN);

            const response = await awaitTransaction(
                clients.wallet.sendTransaction({
                    to: airdropAddress,
                    data: encodeFunctionData({
                        abi: pointsStakingAndClaimAbi,
                        functionName: "claimAirdrop",
                        args: [BigInt(airdropClaimData.amount), airdropClaimData.signature, claim],
                    }),
                }),
                clients
            );

            if (!response.status) {
                throw new Error(response.error || "Failed to claim airdrop");
            }

            // Fetch updated data after successful claim/stake
            await thunkApi.dispatch(fetchAirdropData({ address: clients.wallet.account.address, getClients }));

            return { response, claim };
        } catch (error) {
            console.error("Error in claimAirdrop", error);
            return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to claim airdrop");
        }
    }
);

export const withdrawAirdrop = createAsyncThunk(
    "account/withdrawAirdrop",
    async (
        { amount, getClients }: { amount: bigint; getClients: (chainId: number) => Promise<IClients> },
        thunkApi
    ) => {
        try {
            const airdropAddress = addressesByChainId[CHAIN_ID.BERACHAIN].airdropAddress;
            const clients = await getClients(CHAIN_ID.BERACHAIN);

            const response = await awaitTransaction(
                clients.wallet.sendTransaction({
                    to: airdropAddress,
                    data: encodeFunctionData({
                        abi: pointsStakingAndClaimAbi,
                        functionName: "withdraw",
                        args: [amount],
                    }),
                }),
                clients
            );

            if (!response.status) {
                throw new Error(response.error || "Failed to withdraw stake");
            }

            return response;
        } catch (error) {
            console.error("Error in withdrawAirdrop", error);
            return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to withdraw stake");
        }
    }
);

export const claimAirdropRewards = createAsyncThunk(
    "account/claimAirdropRewards",
    async ({ getClients }: { getClients: (chainId: number) => Promise<IClients> }, thunkApi) => {
        try {
            const airdropAddress = addressesByChainId[CHAIN_ID.BERACHAIN].airdropAddress;
            const clients = await getClients(CHAIN_ID.BERACHAIN);

            const response = await awaitTransaction(
                clients.wallet.sendTransaction({
                    to: airdropAddress,
                    data: encodeFunctionData({
                        abi: pointsStakingAndClaimAbi,
                        functionName: "claimRewards",
                        args: [],
                    }),
                }),
                clients
            );

            if (!response.status) {
                throw new Error(response.error || "Failed to claim rewards");
            }

            return response;
        } catch (error) {
            console.error("Error in claimAirdropRewards", error);
            return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to claim rewards");
        }
    }
);
// #endregion

// #region Additional Airdrop
export const fetchAdditionalAirdropData = createAsyncThunk(
    "account/fetchAdditionalAirdropData",
    async (
        { address, getClients }: { address: Address; getClients: (chainId: number) => Promise<IClients> },
        thunkApi
    ) => {
        try {
            const airdropAddress = addressesByChainId[CHAIN_ID.BERACHAIN].additionalAirdropAddress;
            if (!airdropAddress || !address) return;

            // Get airdrop claim data
            const airdropClaimResponse = await getAdditionalAirdropClaim(address);
            const airdropClaimsData = airdropClaimResponse.data;

            // Get contract data
            const clients = await getClients(CHAIN_ID.BERACHAIN);
            const contract = getContract({
                address: airdropAddress,
                abi: additionalAirdropClaimAbi,
                client: clients.public,
            });

            // If airdropClaimsData is an array, check each nonce
            let unclaimedClaim = null;
            if (Array.isArray(airdropClaimsData)) {
                for (let i = 0; i < airdropClaimsData.length; i++) {
                    const claim = airdropClaimsData[i];
                    // Assume claim.nonce exists, otherwise use i as nonce
                    const nonce = claim.nonce !== undefined ? BigInt(claim.nonce) : BigInt(i);
                    const claimed = await contract.read.isClaimed([address, nonce]);
                    if (!claimed) {
                        unclaimedClaim = { ...claim, nonce: Number(nonce) };
                        break;
                    }
                }
            }

            // Get contract info for UI (stake, pendingRewards)
            const [amount, pendingRewards] = await Promise.all([
                contract.read.stakes([address]),
                contract.read.pendingRewards([address]),
            ]);

            return {
                claimData: unclaimedClaim,
                stakeInfo: amount[0].toString(),
                pendingRewards: pendingRewards.toString(),
                isClaimed: !unclaimedClaim,
            };
        } catch (error) {
            console.error("Error in fetchAdditionalAirdropData", error);
            return thunkApi.rejectWithValue(
                error instanceof Error ? error.message : "Failed to fetch additional airdrop data"
            );
        }
    }
);

export const claimAdditionalAirdrop = createAsyncThunk(
    "account/claimAdditionalAirdrop",
    async (
        {
            claim,
            nonce,
            getClients,
        }: { nonce: number; claim: boolean; getClients: (chainId: number) => Promise<IClients> },
        thunkApi
    ) => {
        try {
            const state = thunkApi.getState() as { account: StateInterface };
            const additionalAirdropClaimData = state.account.additionalAirdrop?.claimData;

            if (!additionalAirdropClaimData) throw new Error("Additional airdrop claim not found");

            const airdropAddress = addressesByChainId[CHAIN_ID.BERACHAIN].additionalAirdropAddress;
            const clients = await getClients(CHAIN_ID.BERACHAIN);

            const transactionParams = [
                BigInt(additionalAirdropClaimData.amount),
                BigInt(nonce),
                additionalAirdropClaimData.signature,
                claim,
            ] as const;

            const response = await awaitTransaction(
                clients.wallet.sendTransaction({
                    to: airdropAddress,
                    data: encodeFunctionData({
                        abi: additionalAirdropClaimAbi,
                        functionName: "claimAirdrop",
                        args: transactionParams,
                    }),
                }),
                clients
            );

            if (!response.status) {
                throw new Error(response.error || "Failed to claim additional airdrop");
            }
            // Fetch updated data after successful claim/stake
            await thunkApi.dispatch(
                fetchAdditionalAirdropData({ address: clients.wallet.account.address, getClients })
            );

            return { response, claim };
        } catch (error) {
            console.error("Error in claimAdditionalAirdrop", error);
            return thunkApi.rejectWithValue(
                error instanceof Error ? error.message : "Failed to claim additional airdrop"
            );
        }
    }
);

export const withdrawAdditionalAirdrop = createAsyncThunk(
    "account/withdrawAdditionalAirdrop",
    async (
        { amount, getClients }: { amount: bigint; getClients: (chainId: number) => Promise<IClients> },
        thunkApi
    ) => {
        try {
            const airdropAddress = addressesByChainId[CHAIN_ID.BERACHAIN].additionalAirdropAddress;
            const clients = await getClients(CHAIN_ID.BERACHAIN);

            const response = await awaitTransaction(
                clients.wallet.sendTransaction({
                    to: airdropAddress,
                    data: encodeFunctionData({
                        abi: additionalAirdropClaimAbi,
                        functionName: "withdraw",
                        args: [amount],
                    }),
                }),
                clients
            );

            if (!response.status) {
                throw new Error(response.error || "Failed to withdraw additional airdrop stake");
            }

            // Fetch updated data after successful withdraw
            await thunkApi.dispatch(
                fetchAdditionalAirdropData({ address: clients.wallet.account.address, getClients })
            );

            return response;
        } catch (error) {
            console.error("Error in withdrawAdditionalAirdrop", error);
            return thunkApi.rejectWithValue(
                error instanceof Error ? error.message : "Failed to withdraw additional airdrop stake"
            );
        }
    }
);

export const claimAdditionalAirdropRewards = createAsyncThunk(
    "account/claimAdditionalAirdropRewards",
    async ({ getClients }: { getClients: (chainId: number) => Promise<IClients> }, thunkApi) => {
        try {
            const airdropAddress = addressesByChainId[CHAIN_ID.BERACHAIN].additionalAirdropAddress;
            const clients = await getClients(CHAIN_ID.BERACHAIN);

            const response = await awaitTransaction(
                clients.wallet.sendTransaction({
                    to: airdropAddress,
                    data: encodeFunctionData({
                        abi: additionalAirdropClaimAbi,
                        functionName: "claimRewards",
                        args: [],
                    }),
                }),
                clients
            );

            if (!response.status) {
                throw new Error(response.error || "Failed to claim additional airdrop rewards");
            }

            // Fetch updated data after successful rewards claim
            await thunkApi.dispatch(
                fetchAdditionalAirdropData({ address: clients.wallet.account.address, getClients })
            );

            return response;
        } catch (error) {
            console.error("Error in claimAdditionalAirdropRewards", error);
            return thunkApi.rejectWithValue(
                error instanceof Error ? error.message : "Failed to claim additional airdrop rewards"
            );
        }
    }
);
// #endregion

const accountSlice = createSlice({
    name: "account",
    initialState: initialState,
    reducers: {
        updateAccountField: <T extends keyof StateInterface>(
            state: StateInterface,
            action: { payload: { field: T; value: StateInterface[T] } }
        ) => {
            const { field, value } = action.payload;
            state[field] = value;
        },
        updateAirdropField: <T extends keyof NonNullable<StateInterface["airdrop"]>>(
            state: StateInterface,
            action: { payload: { field: T; value: NonNullable<StateInterface["airdrop"]>[T] } }
        ) => {
            const { field, value } = action.payload;
            if (!state.airdrop) {
                state.airdrop = {
                    isClaimed: false,
                    isInitialLoading: true,
                    claimData: null,
                    stakeInfo: "0",
                    pendingRewards: "0",
                    isLoading: false,
                    isWithdrawLoading: false,
                    isClaimRewardsLoading: false,
                    isStakeLoading: false,
                };
            }
            state.airdrop[field] = value;
        },
        updateAdditionalAirdropField: <T extends keyof NonNullable<StateInterface["additionalAirdrop"]>>(
            state: StateInterface,
            action: { payload: { field: T; value: NonNullable<StateInterface["additionalAirdrop"]>[T] } }
        ) => {
            const { field, value } = action.payload;
            if (!state.additionalAirdrop) {
                state.additionalAirdrop = {
                    isClaimed: false,
                    isInitialLoading: true,
                    claimData: null,
                    stakeInfo: "0",
                    pendingRewards: "0",
                    isLoading: false,
                    isWithdrawLoading: false,
                    isClaimRewardsLoading: false,
                    isStakeLoading: false,
                };
            }
            state.additionalAirdrop[field] = value;
        },
        reset: (state: StateInterface) => {
            return { ...initialState, referrerCode: state.referrerCode, refCodeLoaded: state.refCodeLoaded };
        },
    },
    extraReducers(builder) {
        builder.addCase(getReferralEarning.fulfilled, (state, action) => {
            state.referralEarning = action.payload;
        });
        builder.addCase(getAccountData.rejected, (state, action) => {
            state.error = action.payload as string;
        });
        builder.addCase(addAccount.rejected, (state, action) => {
            state.error = action.payload as string;
        });
        builder.addCase(setAccountConnector.rejected, (state, action) => {
            state.error = action.payload as string;
        });
        builder.addCase(updatePoints.rejected, (state, action) => {
            state.error = action.payload as string;
        });
        builder.addCase(getReferralEarning.rejected, (state, action) => {
            state.error = action.payload as string;
        });
        builder.addCase(disableZapWarning.rejected, (state, action) => {
            state.error = action.payload as string;
        });

        builder.addCase(fetchAirdropData.pending, (state) => {
            if (!state.airdrop) {
                state.airdrop = {
                    isClaimed: false,
                    isInitialLoading: true,
                    claimData: null,
                    stakeInfo: "0",
                    pendingRewards: "0",
                    isLoading: false,
                    isWithdrawLoading: false,
                    isClaimRewardsLoading: false,
                    isStakeLoading: false,
                };
            }
            state.airdrop.isInitialLoading = true;
        });
        builder.addCase(fetchAirdropData.fulfilled, (state, action) => {
            if (action.payload && state.airdrop) {
                state.airdrop.claimData = action.payload.claimData;
                state.airdrop.stakeInfo = action.payload.stakeInfo;
                state.airdrop.pendingRewards = action.payload.pendingRewards;
                state.airdrop.isClaimed = action.payload.isClaimed;
                state.airdrop.isInitialLoading = false;
            }
        });
        builder.addCase(fetchAirdropData.rejected, (state, action) => {
            state.error = action.payload as string;
            if (state.airdrop) {
                state.airdrop.isInitialLoading = false;
            }
        });

        builder.addCase(claimAirdrop.pending, (state, action) => {
            if (state.airdrop) {
                const { claim } = action.meta.arg;
                if (claim) {
                    state.airdrop.isLoading = true;
                } else {
                    state.airdrop.isStakeLoading = true;
                }
            }
        });
        builder.addCase(claimAirdrop.fulfilled, (state, action) => {
            if (state.airdrop) {
                const claim = action.payload?.claim;
                if (claim) {
                    state.airdrop.isLoading = false;
                } else {
                    state.airdrop.isStakeLoading = false;
                }
            }
        });
        builder.addCase(claimAirdrop.rejected, (state, action) => {
            state.error = action.payload as string;
            if (state.airdrop) {
                // Reset both loading states on error to be safe
                state.airdrop.isLoading = false;
                state.airdrop.isStakeLoading = false;
            }
        });

        builder.addCase(withdrawAirdrop.pending, (state) => {
            if (state.airdrop) {
                state.airdrop.isWithdrawLoading = true;
            }
        });
        builder.addCase(withdrawAirdrop.fulfilled, (state) => {
            if (state.airdrop) {
                state.airdrop.isWithdrawLoading = false;
            }
        });
        builder.addCase(withdrawAirdrop.rejected, (state, action) => {
            state.error = action.payload as string;
            if (state.airdrop) {
                state.airdrop.isWithdrawLoading = false;
            }
        });

        builder.addCase(claimAirdropRewards.pending, (state) => {
            if (state.airdrop) {
                state.airdrop.isClaimRewardsLoading = true;
            }
        });
        builder.addCase(claimAirdropRewards.fulfilled, (state) => {
            if (state.airdrop) {
                state.airdrop.isClaimRewardsLoading = false;
            }
        });
        builder.addCase(claimAirdropRewards.rejected, (state, action) => {
            state.error = action.payload as string;
            if (state.airdrop) {
                state.airdrop.isClaimRewardsLoading = false;
            }
        });

        // Additional Airdrop reducers
        builder.addCase(fetchAdditionalAirdropData.pending, (state) => {
            if (!state.additionalAirdrop) {
                state.additionalAirdrop = {
                    isClaimed: false,
                    isInitialLoading: true,
                    claimData: null,
                    stakeInfo: "0",
                    pendingRewards: "0",
                    isLoading: false,
                    isWithdrawLoading: false,
                    isClaimRewardsLoading: false,
                    isStakeLoading: false,
                };
            }
            state.additionalAirdrop.isInitialLoading = true;
        });
        builder.addCase(fetchAdditionalAirdropData.fulfilled, (state, action) => {
            if (action.payload && state.additionalAirdrop) {
                state.additionalAirdrop.claimData = action.payload.claimData;
                state.additionalAirdrop.stakeInfo = action.payload.stakeInfo;
                state.additionalAirdrop.pendingRewards = action.payload.pendingRewards;
                state.additionalAirdrop.isClaimed = action.payload.isClaimed;
                state.additionalAirdrop.isInitialLoading = false;
            }
        });
        builder.addCase(fetchAdditionalAirdropData.rejected, (state, action) => {
            state.error = action.payload as string;
            if (state.additionalAirdrop) {
                state.additionalAirdrop.isInitialLoading = false;
            }
        });

        builder.addCase(claimAdditionalAirdrop.pending, (state, action) => {
            if (state.additionalAirdrop) {
                const { claim } = action.meta.arg;
                if (claim) {
                    state.additionalAirdrop.isLoading = true;
                } else {
                    state.additionalAirdrop.isStakeLoading = true;
                }
            }
        });
        builder.addCase(claimAdditionalAirdrop.fulfilled, (state, action) => {
            if (state.additionalAirdrop) {
                const claim = action.payload?.claim;
                if (claim) {
                    state.additionalAirdrop.isLoading = false;
                } else {
                    state.additionalAirdrop.isStakeLoading = false;
                }
            }
        });
        builder.addCase(claimAdditionalAirdrop.rejected, (state, action) => {
            state.error = action.payload as string;
            if (state.additionalAirdrop) {
                // Reset both loading states on error to be safe
                state.additionalAirdrop.isLoading = false;
                state.additionalAirdrop.isStakeLoading = false;
            }
        });

        builder.addCase(withdrawAdditionalAirdrop.pending, (state) => {
            if (state.additionalAirdrop) {
                state.additionalAirdrop.isWithdrawLoading = true;
            }
        });
        builder.addCase(withdrawAdditionalAirdrop.fulfilled, (state) => {
            if (state.additionalAirdrop) {
                state.additionalAirdrop.isWithdrawLoading = false;
            }
        });
        builder.addCase(withdrawAdditionalAirdrop.rejected, (state, action) => {
            state.error = action.payload as string;
            if (state.additionalAirdrop) {
                state.additionalAirdrop.isWithdrawLoading = false;
            }
        });

        builder.addCase(claimAdditionalAirdropRewards.pending, (state) => {
            if (state.additionalAirdrop) {
                state.additionalAirdrop.isClaimRewardsLoading = true;
            }
        });
        builder.addCase(claimAdditionalAirdropRewards.fulfilled, (state) => {
            if (state.additionalAirdrop) {
                state.additionalAirdrop.isClaimRewardsLoading = false;
            }
        });
        builder.addCase(claimAdditionalAirdropRewards.rejected, (state, action) => {
            state.error = action.payload as string;
            if (state.additionalAirdrop) {
                state.additionalAirdrop.isClaimRewardsLoading = false;
            }
        });
    },
});

export const { updateAccountField, updateAirdropField, updateAdditionalAirdropField, reset } = accountSlice.actions;

export default accountSlice.reducer;

