import { EmptyComponent } from "web/src/components/EmptyComponent/EmptyComponent";
import ReferralLinkOld from "web/src/components/ReferralLink/ReferralLink";
import { useDeviceInfo } from "@beratrax/core/src/hooks";
import { useWallet } from "@beratrax/core/src/hooks";
import Vaults from "./JoinedVaults/Vaults";
import { TokenBalances } from "./TokenBalances/TokenBalances";
import Transactions from "./Transactions/Transactions";
import { TraxReferralEarning } from "./TraxReferralEarning/TraxReferralEarning";
import { WalletAndStakingPoint } from "./WalletAndStakingPoint/WalletAndStakingPoint";
import {
	WalletAndEarnings,
	PointsEarnings,
	ReferralLink,
	Vaults as VaultsShared,
	TokenBalances as TokenBalancesShared,
	Transactions as TransactionsShared,
} from "@beratrax/ui";

function Dashboard() {
	const { currentWallet } = useWallet();
	useDeviceInfo();

	return (
		// TODO: figure out why scroll is not working without overflow
		<div className="overflow-auto font-arame-mono" id="dashboard">
			{/* <WalletAndStakingPoint /> */}
			<WalletAndEarnings connectWallet={() => {}} />
			<div className="flex flex-col mx-4 gap-y-4 mt-4 mb-32">
				{currentWallet ? (
					<>
						{/* <TraxReferralEarning /> */}
						<PointsEarnings />
						{/* <ReferralLinkOld /> */}
						<ReferralLink />
						{/* <Vaults /> */}
						<VaultsShared />
						{/* <TokenBalances /> */}
						<TokenBalancesShared />
						{/* <Transactions /> */}
						<TransactionsShared />
					</>
				) : (
					<EmptyComponent style={{ paddingTop: 50, paddingBottom: 50 }}>Sign in/up to view your dashboard.</EmptyComponent>
				)}
			</div>
		</div>
	);
}

export default Dashboard;
