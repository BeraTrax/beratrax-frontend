import { FarmActionView, ETFVaultActionView } from "@beratrax/ui";
import { useParams } from "react-router-dom";
import { useEarnPage } from "@beratrax/core/src/state/farms/hooks";
import { ETFVaultDef, PoolDef } from "packages/core/src/config/constants/pools_json";

export default function FarmAction() {
	const { vaultAddress } = useParams();
	const { farms } = useEarnPage();
	const farmData = farms.find((farm) => farm.vault_addr === vaultAddress);

	// Checks if this is an ETF vault (zero address)
	if (farmData?.isETFVault) {
		return (
			<div>
				<ETFVaultActionView farm={farmData as ETFVaultDef} />
			</div>
		);
	}
	return (
		<div>
			<FarmActionView farm={farmData as PoolDef} />
		</div>
	);
}
