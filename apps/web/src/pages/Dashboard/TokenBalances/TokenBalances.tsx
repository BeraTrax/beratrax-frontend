import useApp from "src/hooks/useApp";
// import useBalances from "src/state/balances/useBalances";
import { FC, useCallback, useMemo, useState } from "react";
import { BiSliderAlt } from "react-icons/bi";
import { TbListDetails } from "react-icons/tb";
import OutsideClickHandler from "react-outside-click-handler";
import { EmptyComponent } from "src/components/EmptyComponent/EmptyComponent";
import { TransferToken } from "src/components/modals/TransferToken/TransferToken";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import { SupportedChains } from "src/config/walletConfig";
import { useWallet } from "@beratrax/core/hooks";
import { useAppDispatch, useAppSelector } from "src/state";
import { toggleTokenDetailBalances } from "src/state/settings/settingsReducer";
import useTokens, { UIStateEnum } from "src/state/tokens/useTokens";
import { Token } from "src/types";
import { CHAIN_ID } from "src/types/enums";
import { zeroAddress } from "viem";

interface IProps {}

const tokenCardStyle =
  "relative group grid grid-cols-[max-content_1fr_max-content] items-center gap-4  py-6 px-4 rounded-3xl cursor-pointer bg-bgDark transition-all duration-300 hover:pr-14 font-league-spartan";

const tokenCardHoverArrowStyles =
  "absolute right-0 top-0 bottom-0 flex items-center justify-center w-10 rounded-r-3xl bg-bgPrimary text-textBlack font-bold text-2xl opacity-0 group-hover:opacity-100 transition-all duration-300";

const containerClass =
  "grid gap-4 grid-cols-[repeat(auto-fit,minmax(250px,400px))] mobile:grid-cols-1 xlMobile:grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3";

