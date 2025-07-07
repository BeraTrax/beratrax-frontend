import Backiconarrow from "@beratrax/core/src/assets/images/backiconarrow.svg";
import Backiconbg from "@beratrax/core/src/assets/images/backiconbg.svg";
import { SvgImage } from "ui/src/components/SvgImage/SvgImage";
import { FC } from "react";
import { View, TouchableOpacity } from "react-native";

interface IProps {
	onClick: () => void;
	className?: string;
}

const BackButton: FC<IProps> = ({ className, onClick }) => {
	return (
		<View className={`bg-btnBgSecondary rounded-lg ${className}`} pointerEvents="box-none">
			<TouchableOpacity onPress={onClick} style={{ width: 24, height: 24 }}>
				<View className="relative w-6 h-6">
					<SvgImage source={Backiconbg} height={24} width={24} />
					<View className="absolute inset-0 items-center justify-center">
						<SvgImage source={Backiconarrow} height={12} width={12} />
					</View>
				</View>
			</TouchableOpacity>
		</View>
	);
};

export default BackButton;
