import React from "react";
import { View, StyleSheet } from "react-native";
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
	hiddenTabBarRoutes: RegExp[];
}

const BottomBar = ({ tabOptions, hiddenTabBarRoutes }: BottomBarProps) => {
	const pathname = usePathname();
	const router = useRouter();

	// Check if the current path matches any route where tab bar should be hidden
	const shouldHideTabBar = hiddenTabBarRoutes.some((pattern) => pathname.match(pattern));

	if (shouldHideTabBar) {
		return null;
	}

	// Convert tabs object to array and sort them in the order we want
	const tabsArray = Object.entries(tabOptions).map(([key, value], index) => ({
		key,
		...value,
		position: index === 0 ? "left" : index === Object.keys(tabOptions).length - 1 ? "right" : "middle",
	}));

	const handleNavigation = (route: string, target?: string) => {
		// Similar to the web version's handleNavigation
		if (target === "noop") return;
		router.push(route);
	};

	return (
		<View className="p-0 border-0 bg-bgDark w-full flex flex-row justify-around rounded-t-[20px] overflow-hidden absolute bottom-0 p-0">
			{tabsArray.map((tab, index) => {
				const isActive = pathname === tab.route;

				return (
					<BottomBarItem
						key={tab.key}
						isActive={isActive}
						Icon={isActive ? tab.activeIcon : tab.inactiveIcon}
						label={tab.tabBarLabel}
						position={tab.position}
						onPress={() => handleNavigation(tab.route, tab.target)}
					/>
				);
			})}
		</View>
	);
};

export default BottomBar;
