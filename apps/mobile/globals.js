global.Buffer = require("buffer").Buffer;

// eslint-disable-next-line import/first
import { install } from "react-native-quick-crypto";

install();

// Needed so that 'stream-http' chooses the right default protocol.
global.location = {
	protocol: "file:",
};

// Fix process version safely to avoid readonly property errors
if (!global.process) {
	global.process = require("process");
}

// Only set version if it doesn't exist or is writable
try {
	if (!global.process.version) {
		global.process.version = "v16.0.0";
	}
} catch (error) {
	// Ignore readonly property errors
	console.log("Could not set process.version (readonly):", error.message);
}

process.browser = true;

// Add base64FromArrayBuffer polyfill for Web3Auth early in the loading process
if (typeof global.base64FromArrayBuffer !== "function") {
	global.base64FromArrayBuffer = function (buffer, urlSafe = false) {
		try {
			// Ensure we have a valid ArrayBuffer or Uint8Array
			if (!buffer) {
				throw new Error("Buffer is required");
			}

			// Convert various buffer types to Uint8Array first
			let uint8Array;
			if (buffer instanceof ArrayBuffer) {
				uint8Array = new Uint8Array(buffer);
			} else if (buffer instanceof Uint8Array) {
				uint8Array = buffer;
			} else if (Array.isArray(buffer) || buffer.length !== undefined) {
				uint8Array = new Uint8Array(buffer);
			} else {
				throw new Error("Invalid buffer type");
			}

			// Use the Buffer constructor directly instead of global.Buffer to avoid circular refs
			const { Buffer } = require("buffer");
			const nodeBuffer = Buffer.from(uint8Array);
			let base64String = nodeBuffer.toString("base64");

			if (urlSafe) {
				// Convert to URL-safe base64
				base64String = base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
			}

			return base64String;
		} catch (error) {
			console.error("Error in base64FromArrayBuffer:", error);
			throw error;
		}
	};
}

// Add base64ToArrayBuffer polyfill for Web3Auth
if (typeof global.base64ToArrayBuffer !== "function") {
	global.base64ToArrayBuffer = function (base64String, removeLinebreaks = true) {
		try {
			if (!base64String) {
				throw new Error("Base64 string is required");
			}

			let cleanBase64 = base64String;

			// Remove linebreaks if requested
			if (removeLinebreaks) {
				cleanBase64 = cleanBase64.replace(/[\r\n]/g, "");
			}

			// Convert URL-safe base64 back to regular base64
			cleanBase64 = cleanBase64.replace(/-/g, "+").replace(/_/g, "/");

			// Add padding if necessary
			while (cleanBase64.length % 4) {
				cleanBase64 += "=";
			}

			// Use the Buffer constructor directly
			const { Buffer } = require("buffer");
			const nodeBuffer = Buffer.from(cleanBase64, "base64");

			// Convert to ArrayBuffer
			const arrayBuffer = new ArrayBuffer(nodeBuffer.length);
			const uint8Array = new Uint8Array(arrayBuffer);

			for (let i = 0; i < nodeBuffer.length; i++) {
				uint8Array[i] = nodeBuffer[i];
			}

			return arrayBuffer;
		} catch (error) {
			console.error("Error in base64ToArrayBuffer:", error);
			throw error;
		}
	};
}

// Provides global polyfills for web APIs in React Native environment

// Polyfill for window object if not defined
if (typeof global.window === "undefined") {
	global.window = global;
}

// Polyfill window.addEventListener and removeEventListener if not defined
if (typeof global.window.addEventListener !== "function") {
	const listeners = {};

	global.window.addEventListener = (event, callback) => {
		if (!listeners[event]) {
			listeners[event] = new Set();
		}
		listeners[event].add(callback);
		return callback;
	};

	global.window.removeEventListener = (event, callback) => {
		if (listeners[event]) {
			listeners[event].delete(callback);
		}
	};

	global.window.dispatchEvent = (event) => {
		if (listeners[event.type]) {
			for (const callback of listeners[event.type]) {
				callback(event);
			}
		}
	};
}

// Ensure document exists for libraries that expect it
if (typeof global.document === "undefined") {
	global.document = {
		addEventListener: global.window.addEventListener,
		removeEventListener: global.window.removeEventListener,
	};
}

// Add CustomEvent polyfill
if (typeof global.CustomEvent !== "function") {
	global.CustomEvent = function CustomEvent(type, options = {}) {
		const event = {
			type,
			detail: options.detail || null,
			bubbles: !!options.bubbles,
			cancelable: !!options.cancelable,
			timeStamp: Date.now(),
			defaultPrevented: false,
			preventDefault: function () {
				this.defaultPrevented = true;
			},
		};
		return event;
	};
}

// Add Event polyfill if needed
if (typeof global.Event !== "function") {
	global.Event = function Event(type) {
		return {
			type,
			timeStamp: Date.now(),
		};
	};
}

// Export to ensure this file is processed
export default {};
