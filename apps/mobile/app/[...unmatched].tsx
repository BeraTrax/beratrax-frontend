import { Redirect } from "expo-router";

export default function UnmatchedRoute() {
	// Redirect to the home/dashboard route for any unmatched routes
	return <Redirect href="/" />;
}
