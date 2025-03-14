import ReactGA from "react-ga4";
import { REACT_APP_GA_MEASUREMENT_ID } from "@beratrax/core/src/config/constants";

export enum EVENT {
  LOGIN = "login",
  TRANSACTION = "transaction",
  DEVICE_BROWSER = "device_browser",
  DEVICE_OS = "device_os",
  VISIT = "visit",
  LOCATION = "location",
  LANGUAGE = "language",
}

// Initialize GA4 with measurement ID
export const initGA = () => {
  console.log("GA4 init");
  ReactGA.initialize(REACT_APP_GA_MEASUREMENT_ID, {
    gtagOptions: {
      debug_mode: true, //logs the sent events to the console
      cookie_flags: "SameSite=None;Secure", //Allow external websites to save cookies on our website
      cookie_domain: "auto", //auto sets the domain to the current domain and it's subdomains
      cookie_update: true, //updates the cookie if it already exists
      cookie_expires: 60 * 60 * 24 * 365 * 7, // 7 years
    },
  });
};

// Page view tracking
export const logPageView = () => {
  ReactGA.send({ hitType: "pageview", page: window.location.pathname + window.location.search });
};

function logEvent(
  eventName: EVENT[keyof EVENT], // Accepts the values of the EVENT enum
  options?: {
    event_label?: string;
    event_category?: string;
    value?: string;
    currency?: string; // Made optional
    transaction_id?: string; // Made optional
    items?: {
      // Made optional
      id: string;
      name: string;
      brand: string;
      category: string;
      variant: string;
      quantity: number;
      price: string;
    }[];
    timestamp?: string; // Added optional timestamp
    nonInteraction?: boolean; // Added optional nonInteraction
  }
) {
  try {
    ReactGA.event({
      category: options?.event_category || "General",
      action: eventName as string,
      label: options?.event_label,
      value: options?.value ? parseInt(options.value) : undefined,
      nonInteraction: options?.nonInteraction ?? false,
    });
  } catch (error) {
    console.error("Error logging event:", error);
  }
}

export function trackLogin(userAddress: string) {
  logEvent(EVENT.LOGIN, {
    event_category: "DApp",
    event_label: JSON.stringify(userAddress),
  });
}

export function trackTransaction(transactionId: string) {
  const tx = btoa(transactionId);
  logEvent(EVENT.TRANSACTION, {
    event_category: "DAppTx",
    event_label: JSON.stringify(transactionId),
  });
}

// Track daily visits to our dapp
export function trackDailyDAppVisit() {
  logEvent(EVENT.VISIT, {
    event_category: "DApp",
    event_label: "Daily Visit",
    nonInteraction: true,
  });
}

export function trackDAppDeviceInfo(deviceInfo: object) {
  logEvent(EVENT.DEVICE_BROWSER, {
    event_category: "DApp",
    event_label: JSON.stringify(deviceInfo),
    nonInteraction: true,
  });
}

export function trackLanguage() {
  const language = navigator.language || (navigator as any).userLanguage;
  logEvent(EVENT.LANGUAGE, {
    event_category: "User",
    event_label: language,
    nonInteraction: true,
  });
}
