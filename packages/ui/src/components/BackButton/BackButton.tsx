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
    <View className={`bg-btnBgSecondary px-4 py-3 rounded-lg ${className}`} pointerEvents="box-none">
      <TouchableOpacity onPress={onClick} style={{ width: 16, height: 16 }}>
        <View className="relative">
          <View className="absolute -top-2 -left-2">
            <SvgImage source={Backiconbg} height={24} width={24} />
          </View>
          <View className="absolute left-0.5">
            <SvgImage source={Backiconarrow} height={12} width={12} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default BackButton;

