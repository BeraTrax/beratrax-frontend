import backiconarrow from "@beratrax/core/src/assets/images/backiconarrow.svg";
import backiconbg from "@beratrax/core/src/assets/images/backiconbg.svg";
import { FC } from "react";

interface IProps {
    onClick: () => void;
    className?: string;
}

const BackIcon = () => {
    return (
        <div className="relative rounded-lg">
            <img src={backiconbg} alt="" className=" rounded-[10px]" />
            <img src={backiconarrow} alt="backIcon" className="absolute top-[30%] right-[26%] " />
        </div>
    );
};

const BackButton: FC<IProps> = ({ className, onClick }) => {
    return (
        <button onClick={onClick} className={`bg-btnBgSecondary px-4 py-3 rounded-lg ${className}`}>
            {/* <svg xmlns="http://www.w3.org/2000/svg" width={7} height={12} viewBox="0 0 7 12" fill="none">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.09863 11.3333L0.666577 5.90129L0.726707 5.84116L0.666667 5.78112L6.09872 0.349062L6.80583 1.05617L2.02075 5.84125L6.80574 10.6262L6.09863 11.3333Z"
                    fill="#90BB62"
                />
            </svg> */}
            <BackIcon />
        </button>
    );
};

export default BackButton;
