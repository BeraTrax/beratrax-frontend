import { IS_LEGACY } from "@beratrax/core/src/config/constants";
import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { useApp } from "@beratrax/core/src/hooks";
import { useAppDispatch, useAppSelector } from "@beratrax/core/src/state";
import { setFarmDetailInputOptions } from "@beratrax/core/src/state/farms/farmsReducer";
import { FarmDetailInputOptions } from "@beratrax/core/src/state/farms/types";
import { FarmTransactionType } from "@beratrax/core/src/types/enums";
import { useState } from "react";
import { RiArrowDownSLine } from "react-icons/ri";
import PoolButton from "ui/src/components/PoolButton/PoolButton";
import { Tabs } from "ui/src/components/Tabs/Tabs";
import { Description } from "ui/src/components/FarmItem/components/Description/Description";
import DetailInput from "ui/src/components/FarmItem/components/DetailInput/DetailInput";
// import Details from "ui/src/components/FarmItem/components/Details/Details";
import "./DropDownView.css";
import { View, Text } from "react-native";

export const DropDownView: React.FC<{ farm: PoolDef }> = ({ farm }) => {
  const { lightMode } = useApp();
  const [showMoreDetail, setShowMoreDetail] = useState(false);
  const transactionType = useAppSelector((state) =>
    IS_LEGACY ? FarmTransactionType.Withdraw : state.farms.farmDetailInputOptions.transactionType,
  );
  const dispatch = useAppDispatch();

  const setFarmOptions = (opt: Partial<FarmDetailInputOptions>) => {
    dispatch(setFarmDetailInputOptions(opt));
  };

  return (
    <View className={`dropdown_menu ${lightMode && "dropdown_menu--light"}`}>
      <View className="basic_container">
        <View className="type_tab">
          <Tabs>
            <PoolButton
              onClick={() => !IS_LEGACY && setFarmOptions({ transactionType: FarmTransactionType.Deposit })}
              description={FarmTransactionType.Deposit}
              active={transactionType === FarmTransactionType.Deposit}
            />
            <PoolButton
              onClick={() => !IS_LEGACY && setFarmOptions({ transactionType: FarmTransactionType.Withdraw })}
              description={FarmTransactionType.Withdraw}
              active={transactionType === FarmTransactionType.Withdraw}
            />
          </Tabs>
        </View>
        <View className="type_selector">
          <Text
            onClick={() => !IS_LEGACY && setFarmOptions({ transactionType: FarmTransactionType.Deposit })}
            className={transactionType === FarmTransactionType.Deposit ? "active" : ""}
          >
            {FarmTransactionType.Deposit}
          </Text>
          <Text
            onClick={() => !IS_LEGACY && setFarmOptions({ transactionType: FarmTransactionType.Withdraw })}
            className={transactionType === FarmTransactionType.Withdraw ? "active" : ""}
          >
            {FarmTransactionType.Withdraw}
          </Text>
        </View>
        <View className="right_container">
          <Description farm={farm} />
          <DetailInput farm={farm} />
        </View>
      </View>

      {!showMoreDetail ? (
        <View
          className={`see_details_dropdown ${lightMode && "see_details_dropdown--light"}`}
          onClick={() => setShowMoreDetail(true)}
        >
          <Text className={`see_details_description ${lightMode && "see_details_description--light"}`}>
            See more details
          </Text>
          <RiArrowDownSLine />
        </View>
      ) : (
        // <Details farm={farm} onClick={() => setShowMoreDetail(false)} />
        <View>Details</View>
      )}
    </View>
  );
};

