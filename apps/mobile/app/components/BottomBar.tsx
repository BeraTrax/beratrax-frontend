import React from "react";
import { View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import BottomBarItem from "./BottomBarItem";

type TabOption = {
	name: string;
	tabBarLabel: string;
	activeIcon: any;
	inactiveIcon: any;
	route: string;
	target?: string;
};

interface BottomBarProps {
	tabOptions: Record<string, TabOption>;
}

const BottomBar = ({ tabOptions }: BottomBarProps) => {
	const pathname = usePathname();
	const router = useRouter();

	// Add routes where tab bar should be hidden
	const hiddenTabBarRoutes = [
		/^\/Earn\/[^\/]+$/, // Vault details page
		// Add more route patterns here as needed
		// Example: /^\/Stats\/details$/,
		// Example: /^\/Dashboard\/settings$/,
	];

	// Check if the current path matches any route where tab bar should be hidden
	const shouldHideTabBar = hiddenTabBarRoutes.some((pattern) => pathname.match(pattern));

	if (shouldHideTabBar) {
		return null;
	}

	// Convert tabs object to array and sort them in the order we want
	const tabsArray = Object.entries(tabOptions).map(([key, value]) => ({
		key,
		...value,
	}));

	const handleNavigation = (route: string, target?: string) => {
		// Similar to the web version's handleNavigation
		if (target === "noop") return;
		router.push(route);
	};

	return (
		<View className="p-0 border-0 bg-bgDark w-full flex flex-row justify-around rounded-t-[20px] overflow-hidden absolute bottom-0">
			{tabsArray.map((tab) => {
				const isActive = pathname === tab.route;

				return (
					<BottomBarItem
						key={tab.key}
						isActive={isActive}
						Icon={isActive ? tab.activeIcon : tab.inactiveIcon}
						label={tab.tabBarLabel}
						onPress={() => handleNavigation(tab.route, tab.target)}
					/>
				);
			})}
		</View>
	);
};

export default BottomBar;
