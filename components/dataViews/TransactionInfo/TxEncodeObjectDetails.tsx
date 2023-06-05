import { EncodeObject } from "@cosmjs/proto-signing";

interface TxEncodeObjectDetailsProps {
  readonly msg: EncodeObject;
}

const TxEncodeObjectDetails = ({ msg }: TxEncodeObjectDetailsProps) => (
  <>
    <li>
      <h3>Custom EncodeObject</h3>
    </li>
    <li>
      <label>Type URL:</label>
      <div>{msg.typeUrl}</div>
    </li>
    <li>
      <label>Value:</label>
      <div>{JSON.stringify(msg.value, null, 2)}</div>
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

export default TxEncodeObjectDetails;
