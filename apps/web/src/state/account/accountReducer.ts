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
} from "src/api/account";
import { addressesByChainId } from "src/config/constants/contracts";
import { pointsStakingAndClaimAbi } from "../../assets/abis/pointsStakingAndClaim";
import { Address, getContract, encodeFunctionData } from "viem";
import { CHAIN_ID } from "src/types/enums";
import { awaitTransaction } from "src/utils/common";
import { IClients } from "src/types";

const initialState: StateInterface = {
    estimatedTraxPerDay: [],
    refCodeLoaded: false,
    error: null,
    airdrop: {
        isClaimed: false,
        isInitialLoading: true,
        claimData: null,
        stakeInfo: 0n,
        pendingRewards: 0n,
        isLoading: false,
        isWithdrawLoading: false,
        isClaimRewardsLoading: false,
        isStakeLoading: false,
    },
};

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
                stakeInfo: amount[0],
                pendingRewards,
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
                    stakeInfo: 0n,
                    pendingRewards: 0n,
                    isLoading: false,
                    isWithdrawLoading: false,
                    isClaimRewardsLoading: false,
                    isStakeLoading: false,
                };
            }
            state.airdrop[field] = value;
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
                    stakeInfo: 0n,
                    pendingRewards: 0n,
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
    },
});

export const { updateAccountField, updateAirdropField, reset } = accountSlice.actions;

export default accountSlice.reducer;

