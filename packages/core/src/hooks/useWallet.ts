import { useContext } from "react";
import { Platform } from "react-native";
import { WalletContext as webWalletContext } from "@beratrax/web/src/context/WalletProvider";
import { WalletContext as mobileWalletContext } from "@beratrax/core/src/context/WalletProvider";

const useWallet = () => {
	return Platform.OS === "web" ? useContext(webWalletContext) : useContext(mobileWalletContext);
};

export default useWallet;
