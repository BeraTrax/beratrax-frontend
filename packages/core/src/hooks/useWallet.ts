import { useContext } from "react";
import { Platform } from "react-native";
import { IWalletContext as IWebWalletContext, WalletContext as webWalletContext } from "@beratrax/web/src/context/WalletProvider";
import { IWalletContext as IMobileWalletContext, WalletContext as mobileWalletContext } from "@beratrax/mobile/app/context/WalletProvider";

// Create unified type
export type WalletHookType =
	| (IWebWalletContext & { connectWallet: IWebWalletContext["connectWallet"] })
	| (IMobileWalletContext & { connectWallet: IMobileWalletContext["connectWallet"] });

// Platform-aware hook with no generics needed
const useWallet = (): WalletHookType => {
	return Platform.OS === "web" ? (useContext(webWalletContext) as WalletHookType) : (useContext(mobileWalletContext) as WalletHookType);
};

export default useWallet;
