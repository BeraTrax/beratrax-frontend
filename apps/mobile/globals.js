global.Buffer = require("buffer").Buffer;

// eslint-disable-next-line import/first
import { install } from "react-native-quick-crypto";

install();

// Needed so that 'stream-http' chooses the right default protocol.
global.location = {
	protocol: "file:",
};

global.process.version = "v16.0.0";
if (!global.process.version) {
	global.process = require("process");
	console.log({ process: global.process });
}

process.browser = true;

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
