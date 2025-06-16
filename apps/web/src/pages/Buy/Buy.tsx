import React, { useMemo, useState } from "react";
import { getOnrampBuyUrl, FundButton } from "@coinbase/onchainkit/fund";
import { useAccount } from "wagmi";
import { defaultNetworkName, RAMP_TRANSAK_API_KEY } from "src/config/constants";
import transaklogo from "src/assets/images/transaklogo.png";
import thirdweblogo from "src/assets/images/thirdweblogo.png";
import coinbaselogo from "src/assets/images/coinbaselogo.png";

type BuyService = "coinbase" | "transak" | "thirdweb";

export const Buy: React.FC = () => {
    const [amount, setAmount] = useState<string>("10");
    const { address } = useAccount();
    const [currencyType, setCurrencyType] = useState<"USD" | "USDC">("USD");
    const [isCustomInput, setIsCustomInput] = useState<boolean>(false);
    const [customAmount, setCustomAmount] = useState<string>("2");
    const [selectedService, setSelectedService] = useState<BuyService>("coinbase");

    const presetAmounts = ["10", "20", "50"];
    const minAmount = 2;
    const maxAmount = 500;

    const currentAmount = isCustomInput ? customAmount : amount;
    const displayAmount = currentAmount || "0";

    // USD to USDC is 1:1 ratio
    const convertedAmount = displayAmount;

    const onrampBuyUrl = useMemo(() => {
        return getOnrampBuyUrl({
            projectId: import.meta.env.REACT_APP_CDP_PROJECT_ID,
            addresses: { [address?.toString() || ""]: [defaultNetworkName] },
            assets: ["USDC"],
            presetFiatAmount: parseFloat(displayAmount) || 10,
            fiatCurrency: "USD",
        });
    }, [address, displayAmount]);

    const transakUrl = useMemo(() => {
        return `https://global.transak.com/?apiKey=${RAMP_TRANSAK_API_KEY}&defaultCryptoCurrency=USDC&network=berachain&defaultCryptoCurrency=BERA&walletAddress=${address}&defaultFiatAmount=${displayAmount}&fiatCurrency=USD`;
    }, [address, displayAmount]);

    const handlePresetClick = (presetAmount: string) => {
        setAmount(presetAmount);
        setIsCustomInput(false);
        setCustomAmount(presetAmount);
    };

    const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only numbers and decimal point
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
            const numValue = parseFloat(value);
            if (value === "" || (numValue >= minAmount && numValue <= maxAmount)) {
                setCustomAmount(value);
                setIsCustomInput(true);
            }
        }
    };

    // const toggleCurrencyType = () => {
    //     setCurrencyType(prev => prev === 'USD' ? 'USDC' : 'USD');
    // };

    const isValidAmount = () => {
        const num = parseFloat(displayAmount);
        return num >= minAmount && num <= maxAmount;
    };

    const handleBuyClick = () => {
        if (!isValidAmount()) return;

        switch (selectedService) {
            case "coinbase":
                // FundButton will handle this automatically
                break;
            case "transak":
                window.open(transakUrl, "_blank", "noopener,noreferrer");
                break;
            case "thirdweb":
                // TODO: Implement thirdweb integration
                console.log("thirdweb integration coming soon");
                break;
        }
    };

    const tabs = [
        {
            id: "coinbase" as BuyService,
            label: "Coinbase",
            icon: <img src={coinbaselogo} alt="Coinbase" className="w-5 h-5" />,
        },
        { id: "transak" as BuyService, label: "Transak", icon: <img src={transaklogo} alt="Transak" className="w-5 h-5" /> },
        { id: "thirdweb" as BuyService, label: "thirdweb", icon: <img src={thirdweblogo} alt="thirdweb" className="w-5 h-5" /> },
    ];

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-3xl font-bold mb-6 font-arame-mono text-textWhite uppercase">BUY CRYPTO</h1>

            <div className="w-full max-w-md">
                {/* Service Selection Tabs */}
                <div className="mb-6">
                    <div className="flex bg-bgSecondary rounded-lg p-1 border border-borderDark">
                        {tabs.map((tab) => (
                            <button
                                disabled={tab.id === "thirdweb"}
                                key={tab.id}
                                onClick={() => setSelectedService(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all font-medium ${
                                    selectedService === tab.id
                                        ? "bg-buttonPrimary text-bgDark"
                                        : "text-textWhite hover:bg-bgDark"
                                }`}
                            >
                                <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                        selectedService === tab.id
                                            ? "bg-bgDark text-buttonPrimary"
                                            : tab.id === "coinbase"
                                            ? "bg-blue-500 text-white"
                                            : tab.id === "transak"
                                            ? "bg-purple-500 text-white"
                                            : "bg-gray-500 text-white"
                                    }`}
                                >
                                    {tab.icon}
                                </div>
                                <span className="text-sm">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Amount Display Card */}
                <div className="bg-bgDark rounded-2xl border border-gradientSecondary p-6 mb-4">
                    {/* Large Amount Display */}
                    <div className="text-center mb-6">
                        <div className="text-4xl font-bold text-textWhite mb-2">
                            {displayAmount} {currencyType}
                        </div>
                        <div className="flex items-center justify-center gap-2 text-textSecondary">
                            <span className="text-sm">⟷</span>
                            <span className="text-sm">
                                {convertedAmount} {currencyType === "USD" ? "USDC" : "USD"}
                            </span>
                        </div>
                    </div>

                    {/* Custom Amount Input */}
                    <div className="mb-6">
                        <label className="block text-textWhite text-sm font-medium mb-2">
                            Enter Amount (${minAmount} - ${maxAmount})
                        </label>
                        <input
                            step={1}
                            type="number"
                            value={customAmount}
                            onChange={handleCustomInputChange}
                            placeholder={`Enter amount in ${currencyType}`}
                            className="w-full px-4 py-3 bg-bgSecondary border border-borderDark rounded-lg text-textWhite placeholder-textSecondary focus:border-borderLight focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Preset Amount Buttons */}
                    <div className="mb-6">
                        <label className="block text-textWhite text-sm font-medium mb-3">Quick Select</label>
                        <div className="flex gap-3">
                            {presetAmounts.map((presetAmount) => (
                                <button
                                    key={presetAmount}
                                    onClick={() => handlePresetClick(presetAmount)}
                                    className={`flex-1 py-3 px-4 rounded-lg border transition-all font-medium ${
                                        !isCustomInput && amount === presetAmount
                                            ? "bg-buttonPrimary border-buttonPrimary text-bgDark"
                                            : "bg-bgSecondary border-borderDark text-textWhite hover:border-borderLight"
                                    }`}
                                >
                                    ${presetAmount}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Buy Button - Conditional Rendering Based on Selected Service */}
                    <div className="mb-4">
                        {selectedService === "coinbase" ? (
                            <FundButton
                                hideIcon={true}
                                fundingUrl={onrampBuyUrl}
                                disabled={!isValidAmount()}
                                text="+ Buy"
                                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                                    isValidAmount()
                                        ? "bg-buttonPrimary hover:bg-buttonPrimaryLight text-bgDark"
                                        : "bg-buttonDisabled cursor-not-allowed"
                                }`}
                            />
                        ) : (
                            <button
                                onClick={handleBuyClick}
                                disabled={!isValidAmount()}
                                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                                    isValidAmount()
                                        ? "bg-buttonPrimary hover:bg-buttonPrimaryLight text-bgDark"
                                        : "bg-buttonDisabled text-textSecondary cursor-not-allowed"
                                }`}
                            >
                                {selectedService === "transak" && "+ Buy"}
                                {selectedService === "thirdweb" && "+ Buy"}
                            </button>
                        )}
                    </div>

                    {/* Service-specific Footer */}
                    <div className="text-center">
                        <p className="text-xs text-textSecondary">
                            {selectedService === "coinbase" && "Powered by Coinbase"}
                            {selectedService === "transak" && "Powered by Transak"}
                            {selectedService === "thirdweb" && "Powered by thirdweb"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

