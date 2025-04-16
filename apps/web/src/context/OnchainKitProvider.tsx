import type { ReactNode } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { berachain } from "viem/chains";

export default function OnChainKitProvider(props: { children: ReactNode }) {
    return (
    <OnchainKitProvider
        apiKey={import.meta.env.REACT_APP_ONCHAINKIT_API_KEY}
        projectId={import.meta.env.REACT_APP_CDP_PROJECT_ID}
        chain={berachain}
    >
        {props.children}
    </OnchainKitProvider>
    )
}
