import { CoinStackIcon } from "../../icons/CoinStack";
import { FC, useMemo, memo } from "react";
import { DollarIcon } from "../../icons/Dollar";
import { Pressable, View } from "react-native";
import Colors from "@beratrax/typescript-config/Colors";

interface IProps {
	showInUsd: boolean;
	handleToggleShowInUsdc: () => void;
}

const CONTAINER_CLASS = "flex items-center justify-center";
const PRESSABLE_CLASS = "flex flex-row items-center bg-gray-800 rounded-xl p-1 border border-gray-700 gap-1";
const ICON_CONTAINER_CLASS = "flex items-center justify-center w-8 h-8 rounded-lg";

const UsdToggleComponent: FC<IProps> = ({ showInUsd, handleToggleShowInUsdc }) => {
	const pressableStyle = useMemo(
		() => ({
			opacity: 1,
			transform: [{ scale: 1 }],
		}),
		[]
	);

	const pressedStyle = useMemo(
		() => ({
			opacity: 0.8,
			transform: [{ scale: 0.98 }],
		}),
		[]
	);

	const dollarViewStyle = useMemo(
		() => ({
			backgroundColor: showInUsd ? Colors.bgPrimaryOpacity10 : "transparent",
			borderWidth: showInUsd ? 1 : 0,
			borderColor: showInUsd ? Colors.borderLightOpacity20 : "transparent",
		}),
		[showInUsd]
	);

	const coinViewStyle = useMemo(
		() => ({
			backgroundColor: !showInUsd ? Colors.bgPrimaryOpacity10 : "transparent",
			borderWidth: !showInUsd ? 1 : 0,
			borderColor: !showInUsd ? Colors.borderLightOpacity20 : "transparent",
		}),
		[showInUsd]
	);

	const dollarIconColor = useMemo(() => (showInUsd ? Colors.bgPrimary : Colors.textGrey), [showInUsd]);

	const coinIconColor = useMemo(() => (!showInUsd ? Colors.bgPrimary : Colors.textGrey), [showInUsd]);

	return (
		<View className={CONTAINER_CLASS}>
			<Pressable
				className={PRESSABLE_CLASS}
				onPress={handleToggleShowInUsdc}
				style={({ pressed }) => (pressed ? pressedStyle : pressableStyle)}
			>
				<View className={ICON_CONTAINER_CLASS} style={dollarViewStyle}>
					<DollarIcon size={18} color={dollarIconColor} />
				</View>

				<View className={ICON_CONTAINER_CLASS} style={coinViewStyle}>
					<CoinStackIcon size={18} color={coinIconColor} />
				</View>
			</Pressable>
		</View>
	);
};

export const UsdToggle = memo(UsdToggleComponent);
