import { CoinIcon } from "../../icons/Coin";
import { FC } from "react";
import { DollarIcon } from "../../icons/Dollar";
import { Pressable, View } from "react-native";

interface IProps {
	showInUsd: boolean;
	handleToggleShowInUsdc: () => void;
}

export const UsdToggle: FC<IProps> = ({ showInUsd, handleToggleShowInUsdc }) => {
	return (
		<View className="flex items-center justify-center">
			<Pressable
				className="flex flex-row items-center bg-gray-800 rounded-xl p-1 gap-1 hover:bg-gray-700 transition-all duration-200"
				onPress={handleToggleShowInUsdc}
			>
				{/* Left side - Coin icon */}
				<View
					className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
						!showInUsd ? "bg-green-500/10 shadow-sm shadow-green-500/20" : "bg-transparent"
					}`}
				>
					<CoinIcon size={20} color={showInUsd ? "#22c55e" : "#6b7280"} />
				</View>

				{/* Right side - Dollar icon */}
				<View
					className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
						showInUsd ? "bg-green-500/10 shadow-sm shadow-green-500/20" : "bg-transparent"
					}`}
				>
					<DollarIcon size={20} color={!showInUsd ? "#22c55e" : "#6b7280"} />
				</View>
			</Pressable>
		</View>
	);
};
