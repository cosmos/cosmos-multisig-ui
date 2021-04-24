import React, { useState } from "react";
import { StargateClient } from "@cosmjs/stargate";
import { useRouter } from "next/router";

import Button from "../../../components/inputs/Button";
import { getMultisigAccount } from "../../../lib/multisigHelpers";
import MultisigHoldings from "../../../components/dataViews/MultisigHoldings";
import MultisigMembers from "../../../components/dataViews/MultisigMembers";
import Page from "../../../components/layout/Page";
import StackableContainer from "../../../components/layout/StackableContainer";
import TransactionForm from "../../../components/forms/TransactionForm";
import TransactionList from "../../../components/dataViews/TransactionList";

export async function getServerSideProps(context) {
  const client = await StargateClient.connect("143.198.6.14:26657");
  const multisigAddress = context.params.address;
  const holdings = await client.getBalance(multisigAddress, "uatom");
  const accountOnChain = await getMultisigAccount(multisigAddress, client);

  return {
    props: { accountOnChain, holdings: holdings.amount / 1000000 },
  };
}

const multipage = (props) => {
  const [showTxForm, setShowTxForm] = useState(false);
  const router = useRouter();
  const { address } = router.query;
  return (
    <Page>
      <StackableContainer base>
        <StackableContainer>
          <label>Multisig Address</label>
          <h1>{address}</h1>
        </StackableContainer>
        {showTxForm ? (
          <TransactionForm
            address={address}
            accountOnChain={props.accountOnChain}
            holdings={props.holdings}
            closeForm={() => {
              setShowTxForm(false);
            }}
          />
        ) : (
          <div className="interfaces">
            <div className="col-1">
              <MultisigHoldings holdings={props.holdings} />
            </div>
            <div className="col-2">
              <StackableContainer lessPadding>
                <h2>New transaction</h2>
                <p>
                  Once a transaction is created, it can be signed by the
                  multisig members, and then broadcast.
                </p>
                <Button
                  label="Create Transaction"
                  onClick={() => {
                    setShowTxForm(true);
                  }}
                />
              </StackableContainer>
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
          flex: 1;
          padding-right: 50px;
        }
        .col-2 {
          flex: 1;
        }
        label {
          font-size: 12px;
          font-style: italic;
        }
        p {
          margin-top: 15px;
        }
      `}</style>
    </Page>
  );
};

export default multipage;
