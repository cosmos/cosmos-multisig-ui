import React, { useState, useEffect } from "react";
import { pubkeyToAddress, Pubkey } from "@cosmjs/amino";
import { Account } from "@cosmjs/stargate";
import { StargateClient } from "@cosmjs/stargate";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { useRouter } from "next/router";

import { useAppContext } from "../../../context/AppContext";
import Button from "../../../components/inputs/Button";
import { getMultisigAccount } from "../../../lib/multisigHelpers";
import HashView from "../../../components/dataViews/HashView";
import MultisigHoldings from "../../../components/dataViews/MultisigHoldings";
import MultisigMembers from "../../../components/dataViews/MultisigMembers";
import Page from "../../../components/layout/Page";
import StackableContainer from "../../../components/layout/StackableContainer";
import TransactionForm from "../../../components/forms/TransactionForm";

function participantPubkeysFromMultisig(multisigPubkey: Pubkey) {
  return multisigPubkey.value.pubkeys;
}

function participantAddressesFromMultisig(multisigPubkey: Pubkey, addressPrefix: string) {
  return participantPubkeysFromMultisig(multisigPubkey).map((p: Pubkey) =>
    pubkeyToAddress(p, addressPrefix),
  );
}

interface Props {}

const multipage = (_props: Props) => {
  const { state } = useAppContext();
  const [showTxForm, setShowTxForm] = useState(false);
  const [holdings, setHoldings] = useState<Coin | null>(null);
  const [multisigAddress, setMultisigAddress] = useState("");
  const [accountOnChain, setAccountOnChain] = useState<Account | null>(null);
  const [accountError, setAccountError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const address = router.query.address?.toString();
    if (address) {
      setMultisigAddress(address);
      fetchMultisig(address);
    }
  }, [state, router.query.address]);

  const fetchMultisig = async (address: string) => {
    setAccountError(null);
    try {
      const client = await StargateClient.connect(state!.chain.nodeAddress!);
      const tempHoldings = await client.getBalance(address, state!.chain.denom!);
      const tempAccountOnChain = await getMultisigAccount(address, client);
      setHoldings(tempHoldings);
      setAccountOnChain(tempAccountOnChain);
    } catch (error: any) {
      setAccountError(error.message);
      console.log("Account error:", error);
    }
  };

  return (
    <Page>
      <StackableContainer base>
        <StackableContainer>
          <label>Multisig Address</label>
          <h1>
            {router.query.address ? (
              <HashView hash={router.query.address?.toString()} />
            ) : (
              "No Address"
            )}
          </h1>
        </StackableContainer>
        {accountOnChain?.pubkey && (
          <MultisigMembers
            members={participantAddressesFromMultisig(
              accountOnChain?.pubkey,
              state!.chain.addressPrefix!,
            )}
            threshold={accountOnChain?.pubkey.value.threshold}
          />
        )}
        {accountError && (
          <StackableContainer>
            <div className="multisig-error">
              <p>
                This multisig address's pubkeys are not available, and so it cannot be used with
                this tool.
              </p>
              <p>
                You can recreate it with this tool here, or sign and broadcast a transaction with
                the tool you used to create it. Either option will make the pubkeys accessible and
                will allow this tool to use this multisig fully.
              </p>
            </div>
          </StackableContainer>
        )}
        {showTxForm ? (
          <TransactionForm
            address={multisigAddress}
            accountOnChain={accountOnChain}
            closeForm={() => {
              setShowTxForm(false);
            }}
          />
        ) : (
          <div className="interfaces">
            <div className="col-1">
              <MultisigHoldings holdings={holdings} />
            </div>
            <div className="col-2">
              <StackableContainer lessPadding>
                <h2>New transaction</h2>
                <p>
                  Once a transaction is created, it can be signed by the multisig members, and then
                  broadcast.
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
        .multisig-error p {
          max-width: 550px;
          color: red;
          font-size: 16px;
          line-height: 1.4;
        }
        .multisig-error p:first-child {
          margin-top: 0;
        }
      `}</style>
    </Page>
  );
};

export default multipage;
