import { AccountResponse } from "src/state/account/types";
import { backendApi } from ".";

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
