import { FundButton } from "@coinbase/onchainkit/fund";
import useWallet from "src/hooks/useWallet";
import { useEffect } from "react";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export const Buy: React.FC = () => {
    const { currentWallet, connector } = useWallet();
    const { address } = useAccount();

    useEffect(() => {
        if (currentWallet) {
            console.log("Wallet connected:", currentWallet);
        }
    }, [currentWallet]);

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-3xl font-bold mb-6 font-['League_Spartan'] text-textWhite uppercase">BUY CRYPTO</h1>
            <div className="w-full max-w-md p-6 bg-bgDark rounded-xl border border-gradientSecondary">
                <div className="flex justify-center mt-10">
                    {address ? (
                        <FundButton 
                            fundingUrl={`https://pay.coinbase.com/buy/select-asset?appId=${import.meta.env.REACT_APP_CDP_PROJECT_ID}&defaultAsset=USDC&defaultNetwork=berachain&addresses={"${address}":["berachain"]}&assets=["USDC"]`}
                            openIn="tab"
                        />
                    ) : (
                        <ConnectButton chainStatus={connector?.id === "web3auth" ? "none" : "full"} />
                    )}
                </div>
                <div className="mt-6 text-center">
                    <p className="text-xs text-textSecondary">Powered by Coinbase</p>
                </div>
            </div>
        </div>
    );
};
