import React, { useState } from "react";
import { useRouter } from "next/router";

import ConnectWallet from "../../../components/forms/ConnectWallet";
import MultisigHoldings from "../../../components/dataViews/MultisigHoldings";
import MultisigMembers from "../../../components/dataViews/MultisigMembers";
import Page from "../../../components/layout/Page";
import StackableContainer from "../../../components/layout/StackableContainer";
import TransactionForm from "../../../components/forms/TransactionForm";
import TransactionList from "../../../components/dataViews/TransactionList";

const multipage = (props) => {
  const [showTxForm, setShowTxForm] = useState(false);
  const router = useRouter();
  const { address } = router.query;
  return (
    <Page>
      <StackableContainer base>
        <StackableContainer>
          <label>Multisig Address</label>
          <h1>cosmos1fjrzd7ycxzse05zme3r2zqwpsvcrskv80wj82h</h1>
        </StackableContainer>
        {showTxForm ? (
          <TransactionForm address={address} />
        ) : (
          <div className="interfaces">
            <div className="col-1">
              <MultisigMembers address={address} />
              <TransactionList address={address} />
            </div>
            <div className="col-2">
              <MultisigHoldings address={address} />
              <ConnectWallet onConnect={setShowTxForm} />
            </div>
          </div>
        )}
      </StackableContainer>
      <style jsx>{`
        .interfaces {
          display: flex;
          justify-content: space-between;
          margin-top: 50px;
        }
        .col-1 {
          flex: 2;
          padding-right: 50px;
        }
        .col-2 {
          flex: 1;
        }
        label {
          font-size: 12px;
          font-style: italic;
        }
      `}</style>
    </Page>
  );
};

export default multipage;
