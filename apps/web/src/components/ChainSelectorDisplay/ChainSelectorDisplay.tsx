import React, { useState } from "react";
import { useChainId } from "wagmi";
import useWallet from "src/hooks/useWallet";
import berachain from "src/assets/images/berachain.svg";
import arbitrum from "src/assets/images/arbitrum.svg";
import { IoChevronDownOutline, IoCloseOutline } from "react-icons/io5";
import { CHAIN_ID } from "src/types/enums";
import { defaultChainId } from "src/config/constants";

const getChainImage = (chainId: number): string | null => {
    switch (chainId) {
        case CHAIN_ID.BERACHAIN:
            return berachain;
        case CHAIN_ID.ARBITRUM:
            return arbitrum;
        default:
            return null;
    }
};

export const ChainSelectorDisplay: React.FC = () => {
    const currentChainId = useChainId();
    const { switchToChain, supportedChains, getChainName, isChainSupported } = useWallet();
    const displayedChainId = currentChainId || defaultChainId;
    const [isModalOpen, setModalOpen] = useState(false);

    const handleChainClick = async (chainId: number) => {
        try {
            await switchToChain(chainId);
            setModalOpen(false);
        } catch (error) {
            console.error("Failed to switch chain:", error);
        }
    };

    const chainName = isChainSupported(displayedChainId)
        ? getChainName(displayedChainId)
        : "Unsupported Network";

    return (
        <div className="relative">
            <button
                onClick={() => setModalOpen(true)}
                className="w-full flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium bg-bgSecondary text-textWhite shadow hover:bg-bgPrimary"
            >
                <img
                    src={getChainImage(displayedChainId) || ""}
                    alt={chainName}
                    className="w-5 h-5 rounded-full"
                />
                <span>{chainName}</span>
                <IoChevronDownOutline className="w-4 h-4 ml-auto" />
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-bgDark p-4 rounded-xl shadow-xl max-w-sm w-full text-textWhite">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Select Network</h2>
                            <button onClick={() => setModalOpen(false)} className="text-textWhite hover:text-gray-700">
                                <IoCloseOutline className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {supportedChains.map((chain) => (
                                <button
                                    key={chain.id}
                                    onClick={() => handleChainClick(chain.id)}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-bgPrimary"
                                >
                                    <img
                                        src={getChainImage(chain.id) || ""}
                                        alt={chain.name}
                                        className="w-5 h-5 rounded-full"
                                    />
                                    <span className="text-sm">{chain.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
