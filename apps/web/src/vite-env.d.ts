/// <reference types="vite/client" />
/// <reference types="nativewind/types" />

import { ExternalProvider } from "@ethersproject/providers";

declare global {
	interface Window {
		ethereum?: ExternalProvider;
		gtag?: any;
	}
}

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.jpeg" {
  const content: string;
  export default content;
}

declare module "*.gif" {
  const content: string;
  export default content;
}

declare module "*.webp" {
  const content: string;
  export default content;
}

