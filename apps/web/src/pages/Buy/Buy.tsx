import React, { useMemo, useState, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { getOnrampBuyUrl, FundButton } from "@coinbase/onchainkit/fund";
import { useAccount } from "wagmi";
import { defaultChainId, defaultNetworkName, RAMP_TRANSAK_API_KEY } from "src/config/constants";
import transaklogo from "src/assets/images/transaklogo.png";
import holyheldlogo from "src/assets/images/holyheldlogo.png";
import coinbaselogo from "src/assets/images/coinbaselogo.png";
import HolyheldSDK, { HolyheldSDKError, HolyheldSDKErrorCode, Network } from '@holyheld/sdk';
import { useQuery } from "@tanstack/react-query";
import { addressesByChainId } from "src/config/constants/contracts";

enum BuyService {
    coinbase = "coinbase",
    transak = "transak",
    holyheld = "holyheld"
}

export const Buy: React.FC = () => {
    const [amount, setAmount] = useState<string>("10");
    const { address } = useAccount();
    // Keeping the state, because earlier we had the option to switch between FIAT and Crypto
    const [currencyType, setCurrencyType] = useState<"USD" | "USDC">("USD");
    const [isCustomInput, setIsCustomInput] = useState<boolean>(false);
    const [customAmount, setCustomAmount] = useState<string>("10");
    const [selectedService, setSelectedService] = useState<BuyService>(BuyService.coinbase);
    const [isHolyheldLoading, setIsHolyheldLoading] = useState<boolean>(false);
    const [isHolyheldAllowed, setIsHolyheldAllowed] = useState<boolean>(true);
    const [showTransakWidget, setShowTransakWidget] = useState<boolean>(false);
    
    const holyheldSDK = useMemo(() => new HolyheldSDK({ apiKey: import.meta.env.REACT_APP_HOLYHELD_API_KEY }), []);
    
    // Combined query for both exchange rate and Holyheld settings
    const { data: { usdToEurRate = 0.88, holyheldLimits } = {} } = useQuery<{
        usdToEurRate: number;
        holyheldLimits: { minAmountEUR: number; maxAmountEUR: number; isEnabled: boolean } | null;
      }>({
        queryKey: ['buy-service-data', selectedService],
        queryFn: async () => {
            const results = await Promise.allSettled([
                // Fetch USD to EUR rate
                fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR')
                    .then(response => response.json())
                    .then(data => data.rates.EUR),
                
                // Fetch Holyheld settings only if Holyheld is selected
                selectedService === BuyService.holyheld ? (async () => {
                    await holyheldSDK.init();
                    const settings = await holyheldSDK.getServerSettings();
                    console.log('Holyheld server settings:', settings);
                    return {
                        minAmountEUR: Number(settings.external.minOnRampAmountInEUR),
                        maxAmountEUR: Number(settings.external.maxOnRampAmountInEUR),
                        isEnabled: settings.external.isOnRampEnabled
                    };
                })() : Promise.resolve(null)
            ]);

            return {
                usdToEurRate: results[0].status === 'fulfilled' ? results[0].value : 0.88,
                holyheldLimits: results[1].status === 'fulfilled' ? results[1].value : null
            };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: 1000 * 60 * 5, // Auto refetch every 5 minutes
    });

    // Convert USD to EUR (approximate rate, in production you'd want real-time rates)
    const usdToEurToUsd = useCallback((amount: number, isUSD = true) => {
        const eurToUsdRate = 1 / usdToEurRate;
      
        if (typeof amount !== 'number' || amount < 0) {
          throw new Error('Invalid amount. Must be a positive number.');
        }
      
        const convertedAmount = isUSD 
          ? (amount * usdToEurRate) 
          : (amount * eurToUsdRate);
        
        // Apply 1% downgrade for safety
        return convertedAmount * 0.99;
    }, [usdToEurRate]);

    // Calculate amount limits based on selected service
    const amountLimits = useMemo(() => {
        if (selectedService === BuyService.holyheld && holyheldLimits) {
            return {
                minAmount: Math.floor(usdToEurToUsd(holyheldLimits.minAmountEUR, false)),
                maxAmount: Math.floor(usdToEurToUsd(holyheldLimits.maxAmountEUR, false)),
            };
        }
        return {
            minAmount: 10,
            maxAmount: 999999999999999
        };
    }, [selectedService, holyheldLimits, usdToEurToUsd]);

    const { minAmount, maxAmount } = amountLimits;

    const presetAmounts = ["20", "50", "100"];

    const currentAmount = isCustomInput ? customAmount : amount;
    const displayAmount = currentAmount || "0";

    // USD to USDC is 1:1 ratio
    const convertedAmount = displayAmount;

    useLayoutEffect(() => {
        (async () => {
            await holyheldSDK.init();
            // validate address
            if (address) {
                const addressValidation = await holyheldSDK.validateAddress(address.toString());
                setIsHolyheldAllowed(addressValidation.isOnRampAllowed);
            }
        })();
    }, [address, holyheldSDK]);

    // coinbase
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
        return `https://global.transak.com/?apiKey=${RAMP_TRANSAK_API_KEY}&cryptoCurrencyCode=BERA&network=berachain&walletAddress=${address}&defaultFiatAmount=${displayAmount}&defaultFiatCurrency=USD`;
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
            if (value === "" || ( numValue <= maxAmount)) {
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

    // holyheld
    const handleHolyheldBuy = async () => {
        await holyheldSDK.init();
        // In a real implementation, you would:
        // 1. Initialize Holyheld SDK with API key
        // 2. Call getServerSettings to check availability
        // 3. Validate address
        // 4. Get estimation
        // 5. Request onramp
        // 6. Watch for confirmation
        if (!isValidAmount() || !address || !holyheldSDK) {
            console.error('Invalid conditions for Holyheld onramp');
            return;
        }

        setIsHolyheldLoading(true);

        try {
            // Convert USD to EUR for Holyheld
            const eurAmount = usdToEurToUsd(parseFloat(displayAmount));
            
            console.log(`Starting Holyheld onramp: ${eurAmount} EUR (${displayAmount} USD) to ${address}`);

            // Step 1: Get server settings and check availability
            const settings = await holyheldSDK.getServerSettings();
            if (!settings.external.isOnRampEnabled) {
                throw new Error('Holyheld onramp is currently disabled');
            }

            console.log('Holyheld server settings:', settings);

            // Step 2: Validate address
            const addressValidation = await holyheldSDK.validateAddress(address);
            if (!addressValidation.isOnRampAllowed) {
                throw new Error('Address is not allowed for onramp');
            }

            console.log('Holyheld address validation:', addressValidation);

            // Step 3: Get estimation
            const estimation = await holyheldSDK.evm.onRamp.getOnRampEstimation({
                walletAddress: address,
                tokenAddress: addressesByChainId[defaultChainId].usdcAddress,
                tokenNetwork: Network.berachain, // network
                EURAmount: eurAmount.toString()
            });

            console.log('Holyheld estimation:', estimation);

            // Step 4: Confirm with user
            const userConfirmed = window.confirm(
                `Holyheld Onramp Details:\n` +
                `Amount: ${eurAmount} EUR (${displayAmount} USD)\n` +
                `Fee: ${estimation.feeAmount} EUR\n` +
                `Expected tokens: ${estimation.expectedAmount}\n` +
                `\nProceed with the transaction?`
            );

            if (!userConfirmed) {
                setIsHolyheldLoading(false);
                return;
            }

            // Step 5: Request onramp
            const onrampRequest = await holyheldSDK.evm.onRamp.requestOnRamp({
                walletAddress: address,
                tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC address
                tokenNetwork: Network.berachain,
                EURAmount: eurAmount.toString()
            });

            console.log('Holyheld onramp request created:', onrampRequest);

            // Step 6: Inform user about mobile app confirmation
            alert(
                `Onramp request created!\n` +
                `Request ID: ${onrampRequest.requestUid}\n` +
                `\nPlease confirm this transaction in your Holyheld mobile app within 3 minutes.`
            );

            // Step 7: Watch for confirmation
            const result = await holyheldSDK.evm.onRamp.watchRequestId(
                onrampRequest.requestUid,
                { 
                    timeout: 180000, // 3 minutes
                    waitForTransactionHash: true 
                }
            );

            if (result.success) {
                alert(
                    `Transaction successful! 🎉\n` +
                    `${result.hash ? `Transaction hash: ${result.hash}` : 'Transaction completed'}`
                );
            } else {
                throw new Error('Transaction was declined or failed');
            }

        } catch (error) {
            console.error('Holyheld onramp error:', error);
            alert(`Holyheld onramp failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsHolyheldLoading(false);
        }
    };

    const handleBuyClick = () => {
        if (!isValidAmount()) return;

        switch (selectedService) {
            case BuyService.coinbase:
                // FundButton will handle this automatically
                break;
            case BuyService.transak:
                setShowTransakWidget(true);
                break;
            case BuyService.holyheld:
                handleHolyheldBuy();
                break;
        }
    };

    const handleCloseTransakWidget = () => {
        setShowTransakWidget(false);
    };

    const tabs = [
        {
            id: BuyService.coinbase,
            label: BuyService.coinbase[0].toUpperCase() + BuyService.coinbase.slice(1),
            icon: <img src={coinbaselogo} alt={BuyService.coinbase} className="w-5 h-5 rounded-full" />,
        },
        { id: BuyService.transak, label: BuyService.transak[0].toUpperCase() + BuyService.transak.slice(1), icon: <img src={transaklogo} alt={BuyService.transak} className="w-5 h-5 rounded-full" /> },
        { id: BuyService.holyheld, label: BuyService.holyheld[0].toUpperCase() + BuyService.holyheld.slice(1), icon: <img src={holyheldlogo} alt={BuyService.holyheld} className="w-5 h-5 rounded-full" /> },
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
                                key={tab.id}
                                onClick={() => {
                                    setSelectedService(tab.id);
                                    if (tab.id !== BuyService.transak) {
                                        setShowTransakWidget(false);
                                    }
                                }}
                                disabled={isHolyheldLoading && selectedService === BuyService.holyheld}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all font-medium ${
                                    selectedService === tab.id
                                        ? "bg-buttonPrimary text-bgDark"
                                        : "text-textWhite hover:bg-bgDark"
                                } ${isHolyheldLoading && selectedService === BuyService.holyheld ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                        selectedService === tab.id
                                            ? "bg-bgDark text-buttonPrimary"
                                            : tab.id === BuyService.coinbase
                                                ? "bg-blue-500 text-white"
                                                : tab.id === BuyService.transak
                                                    ? "bg-purple-500 text-white"
                                                    : "bg-gray-500 text-white"
                                    }`}
                                >
                                    {tab.icon}
                                </div>
                                <span className="text-sm">{tab.label}</span>
                                {isHolyheldLoading && selectedService === BuyService.holyheld && (
                                    <div className="w-3 h-3 border border-bgDark border-t-transparent rounded-full animate-spin ml-1"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Transak Widget */}
                {selectedService === BuyService.transak && showTransakWidget && (
                    <div className="mb-6">
                        <div className="bg-bgDark rounded-2xl border border-gradientSecondary p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <img src={transaklogo} alt={BuyService.transak} className="w-7 h-7 rounded-full" />
                                    <h3 className="text-textWhite font-medium">Transak Onramp</h3>
                                </div>
                                <button
                                    onClick={handleCloseTransakWidget}
                                    className="text-textSecondary hover:text-textWhite transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <iframe
                                height="625"
                                title="Transak On/Off Ramp Widget"
                                src={transakUrl}
                                allowFullScreen={true}
                                style={{ 
                                    display: "block", 
                                    width: "100%", 
                                    maxHeight: "625px", 
                                    maxWidth: "100%",
                                    borderRadius: "8px"
                                }}
                                className="bg-white rounded-lg"
                            />
                        </div>
                    </div>
                )}

                {/* Main Amount Display Card */}
                {!(selectedService === BuyService.transak && showTransakWidget) && (
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
                              
                            <div className={`text-xs text-textSecondary mt-1  ${selectedService === BuyService.holyheld ? "visible" : "invisible"}`}>
                                ≈ {usdToEurToUsd(parseFloat(displayAmount))} EUR
                            </div>
                            
                        </div>

                        {/* Custom Amount Input */}
                        <div className="mb-6">
                            <label className="block text-textWhite text-sm font-medium mb-2">
                                Enter Amount (${minAmount} - ${maxAmount})
                            </label>
                            <input
                                step={1}
                                min={minAmount}
                                max={maxAmount}
                                type="number"
                                value={customAmount}
                                onChange={handleCustomInputChange}
                                disabled={isHolyheldLoading}
                                placeholder={`Enter amount in ${currencyType}`}
                                className="w-full px-4 py-3 bg-bgSecondary border border-borderDark rounded-lg text-textWhite placeholder-textSecondary focus:border-borderLight focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        disabled={isHolyheldLoading}
                                        className={`flex-1 py-3 px-4 rounded-lg border transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
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
                            {selectedService === BuyService.coinbase ? (
                                <FundButton
                                    hideIcon={true}
                                    fundingUrl={onrampBuyUrl}
                                    disabled={!isValidAmount() || isHolyheldLoading}
                                    text="+ Buy"
                                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                                        isValidAmount() && !isHolyheldLoading
                                            ? "bg-buttonPrimary hover:bg-buttonPrimaryLight text-bgDark"
                                            : "bg-buttonDisabled cursor-not-allowed"
                                    }`}
                                />
                            ) : (
                                <button
                                    onClick={handleBuyClick}
                                    disabled={
                                        !isValidAmount() || 
                                        isHolyheldLoading || 
                                        (selectedService === BuyService.holyheld && !isHolyheldAllowed)
                                    }
                                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                                        isValidAmount() && 
                                        !isHolyheldLoading && 
                                        (selectedService !== BuyService.holyheld || isHolyheldAllowed)
                                            ? "bg-buttonPrimary hover:bg-buttonPrimaryLight text-bgDark"
                                            : "bg-buttonDisabled text-textBlack cursor-not-allowed"
                                    }`}
                                >
                                    {isHolyheldLoading && selectedService === BuyService.holyheld ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-bgDark border-t-transparent rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {selectedService === BuyService.transak && "+ Buy"}
                                            {selectedService === BuyService.holyheld && (
                                                isHolyheldAllowed ? "+ Buy" : "Not allowed"
                                            )}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Service-specific Footer */}
                        <div className="text-center">
                            <p className="text-xs text-textSecondary">
                                {
                                    Object.values(BuyService).map((service) => (
                                        service === selectedService && (
                                            <span key={service}>
                                                {`Powered by ${service[0].toUpperCase() + service.slice(1)}`}
                                            </span>
                                        )
                                    ))
                                }
                            </p>
                            {selectedService === BuyService.holyheld && isHolyheldLoading && (
                                <p className="text-xs text-buttonPrimary mt-1">
                                    Please confirm in your Holyheld mobile app
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

