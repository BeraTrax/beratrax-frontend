import userguideimagefive from "@beratrax/core/src/assets/images/userguideimagefive.png";
import userguideimagefour from "@beratrax/core/src/assets/images/userguideimagefour.jpg";
import userguideimageone from "@beratrax/core/src/assets/images/userguideimageone.png";
import userguideimagesix from "@beratrax/core/src/assets/images/userguideimagesix.png";
import userguideimagethree from "@beratrax/core/src/assets/images/userguideimagethree.png";
import userguideimagetwo from "@beratrax/core/src/assets/images/userguideimagetwo.png";
import React, { ReactNode } from "react";
import { AiOutlineExport } from "react-icons/ai";
import { BsChat, BsDiamondFill, BsQuestion } from "react-icons/bs";
import { CiCircleCheck } from "react-icons/ci";
import { GiWorld } from "react-icons/gi";
import { IconBaseProps, IconType } from "react-icons/lib";
import {
    PiNumberCircleFourLight,
    PiNumberCircleOneLight,
    PiNumberCircleThreeLight,
    PiNumberCircleTwoLight,
} from "react-icons/pi";
import { Link } from "react-router-dom";

const IconWithHeading: React.FC<{ Icon: IconType; children?: ReactNode } & IconBaseProps> = ({
    Icon,
    children,
    ...iconProps
}) => (
    <div className="flex items-stretch gap-x-2">
        <Icon className="shrink-[0]" {...iconProps} /> <div>{children}</div>
    </div>
);

const ICONS = {
    check: CiCircleCheck,
    number: {
        1: PiNumberCircleOneLight,
        2: PiNumberCircleTwoLight,
        3: PiNumberCircleThreeLight,
        4: PiNumberCircleFourLight,
    },
    diamond: BsDiamondFill,
    question: BsQuestion,
};

