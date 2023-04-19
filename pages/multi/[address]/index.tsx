import { MultisigThresholdPubkey, SinglePubkey } from "@cosmjs/amino";
import { Account, StargateClient } from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import HashView from "../../../components/dataViews/HashView";
import MultisigHoldings from "../../../components/dataViews/MultisigHoldings";
import MultisigMembers from "../../../components/dataViews/MultisigMembers";
import DelegationForm from "../../../components/forms/DelegationForm";
import ReDelegationForm from "../../../components/forms/ReDelegationForm";
import RewardsForm from "../../../components/forms/RewardsForm";
import TransactionForm from "../../../components/forms/TransactionForm";
import UnDelegationForm from "../../../components/forms/UnDelegationForm";
import Button from "../../../components/inputs/Button";
import Page from "../../../components/layout/Page";
import StackableContainer from "../../../components/layout/StackableContainer";
import { useAppContext } from "../../../context/AppContext";
import { getMultisigAccount } from "../../../lib/multisigHelpers";

type TxView = null | "send" | "delegate" | "undelegate" | "redelegate" | "claimRewards";

function participantPubkeysFromMultisig(
  multisig: MultisigThresholdPubkey,
): readonly SinglePubkey[] {
  return multisig.value.pubkeys;
}

const Multipage = () => {
  const { state } = useAppContext();
  const [txView, setTxView] = useState<TxView>(null);
  const [holdings, setHoldings] = useState<readonly Coin[]>([]);
  const [multisigAddress, setMultisigAddress] = useState("");
  const [accountOnChain, setAccountOnChain] = useState<Account | null>(null);
  const [pubkey, setPubkey] = useState<MultisigThresholdPubkey>();
  const [accountError, setAccountError] = useState(null);
  const router = useRouter();

  const closeForm = () => {
    setTxView(null);
  };

  const fetchMultisig = useCallback(
    async (address: string) => {
      setAccountError(null);
      try {
        assert(state.chain.nodeAddress, "Node address missing");
        const client = await StargateClient.connect(state.chain.nodeAddress);
        assert(state.chain.denom, "denom missing");
        const tempHoldings = await client.getAllBalances(address);
        setHoldings(tempHoldings);
        assert(state.chain.addressPrefix, "addressPrefix missing");
        const [newPubkey, newAccountOnChain] = await getMultisigAccount(
          address,
          state.chain.addressPrefix,
          client,
        );
        setPubkey(newPubkey);
        setAccountOnChain(newAccountOnChain);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setAccountError(error.message);
        console.log("Account error:", error);
      }
    },
    [state.chain.addressPrefix, state.chain.denom, state.chain.nodeAddress],
  );

  useEffect(() => {
    const address = router.query.address?.toString();
    if (address) {
      setMultisigAddress(address);
      fetchMultisig(address);
    }
  }, [fetchMultisig, router.query.address]);

  assert(state.chain.addressPrefix, "address prefix missing");

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
        {pubkey && (
          <MultisigMembers
            members={participantPubkeysFromMultisig(pubkey)}
            addressPrefix={state.chain.addressPrefix}
            threshold={pubkey.value.threshold}
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
        {txView === "send" && (
          <TransactionForm
            address={multisigAddress}
            accountOnChain={accountOnChain}
            closeForm={closeForm}
          />
        )}
        {txView === "delegate" && (
          <DelegationForm
            delegatorAddress={multisigAddress}
            accountOnChain={accountOnChain}
            closeForm={closeForm}
          />
        )}
        {txView === "undelegate" && (
          <UnDelegationForm
            delegatorAddress={multisigAddress}
            accountOnChain={accountOnChain}
            closeForm={closeForm}
          />
        )}
        {txView === "redelegate" && (
          <ReDelegationForm
            delegatorAddress={multisigAddress}
            accountOnChain={accountOnChain}
            closeForm={closeForm}
          />
        )}
        {txView === "claimRewards" && (
          <RewardsForm
            delegatorAddress={multisigAddress}
            accountOnChain={accountOnChain}
            closeForm={closeForm}
          />
        )}
        {txView === null && (
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
                    setTxView("send");
                  }}
                />
                <Button
                  label="Create Delegation"
                  onClick={() => {
                    setTxView("delegate");
                  }}
                />
                <Button
                  label="Create UnDelegation"
                  onClick={() => {
                    setTxView("undelegate");
                  }}
                />
                <Button
                  label="Create Redelegate"
                  onClick={() => {
                    setTxView("redelegate");
                  }}
                />
                <Button
                  label="Claim Rewards"
                  onClick={() => {
                    setTxView("claimRewards");
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
          flex-direction: column;
        }
        .col-1 {
          flex: 1;
          padding-right: 0;
          margin-bottom: 50px;
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
          max-width: 100%;
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

export default Multipage;
