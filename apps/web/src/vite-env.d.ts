/// <reference types="vite/client" />
/// <reference types="nativewind/types" />

import { ExternalProvider } from "@ethersproject/providers";

declare global {
	interface Window {
		ethereum?: ExternalProvider;
		gtag?: any;
	}
}
