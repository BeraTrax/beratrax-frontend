import { backendApi } from "./index";

/**
 * Type representing geolocation API response.
 */
export interface GeolocationResponse {
	isBlocked: boolean;
	country?: string;
	countryName?: string;
	region?: string;
	city?: string;
	ip?: string;
	message: string;
}

/**
 * Type representing location info response (no blocking).
 */
export interface LocationInfoResponse {
	message: string;
	data: {
		ip: string;
		country?: string;
		region?: string;
		city?: string;
		ll?: number[];
		timezone?: string;
	};
}

/**
 * Check if user should be blocked based on geolocation.
 * Returns 200 for allowed users, 403 for blocked users.
 */
export const checkGeolocationBlocking = async (): Promise<GeolocationResponse> => {
	try {
		const response = await backendApi.get<GeolocationResponse>("/geolocation/check");
		return response.data;
	} catch (error: any) {
		// Handle 403 (blocked) status specifically
		if (error.response?.status === 403) {
			return error.response.data as GeolocationResponse;
		}

		// For any other error, default to allow access to prevent false blocking
		console.error("Geolocation API error:", error);
		return {
			isBlocked: false,
			message: "Unable to determine location, access granted",
		};
	}
};

/**
 * Get location information without blocking logic.
 */
export const getLocationInfo = async (): Promise<LocationInfoResponse> => {
	try {
		const response = await backendApi.get<LocationInfoResponse>("/geolocation/info");
		return response.data;
	} catch (error) {
		console.error("Location info API error:", error);
		throw error;
	}
};
