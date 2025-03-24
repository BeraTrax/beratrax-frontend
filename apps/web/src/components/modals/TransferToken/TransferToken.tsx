import { useTransferToken } from "@beratrax/core/src/hooks";
import { Token } from "@beratrax/core/src/types";
import { noExponents } from "@beratrax/core/src/utils/common";
import { FC, useMemo } from "react";
import { UsdToggle } from "src/components/UsdToggle/UsdToggle";
import { ModalLayout } from "../ModalLayout/ModalLayout";

interface IProps {
    token: Token;
    handleClose: Function;
}

export const TransferToken: FC<IProps> = ({ token, handleClose }) => {
    const {
        isLoading,
        showInUsd,
        amount,
        setAmount,
        setMax,
        handleSubmit,
        handleMaxClick,
        handleToggleShowInUsdc,
        receiverAddress,
        setReceiverAddress,
    } = useTransferToken(token, handleClose);

    const hasInsufficientBalance = useMemo(
        () => (showInUsd ? Number(amount) > Number(token.usdBalance) : Number(amount) > Number(token.balance)),
        [token.balance, showInUsd, token.usdBalance, amount]
    );

    return (
        <ModalLayout onClose={handleClose} wrapperClassName="lg:w-full">
            <form
                className={
                    "w-full tablet:w-auto flex flex-col justify-center items-center  font-league-spartan text-textWhite"
                }
                onSubmit={handleSubmit}
            >
                <h1 className="font-arame-mono text-[16px]">Transfer {token.name}</h1>
                <div className={"flex flex-col w-full my-4 relative"}>
                    <label htmlFor="reciverAddress" className={"text-textSecondary  text-xl"}>
                        Send To:
                    </label>
                    <div className={" flex justify-between w-full rounded-2xl bg-gradientSecondary relative py-4 px-2"}>
                        <input
                            autoComplete="off"
                            type="text"
                            id="reciverAddress"
                            placeholder="0x1c..."
                            required
                            className="bg-transparent w-full px-1 h-9 border-0  text-textWhite text-lg placeholder:text-textLight focus:outline-none"
                            value={receiverAddress}
                            onChange={(e) => setReceiverAddress(e.target.value)}
                        />
                    </div>
                </div>
                <div className={"flex flex-col w-full my-2 "}>
                    <label htmlFor="amount" className={"text-textSecondary text-lg"}>
                        Amount:{" "}
                        <span style={{ fontSize: 14 }}>
                            (Balance: {showInUsd ? `$${token.usdBalance}` : token.balance})
                        </span>
                    </label>
                    <div
                        className={
                            " flex justify-between items-center rounded-2xl gap-2 bg-gradientSecondary relative py-3 px-2"
                        }
                    >
                        <input
                            id="amount"
                            type="number"
                            autoComplete="off"
                            placeholder="e.g. 250"
                            required
                            className="bg-inherit w-full px-1 h-9  text-textWhite placeholder:text-textLight text-lg focus:outline-none"
                            value={amount ? noExponents(amount) : ""}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                setMax(false);
                            }}
                        />
                        <div className={"flex items-center gap-4"}>
                            <p
                                className={`text-textSecondary rounded-3xl border border-borderDark py-1 pb-0 px-2 my-2 cursor-pointer hover:bg-buttonPrimaryLight hover:text-textBlack transition-all `}
                                onClick={handleMaxClick}
                            >
                                MAX
                            </p>
                            <UsdToggle showInUsd={showInUsd} handleToggleShowInUsdc={handleToggleShowInUsdc} />
                        </div>
                    </div>
                </div>
                <button
                    className={`py-4 px-8 m-2 mt-8 w-full cursor-pointer  rounded-full text-xl uppercase font-bold	 tracking-wider text-textBlack bg-buttonPrimaryLight ${
                        hasInsufficientBalance && "bg-buttonDisabled"
                    } `}
                    type="submit"
                    disabled={isLoading || Number(amount) <= 0 || !receiverAddress || hasInsufficientBalance}
                >
                    {hasInsufficientBalance ? "Insufficent Fund" : "Transfer"}{" "}
                </button>
            </form>
        </ModalLayout>
    );
};