const UserGuide = () => {
    return (
        <div className="overflow-auto">
            <div className="text-xl text-textWhite p-10 flex gap-y-8 flex-col font-light ">
                <h1 className="font-bold text-4xl leading-none uppercase">
                    💰 BeraTrax User Guide: Your Gateway to Seamless DeFi on Berachain
                </h1>
                <p>
                    Welcome to <b>BeraTrax</b>, the easiest way to access{" "}
                    <b>
                        yield-earning vaults, auto-compounded rewards, and Berachain’s Proof of Liquidity system—all
                        through your phone.
                    </b>
                    Whether you're new to DeFi or a seasoned yield farmer, BeraTrax is built to{" "}
                    <b>remove the complexity</b> and help you maximize your returns.
                </p>

                {/* SECTION 1 GETTING STARTED*/}
                <>
                    <hr />
                    <h1 className="text-4xl leading-none uppercase">Getting Started with BeraTrax</h1>
                    <h5>Step 1: Signing In</h5>
                    <p>BeraTrax offers two ways to get started:</p>
                    <IconWithHeading Icon={ICONS.check} color="var(--new-gradient-light)">
                        <b>Social Login</b> – Sign in instantly using an email, Twitter, or Discord (you own your social
                        wallet, & can export you key)
                    </IconWithHeading>

                    <IconWithHeading Icon={ICONS.check} color="var(--new-gradient-light)">
                        <b>Wallet Connection</b> – Use <b>MetaMask, WalletConnect, or Ledger</b> to connect an existing
                        wallet.
                    </IconWithHeading>

                    <IconWithHeading
                        Icon={ICONS.diamond}
                        size={14}
                        color="transparent"
                        stroke="var(--new-gradient-light)"
                        strokeWidth={1}
                    >
                        <b>First-time users? </b>
                        If signing in via social login, BeraTrax will <b>automatically create a wallet</b> for you on
                        Berachain’s mainnet.
                    </IconWithHeading>

                    <IconWithHeading
                        Icon={ICONS.diamond}
                        size={14}
                        color="transparent"
                        stroke="var(--new-gradient-light)"
                        strokeWidth={1}
                    >
                        <b>Gas money? </b>
                        All transactions are covered on BeraTrax so you don't need have BERA to use it.
                    </IconWithHeading>
                    {/* Connect Wallet Modal on web ss */}
                    <img src={userguideimageone} alt="userguideimageone" className="m-auto" width={600} />

                    <h5>Step 2: Funding Your Wallet</h5>

                    <IconWithHeading
                        Icon={ICONS.diamond}
                        size={14}
                        color="transparent"
                        stroke="var(--new-gradient-light)"
                        strokeWidth={1}
                    >
                        BeraTrax will soon have fiat onramps for you to purchase BERA directly to deposit into vaults
                    </IconWithHeading>

                    <IconWithHeading
                        Icon={ICONS.diamond}
                        size={14}
                        color="transparent"
                        stroke="var(--new-gradient-light)"
                        strokeWidth={1}
                    >
                        Until then, you must either have airdrop funds from Berachain, or bridge them over to your
                        wallet.
                    </IconWithHeading>

                    <h5>Step 3: Earn Rewards</h5>
                    <img src={userguideimagetwo} alt="userguideimagetwo" className="m-auto" width={800} />
                    {/* Bottom Bar ss  */}

                    <IconWithHeading
                        Icon={ICONS.diamond}
                        size={14}
                        color="transparent"
                        stroke="var(--new-gradient-light)"
                        strokeWidth={1}
                    >
                        Go to the “Earn” tab a the bottom of your screen (or on the side on desktop) & pick which vault
                        you want to deposit into, tap it, and open up the details page.{" "}
                    </IconWithHeading>

                    <IconWithHeading
                        Icon={ICONS.diamond}
                        size={14}
                        color="transparent"
                        stroke="var(--new-gradient-light)"
                        strokeWidth={1}
                    >
                        If you wish to deposit, just tap deposit, type in your deposit amount (or tap “Max”) and then
                        confirm. That’s all it takes!
                    </IconWithHeading>
                </>

                {/* SECTION 2 DASHBOARD */}
                <>
                    <hr />
                    <h1 className="text-4xl leading-none uppercase">Exploring the Dashboard</h1>
                    <p>
                        After signing in, you’ll land on the <b>BeraTrax Dashboard.</b>
                    </p>
                    <p>Here’s what you’ll see:</p>
                    {/* Token balances and staked vaults ss with Transactions history */}
                    <img src={userguideimagethree} alt="userguideimagethree" className="m-auto" width={600} />

                    <IconWithHeading
                        Icon={ICONS.diamond}
                        size={14}
                        color="transparent"
                        stroke="var(--new-gradient-light)"
                        strokeWidth={1}
                    >
                        <b>Your Portfolio</b> – Track your balances, staked assets, and earnings in real-time.
                    </IconWithHeading>

                    <IconWithHeading
                        Icon={ICONS.diamond}
                        size={14}
                        color="transparent"
                        stroke="var(--new-gradient-light)"
                        strokeWidth={1}
                    >
                        <b>Transaction History</b> – Review past deposits, claims, and withdrawals.
                    </IconWithHeading>

                    <IconWithHeading
                        Icon={ICONS.diamond}
                        size={14}
                        color="transparent"
                        stroke="var(--new-gradient-light)"
                        strokeWidth={1}
                    >
                        <b>BTX Points</b> – Monitor your earned{" "}
                        <b>BTX governance points and BGT staking rewards (coming soon).</b>
                    </IconWithHeading>
                </>

                {/* SECTION 3 DEPOSITING */}
                <>
                    <hr />
                    <h1 className="text-4xl leading-none uppercase">Depositing into Yield Vaults (Earning Rewards)</h1>
                    <h5>Step 1: Choosing a Vault</h5>
                    <p>
                        Navigate to the <b>"Earn" page</b>, where you’ll find all available vaults.
                    </p>
                    {/* EARN PAGE SS */}
                    <img src={userguideimagefour} alt="userguideimagefour" className="m-auto" width={500} />
                    <p>Each vault displays:</p>
                    <IconWithHeading Icon={ICONS.check} color="var(--new-gradient-light)">
                        <b>Supported Assets</b> – (e.g., BERA or HONEY)
                    </IconWithHeading>
                    <IconWithHeading Icon={ICONS.check} color="var(--new-gradient-light)">
                        <b>Current APY</b> – (estimated yield on our vaults)
                    </IconWithHeading>
                    <IconWithHeading Icon={ICONS.check} color="var(--new-gradient-light)">
                        <b>Bonus Rewards</b> – (e.g., BGT emissions, partner incentives)
                    </IconWithHeading>

                    <h5>Step 2: Depositing Funds</h5>
                    <IconWithHeading Icon={ICONS.number[1]} color="var(--new-gradient-light)">
                        <b>Tap on a vault</b> to see details and performance history.
                    </IconWithHeading>
                    <IconWithHeading Icon={ICONS.number[2]} color="var(--new-gradient-light)">
                        <b>Select your deposit asset</b> (BeraTrax will auto-convert unsupported assets).
                    </IconWithHeading>
                    <IconWithHeading Icon={ICONS.number[3]} color="var(--new-gradient-light)">
                        <b>Enter the amount you want to stake.</b>
                    </IconWithHeading>
                    <IconWithHeading Icon={ICONS.number[4]} color="var(--new-gradient-light)">
                        <b>Confirm your deposit</b> — BeraTrax automates swaps, LP creation, and vault deposits for you!
                    </IconWithHeading>
                    {/* DEPOSIT SCREE NUMPAD SS */}
                    <img src={userguideimagefive} alt="userguideimagefive" className="m-auto" width={400} />
                    <IconWithHeading Icon={ICONS.check} color="var(--new-gradient-light)">
                        <b>Auto-compounding is enabled by default</b> — your rewards are continuously reinvested to
                        maximize yield.
                    </IconWithHeading>
                    <IconWithHeading Icon={ICONS.check} color="var(--new-gradient-light)">
                        <b>Deposits are gas-free</b> — BeraTrax covers transaction costs for you.
                    </IconWithHeading>
                </>

                {/* SECTION 4 WITHDRAWING */}
                <>
                    <hr />
                    <h1 className="text-4xl leading-none uppercase">Withdrawing & Managing Funds</h1>
                    <h5>Step 1: Withdrawing from a Vault</h5>
                    {/* DEPOSIT AND WITHDRAW BUTTON SS */}
                    <img src={userguideimagesix} alt="userguideimagesix" className="m-auto" width={700} />

                    <IconWithHeading Icon={ICONS.number[1]} color="var(--new-gradient-light)">
                        Go to <b>"My Vaults"</b> on the Dashboard.
                    </IconWithHeading>
                    <IconWithHeading Icon={ICONS.number[2]} color="var(--new-gradient-light)">
                        Click the <b>Withdraw</b> button next to your staked position.
                    </IconWithHeading>
                    <IconWithHeading Icon={ICONS.number[3]} color="var(--new-gradient-light)">
                        Choose to withdraw <b>partial or full </b>funds.
                    </IconWithHeading>
                    <IconWithHeading Icon={ICONS.number[4]} color="var(--new-gradient-light)">
                        Confirm the transaction — your assets will be unstaked and sent to your wallet.
                    </IconWithHeading>

                    <IconWithHeading
                        Icon={ICONS.diamond}
                        size={14}
                        color="transparent"
                        stroke="var(--new-gradient-light)"
                        strokeWidth={1}
                    >
                        <b>BGT & BTX rewards remain in your account</b>, even after withdrawal.
                    </IconWithHeading>
                </>

                {/* SECTION 5 Maximizing Rewards */}
                <>
                    <hr />
                    <h1 className="text-4xl leading-none uppercase">Maximizing Rewards with the BGT Flywheel</h1>
                    <p>
                        BeraTrax <b>automatically optimizes yield</b> using Berachain’s <b>Proof of Liquidity (PoL)</b>{" "}
                        mechanism:
                    </p>
                    <IconWithHeading Icon={ICONS.check} color="var(--new-gradient-light)">
                        <b>All vault fees are pooled and used to bribe validators</b>, increasing BGT emissions for
                        staked users.
                    </IconWithHeading>
                    <IconWithHeading Icon={ICONS.check} color="var(--new-gradient-light)">
                        Users can <b>opt-in to auto-convert BGT into iBGT</b>, earning <b>boosted validator rewards</b>{" "}
                        without extra steps.
                    </IconWithHeading>
                    <IconWithHeading Icon={ICONS.check} color="var(--new-gradient-light)">
                        <b>iBGT is liquid</b>—users can swap, stake, or hold for further rewards.
                    </IconWithHeading>
                    <p>
                        You don’t need to manually participate in Berachain’s PoL system—BeraTrax{" "}
                        <b>does it all for you</b> in the background.
                    </p>
                </>

                {/* SECTION 6 Maximizing Rewards */}
                <>
                    <hr />
                    <h1 className="text-4xl leading-none uppercase">Earning BTX Points by Staking & Referring</h1>
                    <IconWithHeading
                        Icon={ICONS.diamond}
                        size={14}
                        color="transparent"
                        stroke="var(--new-gradient-light)"
                        strokeWidth={1}
                    >
                        <b>BTX Points</b>: Earn points for staking in vaults—these points determine your share of the
                        upcoming BeraTrax token airdrop.
                    </IconWithHeading>
                    <IconWithHeading
                        Icon={ICONS.diamond}
                        size={14}
                        color="transparent"
                        stroke="var(--new-gradient-light)"
                        strokeWidth={1}
                    >
                        <b>Referrals</b>: Grab your unique referral link from the Dashboard. Earn the same BTX points as
                        every user you bring into BeraTrax!
                    </IconWithHeading>
                    <p>~~ &nbsp;The more you stake and refer, the more rewards you earn! 🚀~~ &nbsp;</p>
                </>

                {/* SECTION 7 FAQ */}
                <>
                    <hr />
                    <h1 className="text-4xl leading-none uppercase">Frequently Asked Questions (FAQ)</h1>
                    <IconWithHeading Icon={ICONS.question} color="transparent" stroke="maroon" strokeWidth={1}>
                        <b>What makes BeraTrax different from other DeFi platforms?</b>
                    </IconWithHeading>
                    <p>
                        BeraTrax <b>removes complexity</b>—one-click deposits, gas-free transactions, auto-compounding,
                        and built-in PoL participation make it <b>the easiest way to earn yield on Berachain</b>.
                    </p>
                    <IconWithHeading Icon={ICONS.question} color="transparent" stroke="maroon" strokeWidth={1}>
                        <b>Do I need BERA tokens for gas?</b>
                    </IconWithHeading>
                    <p>
                        No! <b>BeraTrax covers all transaction fees</b>, so you don’t need BERA for gas.
                    </p>
                    <IconWithHeading Icon={ICONS.question} color="transparent" stroke="maroon" strokeWidth={1}>
                        <b>How do I claim my BGT and iBGT rewards?</b>
                    </IconWithHeading>
                    <p>
                        Your earned rewards can be viewed on the <b>Dashboard</b> and claimed at any time. BeraTrax{" "}
                        <b>auto-compounds</b> your rewards so that they are continuously reinvested for higher APY. BGT
                        and iBGT earning opportunities are coming soon.
                    </p>
                    <IconWithHeading Icon={ICONS.question} color="transparent" stroke="maroon" strokeWidth={1}>
                        <b>Is BeraTrax safe?</b>
                    </IconWithHeading>
                    <p>
                        Security is a top priority. BeraTrax only utilizes <b>audited smart contracts</b> and
                        Berachain’s <b>native PoL</b> system to ensure safe, trustless yield farming. We even protect
                        against any unknown exploits using Spherex’s zero day exploit protection on every one of our
                        contracts!
                    </p>
                </>

                {/* SECTION 8 JOIN BERATRAX COMMUNITY */}
                <>
                    <hr />
                    <h1 className="text-4xl leading-none uppercase">Join the BeraTrax Community</h1>
                    <p>Want to stay updated and get involved? Follow us here:</p>

                    <IconWithHeading
                        Icon={GiWorld}
                        color="var(--new-gradient-light)"
                        stroke="var(--new-gradient-light)"
                        strokeWidth={1}
                    >
                        <b>Website:</b>{" "}
                        <Link to={"https://www.beratrax.com/"} className="text-textPrimary underline" target="_blank">
                            beratrax.com
                        </Link>
                    </IconWithHeading>
                    <p>
                        📢 <b>Twitter:</b>{" "}
                        <Link
                            to={"https://twitter.com/BeraTrax"}
                            className="text-textPrimary underline"
                            target="_blank"
                        >
                            @BeraTrax
                        </Link>
                    </p>
                    <IconWithHeading
                        Icon={BsChat}
                        color="transparent"
                        stroke="var(--new-gradient-light)"
                        strokeWidth={1}
                    >
                        <b>Discord:</b>{" "}
                        <Link to={"https://discord.gg/beratrax"} className="text-textPrimary underline" target="_blank">
                            Community Chat
                        </Link>
                    </IconWithHeading>
                </>
                <div>
                    <Link
                        className="self-center justify-self-center text-center uppercase border border-bgPrimary text-bgSecondary bg-bgPrimary hover:border hover:bg-bgSecondary hover:border-gradientPrimary hover:text-gradientPrimary flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer mb-1
                    transition-all duration-200 ease-in-out"
                        to="https://docs.beratrax.com/beratrax-beta/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Full User Docs
                        <AiOutlineExport size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UserGuide;
