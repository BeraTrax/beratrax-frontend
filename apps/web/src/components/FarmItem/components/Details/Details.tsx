import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { useApp } from "@beratrax/core/src/hooks";
import { useFarmDetails } from "@beratrax/core/src/state/farms/hooks";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { getLpAddressForFarmsPrice, toPreciseNumber } from "@beratrax/core/src/utils/common";
import { useMemo } from "react";
import { RiArrowUpSLine } from "react-icons/ri";
import FarmApyGraph from "web/src/pages/FarmInfo/FarmApyGraph/FarmApyGraph";
import FarmLpGraph from "web/src/pages/FarmInfo/FarmLpGraph/FarmLpGraph";
import "./Details.css";

interface Props {
  farm: PoolDef;
  onClick: () => void;
}

const Details: React.FC<Props> = ({ farm, ...props }) => {
  const { lightMode } = useApp();
  const lpAddress = getLpAddressForFarmsPrice([farm])[0];
  const { farmDetails, isLoading: isFarmLoading } = useFarmDetails();
  const farmData = farmDetails[farm.id];

  const {
    balances,
    totalSupplies,
    prices: {
      [farm.chainId]: { [farm.token1]: price1, [farm.token2!]: price2, [lpAddress]: lpPrice },
    },
  } = useTokens();
  const unstakedTokenValue = useMemo(() => Number(balances[farm.chainId][lpAddress]?.value), [balances]);
  const stakedTokenValue = useMemo(() => Number(balances[farm.chainId][farm.vault_addr]?.value), [balances]);

  return (
    <div className="details">
      <div className={`details_section detials_rate`}>
        <div className={`details_dropdrown_header`}>
          {farm.alt1 ? <img className={`details_logo1`} alt={farm.alt1} src={farm.logo1} /> : null}

          {farm.alt2 ? <img className={`details_logo2`} alt={farm.alt2} src={farm.logo2} /> : null}

          <p className={`details_pair_name ${lightMode && "details_pair_name--light"}`}>{farm.name}</p>
        </div>

        <div className={`token_details`}>
          {farm.alt1 ? (
            <div
              className={`details_single_token ${lightMode && "details_single_token--light"}`}
              style={{ marginRight: "10px" }}
            >
              <img className={`mini_details_image`} alt={farm.alt1} src={farm.logo1} />
              <p>
                {farm.pair1} ={" "}
                {price1.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 3,
                })}
              </p>
            </div>
          ) : null}

          {farm.alt2 ? (
            <div className={`details_single_token ${lightMode && "details_single_token--light"}`}>
              <img className={`mini_details_image`} alt={farm.alt2} src={farm.logo2} />
              <p>
                {farm.pair2} ={" "}
                {price2.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 3,
                })}
              </p>
            </div>
          ) : null}
        </div>
      </div>
      <div className={`details_top_container`}>
        <div className={`details_section detailed_position ${lightMode && "detailed_position--light"}`}>
          <p className={`detailed_position_total ${lightMode && "detailed_position_total--light"}`}>My Position</p>

          <div className={`detailed_header`}>
            <p>Unstaked Position</p>
            <div className={`unstaked_details`}>
              <div className={`unstaked_details_header`}>
                {farm.alt1 ? <img className={`unstaked_images1`} alt={farm.alt1} src={farm.logo1} /> : null}

                {farm.alt2 ? <img className={`unstaked_images2`} alt={farm.alt2} src={farm.logo2} /> : null}

                <p className={`detailed_unstaked_pairs`}>
                  {unstakedTokenValue?.toFixed(3)} {farm.name}
                </p>
              </div>

              <p className={`detailed_unstaked_pairs`}>
                {unstakedTokenValue &&
                  (lpPrice * unstakedTokenValue).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
              </p>
            </div>
          </div>

          <div className={`detailed_header`}>
            <p>Staked Position</p>
            <div className={`unstaked_details`}>
              <div className={`unstaked_details_header`}>
                {farm.alt1 ? <img className={`unstaked_images1`} alt={farm.alt1} src={farm.logo1} /> : null}

                {farm.alt2 ? <img className={`unstaked_images2`} alt={farm.alt2} src={farm.logo2} /> : null}

                <p className={`detailed_unstaked_pairs`}>{stakedTokenValue?.toFixed(3)} LP</p>
              </div>
              <p className={`detailed_unstaked_pairs`}>
                {stakedTokenValue &&
                  (lpPrice * stakedTokenValue).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
              </p>
            </div>
          </div>
        </div>

        <div className={`details_section detailed_position ${lightMode && "detailed_position--light"}`}>
          <p className={`detailed_position_total ${lightMode && "detailed_position_total--light"}`}>
            Total Value Locked
          </p>

          {totalSupplies[farm.chainId][farm.lp_address].supply &&
          Number(totalSupplies[farm.chainId][farm.lp_address].supply) * lpPrice ? (
            <div className={`detailed_header`}>
              <p>Pool Liquidity</p>
              <div className={`unstaked_details`}>
                <div className={`unstaked_details_header`}>
                  {farm.alt1 ? <img className={`unstaked_images1`} alt={farm.alt1} src={farm.logo1} /> : null}

                  {farm.alt2 ? <img className={`unstaked_images2`} alt={farm.alt2} src={farm.logo2} /> : null}

                  <p className={`detailed_unstaked_pairs`}>
                    {totalSupplies[farm.chainId][farm.lp_address].supply &&
                      toPreciseNumber(totalSupplies[farm.chainId][farm.lp_address].supply)}{" "}
                    {farm.name}
                  </p>
                </div>

                <p className={`detailed_unstaked_pairs`}>
                  {totalSupplies[farm.chainId][farm.lp_address].supply &&
                    (Number(totalSupplies[farm.chainId][farm.lp_address].supply) * lpPrice).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    })}
                </p>
              </div>
            </div>
          ) : null}

          {totalSupplies[farm.chainId][farm.vault_addr].supply &&
          Number(totalSupplies[farm.chainId][farm.vault_addr].supply) * lpPrice ? (
            <div className={`detailed_header`}>
              <p>Vault Liquidity</p>
              <div className={`unstaked_details`}>
                <div className={`unstaked_details_header`}>
                  {farm.alt1 ? <img className={`unstaked_images1`} alt={farm.alt1} src={farm.logo1} /> : null}

                  {farm.alt2 ? <img className={`unstaked_images2`} alt={farm.alt2} src={farm.logo2} /> : null}

                  <p className={`detailed_unstaked_pairs`}>
                    {totalSupplies[farm.chainId][farm.vault_addr].supply &&
                      toPreciseNumber(totalSupplies[farm.chainId][farm.vault_addr].supply)}{" "}
                    {farm.name}
                  </p>
                </div>
                <p className={`detailed_unstaked_pairs`}>
                  {totalSupplies[farm.chainId][farm.vault_addr].supply &&
                    (Number(totalSupplies[farm.chainId][farm.vault_addr].supply) * lpPrice).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    })}
                </p>
              </div>
            </div>
          ) : null}

          {farmData?.withdrawableAmounts[0].amount &&
          totalSupplies[farm.chainId][farm.vault_addr].supply &&
          Number(farmData.withdrawableAmounts[0].amount) /
            Number(totalSupplies[farm.chainId][farm.vault_addr].supply) ? (
            <div className={`detailed_header`}>
              <p>Share</p>
              <div className={`unstaked_details`}>
                <p className={`detailed_unstaked_pairs`}>
                  {(
                    (Number(farmData?.withdrawableAmounts[0].amount) /
                      (Number(totalSupplies[farm.chainId][farm.vault_addr].supply) * lpPrice)) *
                      100 || 0
                  ).toFixed(2)}
                  %
                </p>
              </div>
            </div>
          ) : null}
        </div>
        <div className="farm_apy_lp_graph_container_details">
          <FarmApyGraph farm={farm} />
          <FarmLpGraph farm={farm} />
        </div>
      </div>
      <div className={`details_retract ${lightMode && "details_retract--light"}`} onClick={props.onClick}>
        <p className={`details_retract_description ${lightMode && "details_retract_description--light"}`}>See Less</p>
        <RiArrowUpSLine />
      </div>
    </div>
  );
};

export default Details;
