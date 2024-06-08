import { printVoteOption } from "@/lib/gov";
import { MsgVote } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import HashView from "../HashView";

interface TxMsgVoteDetailsProps {
  readonly msgValue: MsgVote;
}

const TxMsgVoteDetails = ({ msgValue }: TxMsgVoteDetailsProps) => {
  return (
    <>
      <li>
        <h3>MsgVote</h3>
      </li>
      <li>
        <label>Voter:</label>
        <div title={msgValue.voter}>
          <HashView hash={msgValue.voter} />
        </div>
      </li>
      <li>
        <label>Proposal ID:</label>
        <div>{msgValue.proposalId.toString()}</div>
      </li>
      <li>
        <label>Voted:</label>
        <div>{printVoteOption(msgValue.option)}</div>
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

export default TxMsgVoteDetails;
