import { useEffect } from "react";
import { Image } from "react-native";
import { PREFETCH_IMAGE_URLS } from "../config/constants/prefetch_images";

/**
 * Hook that silently prefetches all pool images in the background
 * Call this once at app startup - no UI, just background caching
 */
export const useBackgroundImagePrefetch = (): void => {
	useEffect(() => {
		const prefetchImagesInBackground = async (): Promise<void> => {
			try {
				console.log(`🖼️ Starting to prefetch ${PREFETCH_IMAGE_URLS.length} images in background...`);

				// Prefetch images in smaller batches to be less aggressive
				const batchSize = 5;
				let completed = 0;

				for (let i = 0; i < PREFETCH_IMAGE_URLS.length; i += batchSize) {
					const batch = PREFETCH_IMAGE_URLS.slice(i, i + batchSize);

					// Process batch with a small delay between batches
					const batchPromises = batch.map(async (url) => {
						try {
							await Image.prefetch(url);
							completed++;
							return { url, success: true };
						} catch (error) {
							// Silently handle errors - don't spam console
							console.warn(`Failed to prefetch: ${url}`);
							completed++;
							return { url, success: false };
						}
					});

					await Promise.all(batchPromises);

					// Small delay between batches to be gentle on the system
					if (i + batchSize < PREFETCH_IMAGE_URLS.length) {
						await new Promise((resolve) => setTimeout(resolve, 100));
					}
				}

				console.log(`✅ Background image prefetch completed: ${completed}/${PREFETCH_IMAGE_URLS.length} images`);
			} catch (error) {
				console.warn("Background image prefetch encountered an error:", error);
			}
		};

		// Start prefetching after a short delay to let the app settle
		const timeoutId = setTimeout(prefetchImagesInBackground, 500);

		return () => clearTimeout(timeoutId);
	}, []);
};
