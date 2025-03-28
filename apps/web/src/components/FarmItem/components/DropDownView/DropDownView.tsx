import { IS_LEGACY } from "@beratrax/core/src/config/constants";
import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { useApp } from "@beratrax/core/src/hooks";
import { useAppDispatch, useAppSelector } from "@beratrax/core/src/state";
import { setFarmDetailInputOptions } from "@beratrax/core/src/state/farms/farmsReducer";
import { FarmDetailInputOptions } from "@beratrax/core/src/state/farms/types";
import { FarmTransactionType } from "@beratrax/core/src/types/enums";
import { useState } from "react";
import { RiArrowDownSLine } from "react-icons/ri";
import PoolButton from "web/src/components/PoolButton/PoolButton";
import { Tabs } from "web/src/components/Tabs/Tabs";
import { Description } from "web/src/components/FarmItem/components/Description/Description";
import DetailInput from "web/src/components/FarmItem/components/DetailInput/DetailInput";
import Details from "web/src/components/FarmItem/components/Details/Details";
import "./DropDownView.css";

export const DropDownView: React.FC<{ farm: PoolDef }> = ({ farm }) => {
  const { lightMode } = useApp();
  const [showMoreDetail, setShowMoreDetail] = useState(false);
  const transactionType = useAppSelector((state) =>
    IS_LEGACY ? FarmTransactionType.Withdraw : state.farms.farmDetailInputOptions.transactionType
  );
  const dispatch = useAppDispatch();

  const setFarmOptions = (opt: Partial<FarmDetailInputOptions>) => {
    dispatch(setFarmDetailInputOptions(opt));
  };

  return (
    <div className={`dropdown_menu ${lightMode && "dropdown_menu--light"}`}>
      <div className="basic_container">
        <div className="type_tab">
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
        </div>
        <div className="type_selector">
          <p
            onClick={() => !IS_LEGACY && setFarmOptions({ transactionType: FarmTransactionType.Deposit })}
            className={transactionType === FarmTransactionType.Deposit ? "active" : ""}
          >
            {FarmTransactionType.Deposit}
          </p>
          <p
            onClick={() => !IS_LEGACY && setFarmOptions({ transactionType: FarmTransactionType.Withdraw })}
            className={transactionType === FarmTransactionType.Withdraw ? "active" : ""}
          >
            {FarmTransactionType.Withdraw}
          </p>
        </div>
        <div className="right_container">
          <Description farm={farm} />
          <DetailInput farm={farm} />
        </div>
      </div>

      {!showMoreDetail ? (
        <div
          className={`see_details_dropdown ${lightMode && "see_details_dropdown--light"}`}
          onClick={() => setShowMoreDetail(true)}
        >
          <p className={`see_details_description ${lightMode && "see_details_description--light"}`}>See more details</p>
          <RiArrowDownSLine />
        </div>
      ) : (
        <Details farm={farm} onClick={() => setShowMoreDetail(false)} />
      )}
    </div>
  );
};
