import { FC } from "react";
import { ModalLayout } from "ui/src/components/modals/ModalLayout/ModalLayout";

interface IProps {
    handleClose: Function;
    handleSubmit: Function;
    percentage: number | undefined;
}
export const SlippageWarning: FC<IProps> = ({ handleClose, handleSubmit, percentage }) => {
    return (
        <ModalLayout
            onClose={handleClose}
            style={{ borderColor: "var(--new-border_dark)" }}
            wrapperClassName="w-full lg:w-[92%]"
        >
            <div className={"text-center tablet:w-full flex flex-col items-center justify-center width-[50%]"}>
                <h1 className="text-red-500">Warning</h1>
                <p
                    className={"text-center tablet:text-base mobile:text-sm text-xl text-red-500"}
                >{`Slipage is higher than normal at ${percentage?.toFixed(2)}%.`}</p>
                <p className={"text-center tablet:text-base mobile:text-sm text-xl text-red-500"}>
                    Are you sure you still want to continue?
                </p>
                <div className={" tablet:gap-2 mt-4 flex gap-4 w-full justify-evenly"}>
                    <button
                        className="bg-buttonPrimaryLight w-full py-3 px-2 cursor-pointer text-xl font-bold tracking-widest rounded-[40px] uppercase"
                        onClick={() => {
                            handleClose();
                        }}
                    >
                        Close
                    </button>
                    <button
                        className="bg-bgDark border border-red-500 text-red-500 w-full py-3 px-2 cursor-pointer text-xl font-bold tracking-widest rounded-[40px] uppercase hover:bg-red-500 hover:text-white transition-colors"
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
