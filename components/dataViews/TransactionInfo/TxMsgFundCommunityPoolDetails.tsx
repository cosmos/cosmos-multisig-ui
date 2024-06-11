import { MsgFundCommunityPool } from "cosmjs-types/cosmos/distribution/v1beta1/tx";
import { useChains } from "../../../context/ChainsContext";
import { printableCoins } from "../../../lib/displayHelpers";

interface TxMsgFundCommunityPoolDetailsProps {
  readonly msgValue: MsgFundCommunityPool;
}

const TxMsgFundCommunityPoolDetails = ({ msgValue }: TxMsgFundCommunityPoolDetailsProps) => {
  const { chain } = useChains();

  return (
    <>
      <li>
        <h3>MsgFundCommunityPool</h3>
      </li>
      <li>
        <label>Amount:</label>
        <div>{printableCoins(msgValue.amount, chain) || "None"}</div>
      </li>
      <style jsx>{`
        li:not(:has(h3)) {
          background: rgba(255, 255, 255, 0.03);
          padding: 6px 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
        }
        li + li:nth-child(2) {
          margin-top: 25px;
        }
        li + li {
          margin-top: 10px;
        }
        li div {
          padding: 3px 6px;
        }
        label {
          font-size: 12px;
          background: rgba(255, 255, 255, 0.1);
          padding: 3px 6px;
          border-radius: 5px;
          display: block;
        }
      `}</style>
    </>
  );
};

export default TxMsgFundCommunityPoolDetails;
