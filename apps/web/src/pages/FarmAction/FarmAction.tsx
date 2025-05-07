import { FarmActionView } from "@beratrax/ui";
import { useParams } from "react-router-dom";
import { useEarnPage } from "@beratrax/core/src/state/farms/hooks";

export default function FarmAction() {
	const { vaultAddress } = useParams();
	const { farms } = useEarnPage();
	const farmData = farms.find((farm) => farm.vault_addr === vaultAddress);
	return (
		<div>
			<FarmActionView farm={farmData!} />
		</div>
	);
}

