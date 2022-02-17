import React from "react";
import { withRouter } from "next/router";

import Button from "../../components/inputs/Button";
import StackableContainer from "../layout/StackableContainer";

const TransactionForm = () => {
  return (
    <StackableContainer lessPadding>
      <h2>New transaction</h2>
      <p>Connect your wallet to create a new transaction.</p>
      <Button
        label="Connect Wallet"
        onClick={() => {
          this.props.onConnect(true);
        }}
      />
      <style jsx>{`
        p {
          margin-top: 15px;
        }
      `}</style>
    </StackableContainer>
  );
};

export default withRouter(TransactionForm);