export const TokenBalances: FC<IProps> = () => {
  const { lightMode } = useApp();
  const [selectedToken, setSelectedToken] = useState<Token>();
  const showTokenDetailedBalances = useAppSelector((state) => state.settings.showTokenDetailedBalances);
  const {
    balances,
    isBalancesLoading: balancesLoading,
    isPricesLoading: pricesLoading,
    tokens,
    lpTokens,
    UIState,
  } = useTokens();

  const filteredLpTokens = useMemo(() => {
    return lpTokens.filter(
      (t) => Number(t.usdBalance) > 0.01 && t.address !== "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b"
    );
  }, [lpTokens]);

  const { isConnecting } = useWallet();
  const isLoading = balancesLoading || pricesLoading || isConnecting;

  const handleCloseModal = useCallback(() => setSelectedToken(undefined), [setSelectedToken]);
  const ethBalance = balances[CHAIN_ID.BERACHAIN]?.[zeroAddress];
  // const ethBalance = useMemo(() => getCombinedBalance(balances, CHAIN_ID.BERACHAIN, "native"), [balances]);

  const filteredTokens = useMemo(() => {
    return tokens
      .filter((item) => {
        if (Number(item.usdBalance) < 0.01) return false;
        // if (!showTokenDetailedBalances)
        //     switch (item.name) {
        //         case "ETH":
        //             return false;
        //         default:
        //             return true;
        //     }
        // else
        if (item.name === "BERA") return false;
        return true;
      })
      .map((e) => ({ ...e, isTransferable: e.name !== "BGT" }));
  }, [tokens, showTokenDetailedBalances]);

  const beraToken = tokens.find((token) => token.address == zeroAddress);

  if (isLoading) {
    return (
      <div>
        <p className="font-arame-mono font-normal text-[16px] text-textWhite leading-4 uppercase mt-5">
          Token Balances
        </p>
        <div className={containerClass}>
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="py-6 px-4 rounded-3xl gap-4 bg-bgDark justify-between grid grid-cols-[max-content_1fr_max-content] items-center font-league-spartan"
            >
              <div className="relative">
                <Skeleton w={36} h={36} />
              </div>
              <div>
                <Skeleton w={100} h={24} />
                <Skeleton w={60} h={20} className="mt-1" />
              </div>
              <div>
                <Skeleton w={80} h={24} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center gap-2.5">
        <p className="font-arame-mono font-normal text-[16px] text-textWhite leading-4 uppercase mt-5">
          Token Balances
        </p>
        {/* <Settings /> */}
      </div>
      {UIState === UIStateEnum.CONNECT_WALLET && (
        <EmptyComponent style={{ paddingTop: 50, paddingBottom: 50 }}>Sign in/up to view your balances</EmptyComponent>
      )}
      {UIState === UIStateEnum.LOADING && (
        <Skeleton w={"100%"} h={150} bg={lightMode ? "#ffffff" : undefined} bRadius={20} inverted={true} />
      )}
      {UIState === UIStateEnum.NO_TOKENS && ethBalance?.valueWei === "0" && (
        <EmptyComponent
          link="https://app.kodiak.finance/#/swap?chain=berachain_mainnet"
          linkText="Get some Bera or Honey on Kodiak to start earning."
        />
      )}

      {(UIState === UIStateEnum.SHOW_TOKENS_TOKENS || UIState === UIStateEnum.SHOW_TOKENS) && (
        <div className={containerClass}>
          {!showTokenDetailedBalances && (
            <>
              <div className={tokenCardStyle} onClick={() => setSelectedToken(beraToken)}>
                <img
                  className="w-9 h-9 "
                  src={
                    "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png"
                  }
                  alt="logo"
                />
                <div>
                  <p className=" text-white text-lg ">BERA</p>
                  <p className=" text-textSecondary text-base	">{ethBalance?.valueFormatted || 0}</p>
                </div>
                <p className=" text-white text-lg">${ethBalance?.valueUsdFormatted}</p>
                {/* Hover Arrow */}
                <div className={tokenCardHoverArrowStyles}>&gt;</div>
              </div>
            </>
          )}
          {filteredTokens.map((token, i) => (
            <div key={i} onClick={() => token.isTransferable && setSelectedToken(token)} className={tokenCardStyle}>
              {/* Token Logo */}
              <div className="relative">
                <img className="w-9 h-9 rounded-full" src={token.logo} alt="logo" />
                {/* Network Logo */}
                <img
                  className="w-3.5 h-3.5 rounded-full absolute top-4 left-6"
                  src={`https://github.com/BeraTrax/tokens/blob/main/chains/${token.networkId}.png?raw=true`}
                  alt={token.networkId.toString()}
                />
              </div>

              {/* Token Details */}
              <div>
                <p className="text-lg text-white">
                  {token.name}
                  {showTokenDetailedBalances && (
                    <span className="ml-1 text-sm font-normal text-textPrimary">
                      ({SupportedChains.find((item) => item.id === token.networkId)?.name})
                    </span>
                  )}
                </p>
                <p className="text-textSecondary text-base ">{token.balance}</p>
              </div>

              {/* USD Balance */}
              <p className="text-white text-lg">${token.name !== "BTX" && token.usdBalance}</p>

              {/* Hover Arrow */}
              {token.isTransferable && <div className={tokenCardHoverArrowStyles}>&gt;</div>}
            </div>
          ))}
          {selectedToken ? <TransferToken token={selectedToken} handleClose={handleCloseModal} /> : null}
        </div>
      )}
      {(UIState === UIStateEnum.SHOW_TOKENS_LP || UIState === UIStateEnum.SHOW_TOKENS) &&
        filteredLpTokens.length > 0 && (
          <>
            <p className="font-arame-mono font-normal text-[16px] text-textWhite leading-4 uppercase mt-5 ">
              Unstaked LP Token Balances
            </p>
            <div className={containerClass}>
              {filteredLpTokens.map((token, i) => (
                <div key={i} className={tokenCardStyle} onClick={() => setSelectedToken(token)}>
                  <span className="flex">
                    <img className="w-9 h-9" src={token.logo} alt="logo" style={{ clipPath: "circle(50%)" }} />
                    {token.logo2 && (
                      <img className="w-9 h-9 -ml-3" src={token.logo2} alt="logo" style={{ clipPath: "circle(50%)" }} />
                    )}
                  </span>
                  <div>
                    <p className="text-white text-lg">
                      {token.name}
                      {token.network ? (
                        <span className="ml-1 text-sm font-normal text-textPrimary ">({token.network})</span>
                      ) : null}
                    </p>
                    <p className="text-textSecondary text-base">{token.balance}</p>
                  </div>
                  <p className="text-white text-lg">${token.usdBalance}</p>

                  {/* Hover Arrow */}
                  <div className={tokenCardHoverArrowStyles}>&gt;</div>
                </div>
              ))}
            </div>
          </>
        )}
    </>
  );
};

const Settings = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const showTokenDetailedBalances = useAppSelector((state) => state.settings.showTokenDetailedBalances);
  return (
    <OutsideClickHandler display="inline-block" onOutsideClick={() => setOpen(false)}>
      <div className="relative">
        <div
          className={" bg-bgPrimary w-5 h-5 rounded-3xl cursor-pointer p-[2px] pl-[2]"}
          onClick={() => setOpen(!open)}
        >
          <BiSliderAlt />
        </div>
        {open && (
          <div
            className={
              "font-league-spartan font-normal text-lg absolute right-0 top-7 text-nowrap z-[1] border border-borderDark bg-bgDark text-textWhite py-1 px-2 rounded-3xl  "
            }
          >
            <div
              style={{
                display: "flex",
                cursor: "pointer",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
              onClick={() => {
                dispatch(toggleTokenDetailBalances(!showTokenDetailedBalances));
              }}
            >
              <TbListDetails width={16} height={16} />
              <p>{showTokenDetailedBalances ? "Hide" : "Show"} Token Distribution</p>
            </div>
          </div>
        )}
      </div>
    </OutsideClickHandler>
  );
};
