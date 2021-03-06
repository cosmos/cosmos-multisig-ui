import { abbreviateLongString } from "../../lib/displayHelpers";
import StackableContainer from "../layout/StackableContainer";

export default (props) => (
  <StackableContainer lessPadding lessMargin>
    <ul className="meta-data">
      {props.tx.amount && (
        <li>
          <label>Amount:</label>
          <div>{props.tx.amount} ATOM</div>
        </li>
      )}
      {props.tx.to && (
        <li>
          <label>To:</label>
          <div title={props.tx.to}>
            {props.abbreviate ? abbreviateLongString(props.tx.to) : props.tx.to}
          </div>
        </li>
      )}

      {props.tx.txHash && (
        <li>
          <label>Tx Hash:</label>
          <div title={props.tx.txHash}>
            {abbreviateLongString(props.tx.txHash)}
          </div>
        </li>
      )}
      {props.tx.status && (
        <li>
          <label>Status:</label>
          <div>{props.tx.status}</div>
        </li>
      )}
      {props.tx.fee && (
        <li>
          <label>Fee:</label>
          <div>{props.tx.fee}</div>
        </li>
      )}
      {props.tx.time && (
        <li>
          <label>Date:</label>
          <div>{props.tx.time}</div>
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
