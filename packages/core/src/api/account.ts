import { AccountResponse } from "../state/account/types";
import { backendApi } from ".";
import { Address } from "viem";

export const postAccountData = async (address: string, referrerCode?: string) => {
	const res = await backendApi.post<{ data: AccountResponse | null }>("account", {
		address,
		referrer: referrerCode,
	});
	return res.data.data;
};

export const getAccountData = async (address: string) => {
	try {
		const {
			data: { data },
		} = await backendApi.get<{ data: AccountResponse | null }>("account/" + address);
		if (data?.address) return data;
		else return undefined;
	} catch (error) {
		console.error("Error fetching account data", error);
		return undefined;
	}
};

export const setAccountConnector = async (address: string, connector: string) => {
	const {
		data: { data },
	} = await backendApi.post<{ data: AccountResponse | null }>("account/set-connector", {
		address,
		connector,
	});
	return data;
};

export const sendBtxForXFollow = async (address: string) => {
	const {
		data: { data },
	} = await backendApi.post<{ data: AccountResponse | null }>("account/send-btx-for-x-follow", {
		address,
	});
	return data;
};

export const claimBtx = async (address: string) => {
	const {
		data: { data },
	} = await backendApi.post<{ data: AccountResponse | null }>("account/claim-btx", {
		address,
	});
};

export const checkClaimBtx = async (address: string) => {
	const {
		data: { data },
	} = await backendApi.get<{ data: { hasClaimed: boolean } }>("account/check-btx-claim/" + address);
	return data;
};

/**
 * Get referral earning of an account in USD
 */
export const getReferalEarning = async (address: string) => {
	const {
		data: {
			data: { amountInUSD },
		},
	} = await backendApi.get<{ data: { amountInUSD: number } }>("account/referral-earning/" + address);
	return amountInUSD;
};

export const updatePointsEarning = async (address: string) => {
	const {
		data: { data: status },
	} = await backendApi.post<{ data: { status: boolean } }>("account/update-points/" + address);
	return status;
};

export const agreeTermsOfUse = async (address: string) => {
	const {
		data: { data: status },
	} = await backendApi.post<{ data: { status: boolean } }>("account/agree-terms-of-use/" + address);
	return status;
};

export const disableZapWarning = async (address: string, value: boolean) => {
	const {
		data: { data: status },
	} = await backendApi.post<{ data: { status: boolean } }>("account/disable-zap-warning/" + address, {
		value,
	});
	return status;
};

export const getAirdropClaim = async (address: string) => {
	const response = await backendApi.get<{
		status: boolean;
		data: { account: Address; signature: Address; amount: string };
	}>("account/airdrop-claim/" + address);
	return response.data;
};

export const getAdditionalAirdropClaim = async (address: string) => {
	const response = await backendApi.get<{
		status: boolean;
		data: { account: Address; signature: Address; amount: string; sources: boolean[]; nonce: number }[];
	}>("account/airdrop-claim-additional/" + address);
	return response.data;
};

/**
 * Delete user account - marks account for deletion with 5-day grace period
 */
export const deleteAccount = async (address: string) => {
	try {
		const response = await backendApi.delete<{
			status: boolean;
			message: string;
			data: {
				markedForDeletion: boolean;
				deletionDate: string;
			};
		}>(`account/delete/${address}`);

		if (response.data.status) {
			return {
				success: true,
				data: response.data.data,
				message: response.data.message,
			};
		} else {
			throw new Error(response.data.message || "Account deletion failed");
		}
	} catch (error: any) {
		console.error("Error deleting account:", error);

		// Handle different error types
		if (error.response?.data?.error) {
			throw new Error(error.response.data.error);
		} else if (error.response?.status === 404) {
			throw new Error("Account not found");
		} else if (error.response?.status >= 500) {
			throw new Error("Server error occurred. Please try again later.");
		} else if (!navigator.onLine) {
			throw new Error("No internet connection. Please check your network and try again.");
		} else {
			throw new Error(error.message || "Failed to delete account. Please try again.");
		}
	}
};
