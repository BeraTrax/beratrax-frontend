import { FC, useState } from "react";
import { BiCopy } from "react-icons/bi";
import { BsCheckCircle } from "react-icons/bs";
import QRCode from "react-qr-code";
import useApp from "src/hooks/useApp";
import useWallet from "src/hooks/useWallet";
import { copyToClipboard } from "src/utils";
import { ModalLayout } from "../ModalLayout/ModalLayout";
interface IProps {
    setOpenModal: Function;
}

export const ExportPublicKey: FC<IProps> = ({ setOpenModal }) => {
    const { lightMode } = useApp();
    const [copied, setCopied] = useState(false);
    const { currentWallet } = useWallet();

    const copy = () => {
        setCopied(true);
        copyToClipboard(currentWallet!, () => setCopied(false));
    };

    return (
        <ModalLayout
            onClose={() => setOpenModal(false)}
            className={" p-14 h-m-[330px] block text-center gap-7 tablet:w-[initial] tablet:flex tablet:items-center "}
        >
            <div className="tablet:text-left">
                <div className="mb-5 ">
                    <h1 className="text-4xl font-bold mb-5">Scan Me</h1>
                </div>
                <p className="text-lg font-bold mb-0">Wallet Address</p>
                <div className="flex justify-center items-center gap-2 text-gray-500 mb-5">
                    <p className="max-w-[377px] truncate">{`${currentWallet?.substring(
                        0,
                        20
                    )}...${currentWallet?.substring(currentWallet.length - 3)}`}</p>
                    {copied ? (
                        <BsCheckCircle className="cursor-pointer text-inherit" size={22} />
                    ) : (
                        <BiCopy className="cursor-pointer text-inherit" size={22} onClick={copy} />
                    )}
                </div>
                <p className="w-[250px] hidden md:block">
                    Sending cryptocurrency has never been easier. Simply scan this QR code to transfer your desired
                    tokens to your Beratrax wallet.
                </p>
            </div>
            <div
                className={
                    "bg-bgPrimary w-fit h-fit text-center p-3 m-auto border-[12px] border-bgDark rounded-xl shadow-xl"
                }
            >
                {currentWallet && (
                    <QRCode
                        value={currentWallet}
                        size={200}
                        //add var color
                        bgColor={lightMode ? "var(--new-background_primary)" : "var(--new-background_secondary)"}
                        fgColor={lightMode ? "var(--new-background_secondary)" : "var(--new-background_primary)"}
                    />
                )}
            </div>
        </ModalLayout>
    );
};

