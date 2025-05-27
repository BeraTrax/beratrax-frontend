import { EmptyComponent } from "src/components/EmptyComponent/EmptyComponent";
import ReferralLink from "src/components/ReferralLink/ReferralLink";
import { useDeviceInfo } from "src/hooks/useDeviceInfo";
import useWallet from "src/hooks/useWallet";
import Vaults from "./JoinedVaults/Vaults";
import { TokenBalances } from "./TokenBalances/TokenBalances";
import Transactions from "./Transactions/Transactions";
import { TraxReferralEarning } from "./TraxReferralEarning/TraxReferralEarning";
import { WalletAndStakingPoint } from "./WalletAndStakingPoint/WalletAndStakingPoint";
import { AirdropClaim } from "./AirdropClaim";
function Dashboard() {
    const { currentWallet } = useWallet();
    useDeviceInfo();

    return (
        // TODO: figure out why scroll is not working without overflow
        <div className="overflow-auto font-arame-mono" id="dashboard">
            <WalletAndStakingPoint />
            <AirdropClaim />
            <div className="flex flex-col mx-4 gap-y-4 mt-4 mb-32">
                {currentWallet ? (
                    <>
                        <TraxReferralEarning />
                        <ReferralLink />
                        <Vaults />
                        <TokenBalances />
                        <Transactions />
                    </>
                ) : (
                    <EmptyComponent style={{ paddingTop: 50, paddingBottom: 50 }}>
                        Sign in/up to view your dashboard.
                    </EmptyComponent>
                )}
            </div>
        </div>
    );
}

export default Dashboard;

