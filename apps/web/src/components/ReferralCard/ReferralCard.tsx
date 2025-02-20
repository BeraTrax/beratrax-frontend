
interface Props {
    heading: string;
    address: string | undefined;
}

export const ReferralCard: React.FC<Props> = ({ heading, address }) => {
    return (
        <div className={`colorContainer w-auto p-5 box-border flex flex-col justify-between`}>
            <p className={"text-xl font-bold m-0 leading-none"}>{heading}</p>
            <p className={"text-[40px] font-bold leading-none"}>{`${address?.substring(0, 2)}...${address?.substring(address.length - 4)}`}</p>
        </div>
    );
};
