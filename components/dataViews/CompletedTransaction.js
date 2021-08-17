import StackableContainer from "../layout/StackableContainer";
import Button from "../inputs/Button";

export default ({ transactionHash }) => (
  <StackableContainer lessPadding lessMargin>
    This transaction has been broadcast.
    <Button
      href={`https://www.mintscan.io/cosmos/txs/${transactionHash}`}
      label=" View on Mintscan"
    ></Button>
    <style jsx>{``}</style>
  </StackableContainer>
);
