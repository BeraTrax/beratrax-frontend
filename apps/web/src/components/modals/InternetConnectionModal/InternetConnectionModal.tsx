import { FC } from "react";
import logo from "src/assets/images/logo.png";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import styles from "./InternetConnectionModal.module.css";

export const InternetConnectionModal: FC = () => {
    return (
        <ModalLayout onClose={() => {}} className={styles.container} wrapperClassName="lg:w-full">
            <img className={styles.logo} alt="beratrax-logo" src={logo} />
            <h2 className={styles.heading}>Internet Not Connected</h2>
            <p className={styles.caption}>
                Your internet is not connected. Try to connect to an internet network to use Beratrax features.
            </p>
        </ModalLayout>
    );
};
