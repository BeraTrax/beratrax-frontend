import { FC, useState } from "react";
import { ImSpinner8 } from "react-icons/im";
import { acceptTerms, getMessage } from "src/api/trax";
import { useWallet } from "@beratrax/core/src/hooks";
import { useAppDispatch } from "src/state";
import { updateAccountField } from "src/state/account/accountReducer";
import { CHAIN_ID } from "src/types/enums";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import styles from "./EarnTrax.module.css";

interface IProps {
  setOpenModal: Function;
  setCongModal: Function;
}

export const EarnTrax: FC<IProps> = ({ setOpenModal, setCongModal }) => {
  const dispatch = useAppDispatch();
  const { currentWallet, getWalletClient } = useWallet();
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAgree = async () => {
    if (!currentWallet) return;
    const client = await getWalletClient(CHAIN_ID.BERACHAIN);
    setIsLoading(true);
    const message = await getMessage();
    const signature = await client.signMessage({ message });
    const termsAccepted = await acceptTerms(currentWallet, signature);
    setCongModal(true);
    dispatch(updateAccountField({ field: "earnTraxTermsAgreed", value: termsAccepted }));
    setIsLoading(false);
  };

  return (
    <ModalLayout onClose={() => setOpenModal(false)} className={styles.container} wrapperClassName="lg:w-full">
      <h2 className={styles.heading}>BTX Token Terms of Use</h2>
      <p className={styles.description}>Agree to our terms and Earn BTX tokens</p>
      <p className={styles.description}>Effective Date: 02/05/2025</p>
      <div className={styles.terms}>
        These BTX Token Terms of Use (the "Terms") govern your receipt and use of the BTX token ("BTX" or "Token")
        issued by Beratrax DAO LLC ("Beratrax DAO," "we," "us," or "our"). By accessing, staking, holding, or using BTX
        in any manner (“Use”), you acknowledge that you have read, understood, and agree to be bound by these Terms and
        the Operating Agreement of Beratrax DAO. They are in addition to the website terms and conditions, which you
        also affirming you agree in these terms. The website terms and conditions can be found{" "}
        <a href="termsofuse.pdf" target="_blank">
          here.
        </a>
        <ol>
          <li>
            <b>BTX Governance Token:</b>
            <br /> BTX is a digital token created and issued by Beratrax DAO. It is intended to serve as a membership
            interest in Beratrax DAO and a governance token within the Beratrax DAO ecosystem once the governance model
            and voting mechanisms are complete and operational. BTX is designed to represent membership rights and the
            ability to participate in the decision-making processes of Beratrax DAO in the future.
            <ol>
              <li>
                <b>Non-Transferability:</b>
                <br />
                At present, BTX is non-transferable. This means that you may not transfer, sell, exchange, or otherwise
                dispose of your BTX to other parties. However, Beratrax DAO retains the right, at its sole discretion,
                to enable token transfers in the future.
              </li>
              <li>
                <b>Voting Rights:</b>
                <br />
                BTX is intended to give its holder voting rights within the governance framework of Beratrax DAO,
                subject to the Operating Agreement of Beratrax DAO. These voting rights are designed to allow you to
                participate in key decisions that impact the development and direction of the Beratrax platform once the
                governance model and mechanism of voting are complete and operational.
              </li>
            </ol>
          </li>
          <li>
            <b>Emission Rate and Token Usage:</b>
            <ol>
              <li>
                <b>Emission Rate:</b>
                <br />
                BTX emission is a mechanism by which new tokens are created and distributed to users who stake their
                crypto assets on the Beratrax platform. The current emission rate is set at 1 BTX for every $50 staked
                per day per 10% APY. This emission rate is subject to change at any time at the discretion of Beratrax
                DAO.
              </li>
              <li>
                <b>Purpose of Emission:</b>
                <br />
                The emission of BTX tokens is designed to reward users for their participation and usage of the Beratrax
                platform. It is important to Note: Although BeraTrax does not have a deposit/withdraw fee, BTX emission
                is not an endorsement of any particular platform or pool. It applies uniformly to all staking pools
                within the Beratrax platform.
              </li>

              <li>
                <b>No Intrinsic Value:</b>
                <br />
                BTX is not designed to have any intrinsic value, or value outside the Beratrax DAO ecosystem. BTX is not
                intended to serve as a speculative investment or a vehicle for generating financial returns. It is
                specifically designed as a representation of voting right units for governance purposes within Beratrax
                DAO.
              </li>

              <li>
                <b>Limitation of Liability:</b>
                <br />
                Your use of BTX is entirely at your own risk. To the fullest extent permitted by law, Beratrax DAO shall
                not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages arising
                from your use of BTX, including but not limited to losses of profits, goodwill, data, or other
                intangible losses. Under no circumstances shall the aggregate liability of Beratrax DAO exceed $100.
              </li>

              <li>
                <b>Release of Claims:</b>
                <br />
                By your continuous Use of BTX, you each time voluntarily release Beratrax DAO, its affiliates,
                directors, officers, employees, agents, and representatives, of any claims that relate to BTX, your Use
                of it, and the Beratrax platform, and waive any right to bring a lawsuit.
              </li>

              <li>
                <b>Binding Arbitration:</b>
                <br />
                Any dispute, claim, or controversy arising from or related to these Terms or the Use of BTX shall be
                resolved exclusively through binding arbitration. The arbitration shall take place in New York, NY and
                shall be conducted in the English language in accordance with the rules of the American Arbitration
                Association.
              </li>

              <li>
                <b>Modification of Terms:</b>
                <br />
                Beratrax DAO reserves the right to modify, suspend, or terminate these Terms, the functionality of BTX
                or any aspect of the Beratrax platform at its sole discretion. Any material changes to these Terms will
                be communicated through Beratrax DAO’s website or other official Beratrax DAO channels. You are
                responsible for monitoring such sites for any updates. By continuing to Use BTX, you acknowledge and
                agree to the then-applicable Terms.
              </li>

              <li>
                <b>Governing Law:</b>
                <br />
                These Terms shall be governed by and construed in accordance with the laws of the state of Wyoming,
                without regard to its conflict of law principles.
              </li>

              <li>
                <b>Entire Agreement:</b>
                <br />
                These Terms constitute the entire agreement between you and Beratrax DAO regarding BTX and supersede all
                prior agreements and understandings, whether oral or written.
              </li>
            </ol>
          </li>
        </ol>
        If you do not agree with these Terms, you should not Use BTX, nor participate in Beratrax DAO's governance
        activities.
      </div>
      <div className={`${styles.checkbox}`}>
        <input type="checkbox" name="agree" id="agree" checked={agree} onChange={() => setAgree((prev) => !prev)} />
        <label className="text-white" htmlFor="agree">
          I agree all terms and conditions
        </label>
      </div>
      <div className={styles.buttonsContainer}>
        <button
          className="bg-bgPrimary p-4 rounded-xl w-24"
          onClick={() => {
            setOpenModal(false);
          }}
        >
          Cancel
        </button>
        <button
          className={`${agree ? "bg-bgPrimary" : "bg-buttonDisabled"} p-4 rounded-xl w-24`}
          disabled={!agree || isLoading}
          onClick={handleAgree}
        >
          {isLoading ? <ImSpinner8 className={styles.loader} /> : "Earn"}
        </button>
      </div>
    </ModalLayout>
  );
};
