// import WalletIcon from "@beratrax/core/src/assets/images/walletSvg.svg";
import { useTrax } from "@beratrax/core/src/hooks";
import { customCommify } from "@beratrax/core/src/utils/common";
import styles from "./TraxApy.module.css";

interface Props {}

export const TraxApy: React.FC<Props> = () => {
	const { totalTraxApy } = useTrax();

	if (!(totalTraxApy > 0)) return null;

	return (
		<div className={`outlinedContainer ${styles.container}`}>
			<p className={styles.heading}>BTX Yearly Rate </p>
			<p className={styles.value}>
				{/* <FaUserFriends size={120} /> */}
				{/* <WalletIcon /> */}
				{/* <MdAdd /> */}
				{customCommify(totalTraxApy, { minimumFractionDigits: 0, showDollarSign: false })}
			</p>
		</div>
	);
};
