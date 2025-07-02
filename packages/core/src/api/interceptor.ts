import axios from "axios";

/**
 * Cache time to live in milliseconds
 */
const TTL = 1000 * 60 * 5; // 5 minutes

/**
 * Helper function to safely set items in sessionStorage
 */
const safeSetStorage = (key: string, value: string) => {
	try {
		// First try to set the item directly
		sessionStorage.setItem(key, value);
	} catch (e) {
		if (e instanceof Error && e.name === "QuotaExceededError") {
			// If storage is full, clear old items
			const keys = Object.keys(sessionStorage);
			const oldestKeys = keys
				.filter((k) => k.startsWith("cache-time "))
				.sort((a, b) => {
					const timeA = Number(sessionStorage.getItem(a)) || 0;
					const timeB = Number(sessionStorage.getItem(b)) || 0;
					return timeA - timeB;
				})
				.slice(0, Math.ceil(keys.length / 2)); // Remove oldest 50% of cache

			// Remove oldest items
			oldestKeys.forEach((timeKey) => {
				const cacheKey = timeKey.replace("cache-time ", "cache ");
				sessionStorage.removeItem(timeKey);
				sessionStorage.removeItem(cacheKey);
			});

			// Try setting the item again
			try {
				sessionStorage.setItem(key, value);
			} catch (e) {
				console.warn("Failed to set cache after cleanup:", e);
			}
		} else {
			console.warn("Cache storage failed:", e);
		}
	}
};

/**
 * Request Interceptor which checks if the request is cached and returns the cached data if it is
 */
axios.interceptors.request.use(
	function (config) {
		// Executes before each request and takes the request `config` object as an argument
		if (config.cache) {
			// Checks if caching is enabled for the request
			const oldDataTimestamp = sessionStorage.getItem(`cache-time ${config.url}`); // Gets the timestamp of the cached data from sessionStorage
			if (oldDataTimestamp && Number(oldDataTimestamp) + TTL > Date.now()) {
				// Checks if the cached data is still valid based on the TTL (time-to-live) and current time
				const oldData = sessionStorage.getItem(`cache ${config.url}`); // Gets the cached data from sessionStorage
				if (oldData) {
					// Checks if there is actually cached data
					config.adapter = function (config) {
						// Overrides the default adapter function with a new function that will return the cached data
						return new Promise((res, rej) => {
							return res({
								data: oldData, // The cached data
								status: 200, // The HTTP status code
								statusText: "OK", // The HTTP status message
								headers: { "content-type": "application/json; charset=utf-8" }, // The response headers
								config,
								request: {},
							});
						});
					};
				}
			} else {
				// If the cached data is not valid or doesn't exist, remove it from sessionStorage
				sessionStorage.removeItem(`cache-time ${config.url}`);
				sessionStorage.removeItem(`cache ${config.url}`);
			}
		}
		return config; // Returns the modified or unmodified request config object
	},
	function (error) {
		return Promise.reject(error); // Returns a rejected Promise in case of an error
	}
);

// Add a response interceptor
axios.interceptors.response.use(
	function (config) {
		// Executes after each successful response and takes the response `config` object as an argument
		if (config.config.cache) {
			safeSetStorage(`cache ${config.config.url}`, JSON.stringify(config.data));
			safeSetStorage(`cache-time ${config.config.url}`, Date.now().toString());
		}
		return config; // Returns the response config object
	},
	function (error) {
		return Promise.reject(error); // Returns a rejected Promise in case of an error
	}
);

export {};
