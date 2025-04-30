import { backendApi } from ".";

interface ResponseDataType {
	data: { accounts: string[] };
	status: boolean;
}

export const fetchReferrals = async (currentWallet: string) => {
	return backendApi.get<ResponseDataType>(`account/reffered-accounts/${currentWallet}`);
};
