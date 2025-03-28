import { FarmActionView } from "web/src/components/FarmItem/components/FarmActionView/FarmActionView";
import { useParams } from "react-router-dom";
import { useEarnPage } from "@beratrax/core/src/state/farms/hooks";

export default function FarmAction() {
    const { vaultAddress } = useParams();
    const { farms } = useEarnPage();
    const farmData = farms.find((farm) => farm.vault_addr === vaultAddress);
    return (
        <div className={`overflow-auto`}>
            <FarmActionView farm={farmData!} />
        </div>
    );
}
