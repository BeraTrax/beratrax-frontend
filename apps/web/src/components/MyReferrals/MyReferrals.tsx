import { FC } from "react";
import { NotSignedIn } from "web/src/components/NotSignedIn/NotSignedIn";
import { useMyReferrals } from "@beratrax/core/src/hooks";

export const MyReferrals: FC = () => {
	const { currentWallet, referrals } = useMyReferrals();

	return currentWallet ? (
		<div className="bg-bgSecondary rounded-lg p-6 border border-borderDark text-textWhite">
			{referrals && (
				<>
					<h2 className="font-arame-mono uppercase text-xl m-0 mb-4">My referrals</h2>
					{referrals.length > 0 ? (
						<div className="space-y-2">
							{referrals?.map((add) => (
								<div key={add} className="text-textSecondary">
									{add}
								</div>
							))}
						</div>
					) : (
						<p className="text-textSecondary">no referrals yet</p>
					)}
				</>
			)}
		</div>
	) : (
		<NotSignedIn className="mt-4" description="Sign in or sign up to see more details" />
	);
};
