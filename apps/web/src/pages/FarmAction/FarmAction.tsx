import { FarmActionView, ETFVaultActionView } from "@beratrax/ui";
import { useParams } from "react-router-dom";
import { useEarnPage } from "@beratrax/core/src/state/farms/hooks";
import { zeroAddress } from "viem";
import { PoolDef } from "packages/core/src/config/constants/pools_json";

export default function FarmAction() {
	const { vaultAddress } = useParams();
	const { farms } = useEarnPage();
	const farmData = farms.find((farm) => farm.vault_addr === vaultAddress);

	// Checks if this is an ETF vault (zero address)
	if (vaultAddress === "0x76B0CbaF690dd99B9AE979d9FFddD85573aEFA9F") {
		return (
			<div>
				<ETFVaultActionView />
			</div>
		);
	}
	return (
		<div>
			<FarmActionView farm={farmData as PoolDef} />
		</div>
	);
}
