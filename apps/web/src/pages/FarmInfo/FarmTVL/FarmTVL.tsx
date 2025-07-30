import React from "react";
import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { useWallet } from "@beratrax/core/src/hooks";
import useFarms from "@beratrax/core/src/state/farms/hooks/useFarms";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { getLpAddressForFarmsPrice } from "@beratrax/core/src/utils/common";
import { BsClipboardData } from "react-icons/bs";
import uuid from "react-uuid";
import styles from "./FarmTVL.module.css";

export const FarmTVL: React.FC = () => {
	const { farms } = useFarms();
	const { currentWallet } = useWallet();

	return (
		<table className={styles.table}>
			{currentWallet ? (
				<>
					<thead>
						<tr className={styles.header}>
							<th>
								<div className={styles.tableData + " " + styles.heading}>Vault</div>
							</th>
							<th>
								<div className={styles.tableData + " " + styles.heading} style={{ marginLeft: "5%" }}>
									TVL in pool
								</div>
							</th>
							<th>
								<div className={styles.tableData + " " + styles.heading} style={{ marginLeft: "5%" }}>
									TVL in underlying
								</div>
							</th>
						</tr>
					</thead>
					<tbody>
						<>
							{farms.map((farm) => (
								<FarmTVLRow key={uuid()} farm={farm as PoolDef} />
							))}
						</>
					</tbody>
				</>
			) : (
				<EmptyTable />
			)}
		</table>
	);
};

const FarmTVLRow: React.FC<{ farm: PoolDef }> = ({ farm }) => {
	const lpAddress = getLpAddressForFarmsPrice([farm])[0];

	const {
		totalSupplies,
		prices: {
			[farm.chainId]: { [farm.token1]: price1, [farm.token2!]: price2, [lpAddress]: lpPrice },
		},
	} = useTokens();
	return (
		<tr key={uuid()} className={styles.tableRow}>
			<td>
				<div className={styles.tableData + " " + styles.addressCol}>
					<div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
						<div>
							{farm?.logo1 ? <img alt={farm?.alt1} src={farm?.logo1} height={20} width={20} /> : null}
							{farm?.logo2 ? <img alt={farm?.alt2} src={farm?.logo2} height={20} width={20} /> : null}
						</div>
						{farm.name}
					</div>
				</div>
			</td>
			<td>
				<div className={`${styles.tableData}${" " + styles.specificCell}`}>
					{totalSupplies[farm.chainId][farm.vault_addr].supply &&
						(Number(totalSupplies[farm.chainId][farm.vault_addr].supply) * lpPrice).toLocaleString("en-US", {
							style: "currency",
							currency: "USD",
							maximumFractionDigits: 0,
						})}
				</div>
			</td>
			<td>
				<div className={`${styles.tableData}${" " + styles.specificCell}`}>
					{totalSupplies[farm.chainId][farm.lp_address].supply &&
						(Number(totalSupplies[farm.chainId][farm.lp_address].supply) * lpPrice).toLocaleString("en-US", {
							style: "currency",
							currency: "USD",
							maximumFractionDigits: 0,
						})}
				</div>
			</td>
		</tr>
	);
};

const EmptyTable = () => {
	return (
		<div className={styles.emptyTable}>
			<BsClipboardData size={36} className={styles.icon} />
			<p className={styles.disclaimer}>No Data Available</p>
		</div>
	);
};
