import pools_json, { type PoolDef } from "@beratrax/core/src/config/constants/pools_json";

/**
 * Extracts all unique image URLs from pools_json for prefetching
 * This includes: platform_logo, secondary_platform_logo, logo1, logo2, logo3, rewards1, rewards2
 */
const extractUniqueImageUrls = (): string[] => {
	const imageUrls = new Set<string>();

	// Add the BERA logo from tokenNamesAndImages constant
	imageUrls.add(
		"https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png"
	);

	// Add the Transak logo from assets
	imageUrls.add(require("@beratrax/core/src/assets/images/transaklogo.png"));

	// Extract URLs from each pool
	pools_json.forEach((pool: PoolDef) => {
		// Platform logos
		if (pool.platform_logo) {
			imageUrls.add(pool.platform_logo);
		}
		if (pool.secondary_platform_logo) {
			imageUrls.add(pool.secondary_platform_logo);
		}

		// Token logos
		if (pool.logo1) {
			imageUrls.add(pool.logo1);
		}
		if (pool.logo2) {
			imageUrls.add(pool.logo2);
		}
		if (pool.logo3) {
			imageUrls.add(pool.logo3);
		}

		// Reward logos
		if (pool.rewards1) {
			imageUrls.add(pool.rewards1);
		}
		if (pool.rewards2) {
			imageUrls.add(pool.rewards2);
		}
	});

	// Convert Set to Array and filter out any invalid URLs
	return Array.from(imageUrls).filter((url) => {
		// Only include valid HTTP/HTTPS URLs
		return url.startsWith("http://") || url.startsWith("https://");
	});
};

/**
 * Array of all unique image URLs from pools_json that should be prefetched
 * This includes platform logos, token logos, and reward logos
 */
export const PREFETCH_IMAGE_URLS = extractUniqueImageUrls();

/**
 * Platform logos specifically (useful if you want to prefetch only platform images)
 */
export const PLATFORM_LOGOS = Array.from(
	pools_json.reduce((acc: Set<string>, pool: PoolDef) => {
		if (pool.platform_logo) {
			acc.add(pool.platform_logo);
		}
		if (pool.secondary_platform_logo) {
			acc.add(pool.secondary_platform_logo);
		}
		return acc;
	}, new Set<string>())
);

/**
 * Token logos specifically (useful if you want to prefetch only token images)
 */
export const TOKEN_LOGOS = Array.from(
	pools_json.reduce((acc: Set<string>, pool: PoolDef) => {
		if (pool.logo1) acc.add(pool.logo1);
		if (pool.logo2) acc.add(pool.logo2);
		if (pool.logo3) acc.add(pool.logo3);
		return acc;
	}, new Set<string>())
);

/**
 * Reward logos specifically (useful if you want to prefetch only reward images)
 */
export const REWARD_LOGOS = Array.from(
	pools_json.reduce((acc: Set<string>, pool: PoolDef) => {
		if (pool.rewards1) acc.add(pool.rewards1);
		if (pool.rewards2) acc.add(pool.rewards2);
		return acc;
	}, new Set<string>())
);
