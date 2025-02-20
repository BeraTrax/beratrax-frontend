import { FarmActionView } from "src/components/FarmItem/components/FarmActionView/FarmActionView";
import { useParams } from "react-router-dom";
import useEarnPage from "src/state/farms/hooks/useEarnPage";

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
