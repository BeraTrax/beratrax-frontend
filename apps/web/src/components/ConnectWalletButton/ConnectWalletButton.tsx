import React, { useState } from "react";
import useWallet from "src/hooks/useWallet";
import { WalletConnectionModal } from "../modals/WalletConnectionModal/WalletConnectionModal";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { ChainSelectorDisplay } from "../ChainSelectorDisplay/ChainSelectorDisplay";


const ConnectWalletButton: React.FC = () => {
    const [open, setOpen] = useState(false);
    const { displayAccount, logout, connector, currentWallet } = useWallet();
    const { openConnectModal } = useConnectModal();

    return (
        <div className="flex items-center gap-2">
            {/* Show current chain */}
            {currentWallet && <ChainSelectorDisplay />}

            <ConnectButton chainStatus={connector?.id === "web3auth" ? "none" : "full"} 
            showBalance={true}
            accountStatus="address"
            />
            {/* <button
                style={{ width: 110, height: 40, minHeight: 40, minWidth: 104, padding: 0 }}
                className="custom-button"
                // For Alchemy
                // onClick={() => (displayAccount ? logout() : setOpen(true))}
                // Web3Auth
                // onClick={() => (displayAccount ? logout() : connectWeb3Auth())}
                onClick={() => (displayAccount ? logout() : openConnectModal && openConnectModal!())}
            >
                {displayAccount ? "Disconnect" : "Sign In/Up"}
            </button> */}
            {/* {open && <WalletConnectionModal setOpenModal={setOpen} />} */}
        </div>
    );
};

export default ConnectWalletButton;
