import { useChains } from "../../context/ChainsContext";
import { explorerLinkTx } from "../../lib/displayHelpers";
import Button from "../inputs/Button";
import StackableContainer from "../layout/StackableContainer";
import HashView from "./HashView";

interface CompletedTransactionProps {
  readonly transactionHash: string;
}

const CompletedTransaction = ({ transactionHash }: CompletedTransactionProps) => {
  const { chain } = useChains();
  const explorerLink = explorerLinkTx(chain.explorerLink.tx, transactionHash);

  return (
    <StackableContainer lessPadding lessMargin>
      <StackableContainer lessPadding lessMargin lessRadius>
        <div className="confirmation">
          <svg viewBox="0 0 77 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 30L26 51L72 5" stroke="white" strokeWidth="12" />
          </svg>
          <p>This transaction has been broadcast</p>
        </div>
      </StackableContainer>
      <StackableContainer lessPadding lessMargin lessRadius>
        <label>Transaction Hash</label>
        <HashView hash={transactionHash} />
      </StackableContainer>
      {explorerLink && <Button href={explorerLink} label="View in Explorer"></Button>}
      <style jsx>{`
        .confirmation {
          display: flex;
          justify-content: center;
        }
        label {
          font-size: 12px;
          font-style: italic;
          margin-bottom: 0.5em;
        }
        .confirmation svg {
          height: 0.8em;
          margin-right: 0.5em;
        }
      `}</style>
    </StackableContainer>
  );
};
export default CompletedTransaction;
