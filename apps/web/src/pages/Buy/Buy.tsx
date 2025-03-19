import {
    FundCard,
    FundCardAmountInput,
    FundCardAmountInputTypeSwitch,
    FundCardPresetAmountInputList,
    FundCardPaymentMethodDropdown,
    FundCardSubmitButton,
} from "@coinbase/onchainkit/fund";

export const Buy: React.FC = () => {
    const presetAmountInputs = ["10", "20", "50"] as const;

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-3xl font-bold mb-6 font-['League_Spartan'] text-textWhite uppercase">BUY CRYPTO</h1>
            <div className="w-full max-w-md p-6 bg-bgDark rounded-xl border border-gradientSecondary">
                <div className="flex justify-center mt-10">
                    <FundCard assetSymbol="USDC" country="US" currency="USD" presetAmountInputs={presetAmountInputs}>
                        <FundCardAmountInput />
                        <FundCardAmountInputTypeSwitch />
                        <FundCardPresetAmountInputList />
                        <FundCardPaymentMethodDropdown />
                        <FundCardSubmitButton />
                    </FundCard>
                </div>
                <div className="mt-6 text-center">
                    <p className="text-xs text-textSecondary">Powered by Coinbase</p>
                </div>
            </div>
        </div>
    );
};
