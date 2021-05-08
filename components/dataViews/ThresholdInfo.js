import StackableContainer from "../layout/StackableContainer";

export default ({ signatures, account }) => (
  <StackableContainer lessPadding lessMargin>
    <h2>Signatures</h2>
    <div className="threshold">
      <div className="current">{signatures.length}</div>
      <div className="divider">of</div>
      <div className="required">{account.pubkey.value.threshold}</div>
    </div>
    <style jsx>{`
      .threshold {
        display: flex;
      }
    `}</style>
  </StackableContainer>
);
