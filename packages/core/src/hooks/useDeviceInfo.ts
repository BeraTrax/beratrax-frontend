import { useEffect } from "react";
import { UAParser } from "ua-parser-js";
import { trackDAppDeviceInfo } from "../utils/analytics";
import useWallet from "./useWallet";

export function useDeviceInfo() {
	const { currentWallet } = useWallet();

	useEffect(() => {
		const userAgent = navigator.userAgent;
		if (userAgent && currentWallet) {
			const parser = new UAParser(userAgent);
			const result = parser.getResult();

			const deviceInfo = {
				walletAddress: currentWallet,
				browser: {
					name: result.browser.name,
					version: result.browser.version,
					major: result.browser.major,
					type: result.browser.type,
				},
				cpu: {
					architecture: result.cpu.architecture,
				},
				device: {
					type: result.device.type,
					vendor: result.device.vendor,
					model: result.device.model,
				},
				engine: {
					name: result.engine.name,
					version: result.engine.version,
				},
				os: {
					name: result.os.name,
					version: result.os.version,
				},
			};

			trackDAppDeviceInfo(deviceInfo);
		}
	}, [currentWallet, navigator.userAgent]);
}
