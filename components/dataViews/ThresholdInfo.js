import StackableContainer from "../layout/StackableContainer";

const ThresholdInfo = ({ signatures, account }) => (
  <StackableContainer lessPadding lessMargin>
    <h2>Signatures</h2>
    <StackableContainer lessPadding lessMargin lessRadius>
      <p>
        Once the number of required signatures have been created, this
        transaction will be ready to broadcast.
      </p>
    </StackableContainer>
    <StackableContainer lessPadding lessMargin lessRadius>
      <div className="threshold">
        <div className="current">{signatures.length}</div>
        <div className="label divider">of</div>
        <div className="required">{account.pubkey.value.threshold}</div>
        <div className="label">signatures complete</div>
      </div>
    </StackableContainer>
    <style jsx>{`
      .threshold {
        display: flex;
        font-size: 30px;
        justify-content: center;
        align-items: center;
      }
      .threshold div {
        padding: 0 5px;
      }
      .label {
        font-size: 16px;
      }
      p {
        margin-top: 1em;
      }
      p:first-child {
        margin-top: 0;
      }
    `}</style>
  </StackableContainer>
);
export default ThresholdInfo;
