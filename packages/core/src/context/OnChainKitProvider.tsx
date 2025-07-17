// import type { ReactNode } from "react";
// // import { OnchainKitProvider } from "@coinbase/onchainkit";
// import { berachain } from "viem/chains";
// import { useAccount } from "wagmi";

// export default function OnChainKitProvider(props: { children: ReactNode }) {
// 	const { address } = useAccount();
// 	return (
// 		<OnchainKitProvider
// 			apiKey={import.meta.env.EXPO_PUBLIC_ONCHAINKIT_API_KEY}
// 			projectId={import.meta.env.EXPO_PUBLIC_CDP_PROJECT_ID}
// 			chain={berachain}
// 			address={address}
// 		>
// 			{props.children}
// 		</OnchainKitProvider>
// 	);
// }
