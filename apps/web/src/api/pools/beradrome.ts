import { toEth } from "src/utils/common";
import {
    FarmFunctions,
    GetFarmDataProcessedFn,
    SlippageInBaseFn,
    SlippageOutBaseFn,
    TokenAmounts,
    ZapInBaseFn,
    ZapInFn,
    ZapOutFn,
} from "./types";
import {
    zapOutBase,
    zapInBase,
    slippageIn,
    slippageOut,
    calculateWithdrawableAmounts,
    calculateDepositableAmounts,
    isCrossChainFn,
} from "./common";
import pools_json from "src/config/constants/pools_json";

let beradrome = function (farmId: number): Omit<FarmFunctions, "deposit" | "withdraw"> {
    const farm = pools_json.find((farm) => farm.id === farmId)!;

    const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals, vaultTotalSupply, externalBalances) => {
        const vaultTokenPrice = prices[farm.chainId][farm.vault_addr];
        const isCrossChain = isCrossChainFn(balances, farm);

        const result = {
            depositableAmounts: calculateDepositableAmounts({ balances, prices, farm, externalBalances }),
            withdrawableAmounts: calculateWithdrawableAmounts({ balances, prices, farm, externalBalances }),
            isCrossChain,
            vaultBalanceFormated: (Number(toEth(BigInt(vaultTotalSupply ?? 0))) * vaultTokenPrice).toString(),
            id: farm.id,
        };
        return result;
    };

    const zapIn: ZapInFn = (props) => zapInBase({ ...props, farm });
    const zapInSlippage: SlippageInBaseFn = (props) => slippageIn({ ...props, farm });

    const zapOut: ZapOutFn = (props) => zapOutBase({ ...props, farm });
    const zapOutSlippage: SlippageOutBaseFn = (props) => slippageOut({ ...props, farm });

    return {
        getProcessedFarmData,
        zapIn,
        zapOut,
        zapInSlippage,
        zapOutSlippage,
    };
};

export default beradrome;
