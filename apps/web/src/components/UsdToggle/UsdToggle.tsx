import CoinStack from "@beratrax/core/src/assets/images/coinStack.svg";
import { FC } from "react";
import { FaDollarSign } from "react-icons/fa";
import styles from "./UsdToggle.module.css";

interface IProps {
	showInUsd: boolean;
	handleToggleShowInUsdc: () => void;
}

export const UsdToggle: FC<IProps> = ({ showInUsd, handleToggleShowInUsdc }) => {
	return (
		<div className={"flex items-center justify-center"}>
			<div className={`${styles.lighttoggle} ${showInUsd && styles.lighttoggle_on}`} onClick={handleToggleShowInUsdc}>
				<div className={`${styles.lighttoggle_switch_bg} ${showInUsd && styles.lighttoggle_switch_bg_on}`}>
					{showInUsd ? <CoinStack /> : <FaDollarSign size={16} />}
				</div>
				<div className={`${styles.lighttoggle_switch} ${showInUsd && styles.lighttoggle_switch_on}`}>
					{showInUsd ? <FaDollarSign size={16} /> : <CoinStack />}
				</div>
			</div>
		</div>
	);
};
