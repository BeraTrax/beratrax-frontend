import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import { commify } from "ethers/lib/utils.js";
import { useRef, useState } from "react";
import { useNotify } from "@beratrax/core/src/hooks";
import { usePlatformTVL } from "@beratrax/core/src/hooks";
import { useVaultMigrate } from "@beratrax/core/src/hooks";
import { useWallet } from "@beratrax/core/src/hooks";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { CHAIN_ID } from "src/types/enums";
import { toPreciseNumber } from "src/utils/common";
import { useConnectors } from "wagmi";
// import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
// import { LocalAccountSigner, arbitrum } from "@alchemy/aa-core";
// import { createWeb3AuthSigner } from "src/config/walletConfig";

const Test = () => {
  const { openConnectModal } = useConnectModal();
  const { getPublicClient } = useWallet();
  const connectors = useConnectors();
  const { dismissNotifyAll, notifyError, notifyLoading, notifySuccess } = useNotify();
  const [url, setUrl] = useState<string>("");
  const [modelOpen, setModelOpen] = useState(false);
  const [model1Open, set1ModelOpen] = useState(false);
  const { getClients } = useWallet();
  const { prices } = useTokens();
  const { platformTVL } = usePlatformTVL();
  const clickMeButtonRef = useRef<HTMLButtonElement>(null);

  const { migrate } = useVaultMigrate();

  const fn = async () => {
    // setModelOpen(true);
    const publicClient = getPublicClient(CHAIN_ID.CORE);
    const currentBlock = await publicClient.getBlockNumber();
    const oldBlock = currentBlock - 28944n * 30n;
    const rate = Number(
      await publicClient.readContract({
        address: "0xf5fA1728bABc3f8D2a617397faC2696c958C3409",
        abi: [
          {
            outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
            inputs: [],
            name: "getCurrentExchangeRate",
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "getCurrentExchangeRate",
      })
    );
    const oldRate = Number(
      await publicClient.readContract({
        address: "0xf5fA1728bABc3f8D2a617397faC2696c958C3409",
        abi: [
          {
            outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
            inputs: [],
            name: "getCurrentExchangeRate",
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "getCurrentExchangeRate",
        blockNumber: oldBlock,
      })
    );

    const apr = ((1 + (rate - oldRate) / oldRate) ** 12 - 1) * 100;
    console.log("apr =>", apr);
  };

  return (
    <div style={{ color: "red" }}>
      {toPreciseNumber(1035.1000124)}
      {/* <DepositModal
                handleClose={() => {
                    // setShowSlippageModal(false);
                }}
                handleSubmit={async ({ bridgeChainId }) => {}}
                farmId={39}
                inputAmount={2}
                symbol="usdc"
            /> */}
      Test
      <button onClick={fn} ref={clickMeButtonRef}>
        Click Me
      </button>
      <button onClick={() => migrate()}>Migrate</button>
      <button
        onClick={() => {
          notifySuccess("Approving Zapping!", "Please wait...a sadasfas fsa fsafsafsaf saf");
        }}
      >
        success long
      </button>
      <button
        onClick={() => {
          notifySuccess("Approving Zapping!", "Please wait...");
        }}
      >
        success
      </button>
      <button
        onClick={() => {
          notifyError("Approving Zapping!", "Please wait...");
        }}
      >
        error
      </button>
      <button
        onClick={() => {
          notifyError(
            "Approving Zapping!",
            "Please wait...ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss"
          );
        }}
      >
        error long
      </button>
      <button
        onClick={() => {
          notifyLoading("Approving Zapping!", "Please wait...");
        }}
      >
        loading
      </button>
      <button
        onClick={() => {
          notifyLoading("Approving Zapping!", "Please wait...", {
            buttons: [
              {
                name: "View",
                onClick: () => {},
              },
            ],
          });
        }}
      >
        btns
      </button>
      <button
        onClick={() => {
          dismissNotifyAll();
        }}
      >
        dismiss
      </button>
      <button
        onClick={() => {
          setModelOpen(true);
        }}
      >
        warning modal open
      </button>
      <button
        onClick={() => {
          setModelOpen(true);
        }}
      >
        slippage model open
      </button>
      <button
        onClick={() => {
          set1ModelOpen(true);
        }}
      >
        COngras modal open
      </button>
      <br />
      <div>dasdsa</div>
      <hr />
      <div className="bg-bgPrimary text-textSecondary p-4 rounded-lg">Primary Background</div>
      <div className="bg-bgDark p-10">
        {[].map((el) => (
          <div
            className="min-w-64 max-w-96 py-6 px-4 rounded-3xl gap-2.5 bg-bgSecondary justify-between items-center flex  "
            // onClick={() => setSelectedToken(tokens.find((item) => item.name === "USDC"))}
          >
            <div className="flex  gap-2.5 items-center">
              <img
                className="w-8 h-8 "
                src={
                  "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8/logo.png"
                }
                alt="logo"
              />
              <div>
                <p className=" text-white text-lg ">{"USDC"}</p>
                <p className=" text-textSecondary text-base	">{ethers.utils.commify(Number(el).toString())}</p>
              </div>
            </div>
            <p className=" text-white text-lg">
              {Number(0)
                .toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 3,
                })
                .slice(0, -1)}
            </p>
          </div>
        ))}

        {[1].map((el) => (
          <div className="min-w-64 max-w-96 py-6 px-4 rounded-3xl gap-5 flex flex-col bg-bgSecondary bg-primary-gradient  p-4 shadow-lg text-white">
            {/* Top Icons */}
            <div className="flex flex-col gap-2.5">
              <div className="flex">
                <img
                  className="w-8 h-8 "
                  src={
                    "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8/logo.png"
                  }
                  alt="logo"
                />
                <img
                  className="w-8 h-8 "
                  src={
                    "https://raw.githubusercontent.com/Contrax-co/tokens/main/arbitrum-tokens/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8/logo.png"
                  }
                  alt="logo"
                />
              </div>

              {/* Main Heading */}
              <h2>WETH-USDCB</h2>
            </div>

            {/* Divider */}
            <div className="flex justify-between items-center text-textPrimary text-sm">
              <div className="text-center ">
                <span className="uppercase">Your Stake</span>
                <p className="text-white font-semibold mt-1">$0.99</p>
              </div>

              <div className="border-r-2 border-borderLight h-12"></div>

              <div className="text-center">
                <span className="uppercase">APY</span>
                <p className="text-white font-semibold mt-1">84.3%</p>
              </div>

              <div className="border-r-2 border-borderLight h-12"></div>

              <div className="text-right">
                <span className="uppercase">Points</span>
                <p className="text-white font-semibold mt-1">61/year</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <hr />
      {platformTVL && <h1>Platform TVL: ${commify(platformTVL.toFixed(0))}</h1>}
      <iframe src={url} style={{ width: 400, height: 700 }}></iframe>
      <hr />
    </div>
  );
};

export default Test;
