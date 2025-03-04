import React, { useState } from "react";
import useWallet from "src/hooks/useWallet";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";

const ConnectWalletButton = () => {
  const { connector } = useWallet();
  return (
    <div>
      <ConnectButton chainStatus={connector?.id === "web3auth" ? "none" : "full"} />
    </div>
  );
};

export default ConnectWalletButton;
