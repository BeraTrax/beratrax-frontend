/// <reference types="vite/client" />
/// <reference types="nativewind/types" />

import { ExternalProvider } from "@ethersproject/providers";
declare global {
  interface Window {
    ethereum?: ExternalProvider;
    gtag?: any;
  }
}

declare module "*.png" {
  const value: ImageSourcePropType;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}
