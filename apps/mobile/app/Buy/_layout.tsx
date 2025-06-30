import { Environments, TransakConfig, Events, EventTypes, Order } from "@transak/react-native-sdk";
import { useAccount } from "wagmi";
import { Buy } from "@beratrax/ui";

export default function BuyLayout() {
	const { address } = useAccount();
	const transakConfig: TransakConfig = {
		apiKey: "cee219b7-35f1-47ed-92dc-65a60c0a4d01",
		environment: Environments.PRODUCTION,
		cryptoCurrencyCode: "BERA",
		network: "berachain",
		defaultFiatCurrency: "USD",
		walletAddress: address,
		themeColor: "112233",
	};

	const onTransakEventHandler = (event: EventTypes, data: Order) => {
		switch (event) {
			case Events.ORDER_CREATED:
				console.log(event, data);
				break;

			case Events.ORDER_PROCESSING:
				console.log(event, data);
				break;

			case Events.ORDER_COMPLETED:
				console.log(event, data);
				break;

			default:
				console.log(event, data);
		}
	};

	return <Buy transakConfig={transakConfig} onTransakEventHandler={onTransakEventHandler} />;
}
