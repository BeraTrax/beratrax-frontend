import { FC, useEffect, useState } from "react";
import { BiCopy } from "react-icons/bi";
import { BsCheckCircle } from "react-icons/bs";
import { TiWarningOutline } from "react-icons/ti";
import { ModalLayout } from "src/components/modals/ModalLayout/ModalLayout";
import useWallet from "src/hooks/useWallet";
import { copyToClipboard } from "src/utils";

interface IProps {
    setOpenModal: Function;
}

export const ExportPrivateKey: FC<IProps> = ({ setOpenModal }) => {
    const [confirm, setConfirm] = useState(false);
    const [show, setShow] = useState(false);
    const [copied, setCopied] = useState(false);
    const [privateKey, setPrivateKey] = useState("");
    const { getPkey } = useWallet();

    useEffect(() => {
        if (!confirm) if (show) setShow(false);
    }, [confirm]);

    const handleShow = async () => {
        const pKey = await getPkey();
        setPrivateKey(pKey || "");
        setShow((prev) => !prev);
    };
    const copy = () => {
        setCopied(true);
        copyToClipboard(privateKey, () => setCopied(false));
    };

    return (
        <ModalLayout
            onClose={() => setOpenModal(false)}
            className={" p-10 tablet:w-[initial] mobile:py-4 mobile:pl-11 mobile:pr-7"}
            wrapperClassName="lg:w-full"
        >
            <div className="flex items-center gap-2 mb-4">
                <TiWarningOutline className="" color="red" size={40} />
                <h1 className="text-textPrimary text-2xl font-bold ">Disclaimer</h1>
            </div>
            <p>Exporting Private Key</p>
            <p className="text-textSecondary max-w-[520px] mb-7">
                This is for advanced users and can put their funds at risk if they export without knowing how to handle
                it
            </p>
            <div>
                <input
                    type="checkbox"
                    name="confirm"
                    id="confirm"
                    onChange={() => setConfirm((prev) => !prev)}
                    className="mr-2"
                />
                <label htmlFor="confirm">I Understand</label>
            </div>
            <div className="bg-bgPrimary  w-full rounded-xl p-4 my-3 relative">
                {show ? (
                    <>
                        <input
                            type="text"
                            readOnly
                            value={privateKey}
                            className="m-0 text-sm font-bold w-[70%] overflow-hidden text-ellipsis whitespace-nowrap bg-transparent text-inherit border-none outline-none"
                        />
                        {copied ? (
                            <BsCheckCircle
                                className="absolute right-[100px] top-1/2 transform -translate-y-1/2 cursor-pointer text-inherit"
                                size={22}
                            />
                        ) : (
                            <BiCopy
                                className="absolute right-[100px] top-1/2 transform -translate-y-1/2 cursor-pointer text-inherit"
                                size={22}
                                onClick={copy}
                            />
                        )}
                    </>
                ) : (
                    <input
                        type="text"
                        readOnly
                        value={"0xXXXXXXXXXXXXXXXXXXXXXXXXXXX"}
                        className="m-0 text-sm font-bold w-[70%] overflow-hidden text-ellipsis whitespace-nowrap bg-transparent text-inherit border-none outline-none"
                    />
                )}
                <button
                    disabled={!confirm}
                    className="absolute right-5 top-1/2 transform -translate-y-1/2 text-[var(--color_primary)] bg-transparent cursor-pointer border-none outline-none"
                    onClick={handleShow}
                >
                    {show ? "HIDE" : "SHOW"}
                </button>
            </div>
            <p>Note: This feature is only for social wallets</p>
        </ModalLayout>
    );
};

