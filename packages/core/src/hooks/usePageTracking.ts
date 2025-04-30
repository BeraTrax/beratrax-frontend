import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logPageView } from "./../utils/analytics";

function usePageTracking() {
	const location = useLocation();

	useEffect(() => {
		try {
			logPageView();
		} catch (error) {
			console.error("Failed to track page view", error);
		}
	}, [location.pathname, location.search]);
}

export default usePageTracking;
