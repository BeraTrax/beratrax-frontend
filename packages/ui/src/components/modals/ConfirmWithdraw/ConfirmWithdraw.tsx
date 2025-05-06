import { FC } from "react";
import { ModalLayout } from "ui/src/components/modals/ModalLayout/ModalLayout";

interface IProps {
  handleClose: Function;
  handleSubmit: Function;
}
export const ConfirmWithdraw: FC<IProps> = ({ handleClose, handleSubmit }) => {
  return (
    <ModalLayout
      onClose={handleClose}
      style={{ borderColor: "var(--new-border_dark)" }}
      wrapperClassName="w-full lg:w-[92%]"
    >
      <div className={"text-center tablet:w-full flex flex-col items-center justify-center width-[50%]"}>
        <h1 className="text-textWhite text-2xl font-bold pb-4">Confirm Withdraw</h1>
        <p className={"text-center tablet:text-base mobile:text-sm text-xl text-textWhite"}>
          BTX points are still being earned. Withdrawing will stop your earnings. Are you sure?
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

