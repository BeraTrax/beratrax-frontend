import { FC } from "react";
import errorIcon from "@beratrax/core/src/assets/images/Error.png";
import { ModalLayout } from "web/src/components/modals/ModalLayout/ModalLayout";

interface IProps {
    handleClose: Function;
    handleSubmit: Function;
}

export const SlippageNotCalculate: FC<IProps> = ({ handleClose, handleSubmit }) => {
    return (
        <ModalLayout
            onClose={handleClose}
            style={{ borderColor: "var(--new-border_dark)" }}
            wrapperClassName="w-full lg:w-[92%]"
        >
            <div className="tablet:w-full flex flex-col gap-4 items-center justify-center width-[540px]">
                <img src={errorIcon} alt="error" className="mt-4 mb-2 tablet:mt-1" />
                <p className="text-center tablet:text-base mobile:text-sm text-xl text-textSecondary ">
                    Transaction slippage could not be simulated. Your total fees are not confirmed.
                </p>
                <p className="text-center tablet:text-base mobile:text-sm text-xl text-textSecondary ">
                    Do you still wish to continue?
                </p>
                <div className=" tablet:gap-2 mt-4 flex gap-4 w-full justify-evenly">
                    <button
                        className=" bg-buttonPrimaryLight w-full py-3 cursor-pointer text-xl font-bold tracking-widest rounded-[40px] uppercase"
                        onClick={() => {
                            handleClose();
                        }}
                    >
                        Close
                    </button>
                    <button
                        className="bg-bgDark border border-gradientPrimary text-gradientPrimary w-full py-3 cursor-pointer text-xl font-bold tracking-widest rounded-[40px] uppercase"
                        // className={`custom-button mobile:min-w-[100px] text-textWhite`}
                        onClick={() => {
                            handleSubmit();
                            handleClose();
                        }}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </ModalLayout>
    );
};
