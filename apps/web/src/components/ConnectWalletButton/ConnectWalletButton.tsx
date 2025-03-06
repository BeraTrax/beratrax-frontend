import { ConnectButton } from "@rainbow-me/rainbowkit";
import useWallet from "src/hooks/useWallet";

const ConnectWalletButton = () => {
    const { connector } = useWallet();
    return (
      <div>
        <ConnectButton chainStatus={connector?.id === "web3auth" ? "none" : "full"} />
      </div>
    );
};

export default ConnectWalletButton;
