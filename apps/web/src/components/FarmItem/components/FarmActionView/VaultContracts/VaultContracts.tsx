import { FC } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { PoolDef } from "src/config/constants/pools_json";
import { blockExplorersByChainId } from "src/config/constants/urls";

interface VaultContractsProps {
    farm: PoolDef;
}

const VaultContracts: FC<VaultContractsProps> = ({ farm }) => {
    const blockExplorer = blockExplorersByChainId[farm.chainId];

    const contracts = [
        { name: "Vault Contract", address: farm.vault_addr },
        { name: "Zapper Contract", address: farm.zapper_addr },
        { name: "Underlying Token", address: farm.lp_address },
        ...(farm.rewardVault ? [{ name: "Reward Vault", address: farm.rewardVault }] : []),
        { name: `Token 1 (${farm.pair1})`, address: farm.token1 },
        ...(farm.token2 ? [{ name: `Token 2 (${farm.pair2})`, address: farm.token2 }] : []),
        ...(farm.token3 ? [{ name: `Token 3 (${farm.pair3})`, address: farm.token3 }] : []),
        ...(farm.token4 ? [{ name: `Token 4 (${farm.pair4})`, address: farm.token4 }] : []),
    ].filter((contract) => contract.address);

    return (
        <div className="mt-8">
            <h3 className="text-textWhite font-arame-mono font-normal text-[16px] leading-[18px] tracking-widest mb-4">
                VAULT CONTRACTS
            </h3>
            <div className="overflow-hidden rounded-xl bg-bgSecondary">
                <table className="w-full border-collapse">
                    <tbody>
                        {contracts.map((contract, index) => (
                            <tr
                                key={index}
                                className={index !== contracts.length - 1 ? "border-b border-gray-700" : ""}
                            >
                                <td className="p-4 text-textWhite font-medium">{contract.name}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-3">
                                        <a
                                            href={`${blockExplorer}/address/${contract.address}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gradientPrimary hover:underline flex items-center"
                                        >
                                            Berascan <FaExternalLinkAlt className="ml-1 text-xs" />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VaultContracts;

