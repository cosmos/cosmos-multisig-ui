import HashView from "./HashView";
import StackableContainer from "../layout/StackableContainer";

const uatomToAtom = (uatom) => {
  return uatom / 1000000;
};
export default (props) => (
  <StackableContainer lessPadding lessMargin>
    <ul className="meta-data">
      {props.tx.msgs && (
        <li>
          <label>Amount:</label>
          <div>{uatomToAtom(props.tx.msgs[0].value.amount[0].amount)} ATOM</div>
        </li>
      )}
      {props.tx.msgs && (
        <li>
          <label>To:</label>
          <div title={props.tx.msgs[0].value.toAddress}>
            <HashView hash={props.tx.msgs[0].value.toAddress} />
          </div>
        </li>
      )}
      {props.tx.fee && (
        <li>
          <label>Gas:</label>
          <div>{props.tx.fee.gas} UATOM</div>
        </li>
      )}
      {props.tx.memo && (
        <li>
          <label>Memo:</label>
          <div>{props.tx.memo}</div>
        </li>
      )}
    </ul>
    <style jsx>{`
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .meta-data li {
        margin-top: 10px;
        background: rgba(255, 255, 255, 0.03);
        padding: 6px 10px;
        border-radius: 8px;
        display: flex;
        align-items: center;
      }
      .meta-data li:first-child {
        margin-top: 0;
      }
      .meta-data label {
        font-size: 12px;
        background: rgba(255, 255, 255, 0.1);
        padding: 3px 6px;
        border-radius: 5px;
        display: block;
      }
      .meta-data li div {
        padding: 3px 6px;
      }
    `}</style>
  </StackableContainer>
);
