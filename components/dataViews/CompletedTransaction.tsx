import React from "react";

import StackableContainer from "../layout/StackableContainer";
import HashView from "./HashView";
import Button from "../inputs/Button";
import { explorerLinkTx } from "../../lib/displayHelpers";
import { useAppContext } from "../../context/AppContext";

interface Props {
  transactionHash: string;
}

const CompletedTransaction = ({ transactionHash }: Props) => {
  const { state } = useAppContext();
  const baseURL = state.chain.explorerLink ? state.chain.explorerLink : "";
  const explorerLink = explorerLinkTx(baseURL, transactionHash);
  return (
    <StackableContainer lessPadding lessMargin>
      <StackableContainer lessPadding lessMargin lessRadius>
        <div className="confirmation">
          <svg viewBox="0 0 77 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 30L26 51L72 5" stroke="white" strokeWidth="12" />
          </svg>
          <p>This transaction has been broadcast.</p>
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
