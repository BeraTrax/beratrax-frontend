import axios from "axios";
import { Address, Hex } from "viem";
import { BACKEND_BASE_URL } from "./../config/constants";

export const backendApi = axios.create({
	// baseURL: "http://localhost:8000/api/v1/",
	baseURL: BACKEND_BASE_URL,
});

export const isGasSponsored = async (addr: string): Promise<boolean> => {
	try {
		const res = await backendApi.get("/settings/should-sponsor?walletAddress=" + addr);
		return res.data.data.willSponsor;
	} catch (e) {
		console.log(e);
		return false;
	}
};

export const requestEthForGas = async (params: {
	from: Address;
	to: Address;
	chainId: number;
	data: Hex;
	value?: bigint;
	ethAmountForGas: bigint;
}): Promise<{ status: boolean; message: string; error?: string }> => {
	try {
		const res = await backendApi.post("/transaction/send-eth-for-sponsored-tx", {
			from: params.from,
			to: params.to,
			chainId: params.chainId,
			data: params.data,
			value: params.value?.toString(),
			ethAmountForGas: params.ethAmountForGas.toString(),
		});
		return { status: res.data.status, message: res.data.message };
	} catch (error) {
		console.log(error?.response?.data?.error);
		return { status: false, message: "", error: error?.response?.data?.error };
	}
};

export const traxApi = axios.create({
	baseURL: `${BACKEND_BASE_URL}account/terms/trax/`,
});
