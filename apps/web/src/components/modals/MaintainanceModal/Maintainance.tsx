import { FC } from "react";
import { FarmOriginPlatform } from "@beratrax/core/src/types/enums";
import { ModalLayout } from "web/src/components/modals/ModalLayout/ModalLayout";
import styles from "./Maintainance.module.css";

export const Maintainance: FC = () => {
	return (
		<ModalLayout onClose={() => {}} className={styles.container} wrapperClassName="lg:w-full">
			<img className={styles.logo} alt="beratrax-logo" src={FarmOriginPlatform.BeraTrax.logo} />
			<h2 className={styles.heading}>Under Maintenance</h2>
			<p className={styles.caption}>
				Your tokens and stake positions will be visible soon. You can always withdraw them from the blockchain directly.
			</p>
		</ModalLayout>
	);
};
