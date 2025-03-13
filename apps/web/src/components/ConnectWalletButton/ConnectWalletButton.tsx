import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWallet } from "@beratrax/core/hooks";

const ConnectWalletButton = () => {
    const { connector } = useWallet();
    return (
      <div>
        <ConnectButton chainStatus={connector?.id === "web3auth" ? "none" : "full"} />
      </div>
    );
};

export default ConnectWalletButton;
