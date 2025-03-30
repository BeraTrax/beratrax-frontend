import React, { useContext } from "react";
import { WalletContext } from "core/src/context/WalletProvider";

const useWallet = () => {
  return useContext(WalletContext);
};

export default useWallet;
