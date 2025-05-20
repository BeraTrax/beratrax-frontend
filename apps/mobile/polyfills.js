// Import react-native-get-random-values before anything else
import "react-native-get-random-values";

// Polyfills for React Native
import { Buffer as NodeBuffer } from "buffer";

// Make Buffer available globally - it's important to check if it's already defined
// and also ensure we're not recursively redefining it
if (typeof global.Buffer === "undefined") {
	// Direct assignment instead of using ||
	global.Buffer = NodeBuffer;
}

// Ensure process is available for libraries that expect it
global.process = global.process || {};
global.process.env = global.process.env || {};

// Add base64 encoding/decoding functions if not available
if (typeof global.btoa !== "function") {
	global.btoa = function (str) {
		return global.Buffer.from(str, "binary").toString("base64");
	};
}

if (typeof global.atob !== "function") {
	global.atob = function (b64Encoded) {
		return global.Buffer.from(b64Encoded, "base64").toString("binary");
	};
}
