import { WalletContext } from "@/config/walletProvider";
import { useContext } from "react";

const useWallet = () => {
    return useContext(WalletContext);
};

export default useWallet;
