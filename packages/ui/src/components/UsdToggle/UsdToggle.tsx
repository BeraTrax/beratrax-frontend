import { CoinStackIcon } from "../../icons/CoinStack";
import { FC } from "react";
import { DollarIcon } from "../../icons/Dollar";
import { Pressable, View } from "react-native";
import Colors from "@beratrax/typescript-config/Colors";

interface IProps {
	showInUsd: boolean;
	handleToggleShowInUsdc: () => void;
}

export const UsdToggle: FC<IProps> = ({ showInUsd, handleToggleShowInUsdc }) => {
	return (
		<View className="flex items-center justify-center">
			<Pressable
				className="flex flex-row items-center bg-gray-800 rounded-xl p-1 border border-gray-700 gap-1"
				onPress={handleToggleShowInUsdc}
				style={({ pressed }) => ({
					opacity: pressed ? 0.8 : 1,
					transform: [{ scale: pressed ? 0.98 : 1 }],
				})}
			>
				<View
					className="flex items-center justify-center w-8 h-8 rounded-lg"
					style={{
						backgroundColor: showInUsd ? Colors.bgPrimaryOpacity10 : "transparent",
						borderWidth: showInUsd ? 1 : 0,
						borderColor: showInUsd ? Colors.borderLightOpacity20 : "transparent",
					}}
				>
					<DollarIcon size={18} color={showInUsd ? Colors.bgPrimary : Colors.textGrey} />
				</View>

				<View
					className="flex items-center justify-center w-8 h-8 rounded-lg"
					style={{
						backgroundColor: !showInUsd ? Colors.bgPrimaryOpacity10 : "transparent",
						borderWidth: !showInUsd ? 1 : 0,
						borderColor: !showInUsd ? Colors.borderLightOpacity20 : "transparent",
					}}
				>
					<CoinStackIcon size={18} color={!showInUsd ? Colors.bgPrimary : Colors.textGrey} />
				</View>
			</Pressable>
		</View>
	);
};
