import React, { useState } from "react";
import { EmptyComponent } from "src/components/EmptyComponent/EmptyComponent";
import useWallet from "src/hooks/useWallet";

const Buy: React.FC = () => {
    const { currentWallet } = useWallet();
    const [activeTab, setActiveTab] = useState<"buy" | "sell">("sell");
    const [amountCrypto, setAmountCrypto] = useState<string>("0.25491944");
    const [exchangeRate, setExchangeRate] = useState<number>(1749.78);
    const [transakFee, setTransakFee] = useState<number>(11.15);
    const [processingFee, setProcessingFee] = useState<number>(0);
    const [selectedMethod, setSelectedMethod] = useState<"SEPA" | "Card Payment">("SEPA");

    // Calculate estimated fiat received
    const estimatedFiat = Number(amountCrypto) * exchangeRate - transakFee - processingFee;
    const cryptoOptions = [
        { value: "ETH", label: "ETH" },
        { value: "BERA", label: "BERA" },
        { value: "USDC", label: "USDC" },
        { value: "HONEY", label: "HONEY" },
    ];

    return (
        <div className="flex justify-center items-center min-h-[80vh] font-arame-mono">
            {currentWallet ? (
                <div className="w-full max-w-md mx-auto p-8 bg-bgSecondary shadow-2xl rounded-xl border border-borderDark text-textWhite">
                    {/* Buy/Sell Toggle */}
                    <div className="relative flex bg-bgDark rounded-xl p-1 mb-6 border border-borderDark">
                        <div
                            className={`absolute transition-all duration-300 bg-buttonPrimary rounded-lg h-10 z-0 ${
                                activeTab === "buy"
                                    ? "left-1 w-[calc(50%-4px)]"
                                    : "left-[calc(50%+2px)] w-[calc(50%-4px)]"
                            }`}
                        ></div>
                        <button
                            className={`relative z-10 flex-1 text-lg font-semibold py-2 rounded-lg transition-colors ${
                                activeTab === "buy" ? "text-textWhite" : "text-textSecondary"
                            }`}
                            onClick={() => setActiveTab("buy")}
                        >
                            Buy
                        </button>
                        <button
                            className={`relative z-10 flex-1 text-lg font-semibold py-2 rounded-lg transition-colors ${
                                activeTab === "sell" ? "text-textWhite" : "text-textSecondary"
                            }`}
                            onClick={() => setActiveTab("sell")}
                        >
                            Sell
                        </button>
                    </div>

                    {/* Crypto Input */}
                    <div className="mb-6">
                        <label className="text-textSecondary text-sm block mb-2">You pay</label>
                        <div className="flex items-center bg-bgDark p-3 rounded-lg border border-borderDark">
                            <input
                                type="number"
                                className="w-full bg-transparent focus:outline-none text-lg"
                                value={amountCrypto}
                                onChange={(e) => setAmountCrypto(e.target.value)}
                            />
                            <div className="relative ml-2">
                                <select
                                    className="appearance-none bg-transparent border border-borderDark rounded-lg px-3 py-1 pr-8 text-textSecondary font-medium focus:outline-none focus:border-buttonPrimary focus:shadow-[0_0_8px_rgba(160,255,59,0.5)] cursor-pointer transition-all duration-200"
                                    defaultValue="ETH"
                                >
                                    {cryptoOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                            className="bg-bgDark text-textWhite"
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-textPrimary">
                                    <svg
                                        className="fill-current h-4 w-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-textGrey mt-2">Berachain Network</p>
                    </div>

                    {/* Exchange Rate and Fees */}
                    <div className="mb-6 bg-bgDark p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-textSecondary">1 ETH = {exchangeRate} EUR</p>
                            <p className="text-textPrimary cursor-pointer text-xs hover:underline">Hide</p>
                        </div>

                        <div className="space-y-2 text-sm border-t border-borderDark pt-3">
                            <div className="flex justify-between">
                                <span className="text-textSecondary">Transak Fee</span>
                                <span className="text-textSecondary">{transakFee} EUR</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-textSecondary">Processing Fee</span>
                                <span className="text-textSecondary">{processingFee} EUR</span>
                            </div>
                            <div className="flex justify-between font-semibold pt-2 border-t border-borderDark mt-2">
                                <span>Total Fees</span>
                                <span>{transakFee + processingFee} EUR</span>
                            </div>
                        </div>
                    </div>

                    {/* Estimated Fiat Output */}
                    <div className="mb-6">
                        <label className="text-textSecondary text-sm block mb-2">You receive (estimate)</label>
                        <div className="flex items-center bg-bgDark p-3 rounded-lg border border-borderDark">
                            <span className="w-full text-xl font-medium">{estimatedFiat.toFixed(2)}</span>
                            <span className="text-textSecondary ml-2 font-medium">EUR</span>
                        </div>
                    </div>

                    {/* Sell Now Button */}
                    <button className="w-full bg-buttonPrimary hover:bg-buttonPrimaryLight text-textWhite py-3 px-4 rounded-lg font-medium text-lg transition-colors">
                        {activeTab === "buy" ? "Buy Now" : "Sell Now"}
                    </button>
                </div>
            ) : (
                <EmptyComponent style={{ paddingTop: 50, paddingBottom: 50 }}>
                    Sign in/up to access the buy/sell feature.
                </EmptyComponent>
            )}
        </div>
    );
};

export default Buy;
