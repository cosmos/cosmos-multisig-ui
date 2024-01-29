import { isChainInfoFilled } from "@/context/ChainsContext/helpers";
import { Account, StargateClient } from "@cosmjs/stargate";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CreateTxForm from "../../../../components/forms/CreateTxForm";
import Page from "../../../../components/layout/Page";
import StackableContainer from "../../../../components/layout/StackableContainer";
import { useChains } from "../../../../context/ChainsContext";
import { getMultisigAccount } from "../../../../lib/multisigHelpers";

const NewTransactionPage = () => {
  const { chain } = useChains();
  const [accountOnChain, setAccountOnChain] = useState<Account | null>(null);
  const [hasAccountError, setHasAccountError] = useState(false);
  const router = useRouter();
  const multisigAddress = router.query.address?.toString();

  useEffect(() => {
    (async function fetchMultisig() {
      try {
        if (!multisigAddress || !isChainInfoFilled(chain) || !chain.nodeAddress) {
          return;
        }

        const client = await StargateClient.connect(chain.nodeAddress);
        const result = await getMultisigAccount(multisigAddress, chain.addressPrefix, client);

        setAccountOnChain(result[1]);
        setHasAccountError(false);
      } catch (error: unknown) {
        setHasAccountError(true);
        console.error(
          error instanceof Error ? error.message : "Multisig address could not be found",
        );
      }
    })();
  }, [chain, multisigAddress]);

  return (
    <Page
      goBack={
        chain.registryName
          ? {
              pathname: `/${chain.registryName}/${multisigAddress}`,
              title: "multisig",
              needsConfirm: true,
            }
          : undefined
      }
    >
      <StackableContainer base>
        {hasAccountError || !accountOnChain ? (
          <StackableContainer>
            <div className="multisig-error">
              {hasAccountError ? (
                <>
                  <p>
                    This multisig address's pubkeys are not available, and so it cannot be used with
                    this tool.
                  </p>
                  <p>
                    You can recreate it with this tool here, or sign and broadcast a transaction
                    with the tool you used to create it. Either option will make the pubkeys
                    accessible and will allow this tool to use this multisig fully.
                  </p>
                </>
              ) : null}
              {!!accountOnChain ? (
                <p>
                  An account needs to be present on chain before creating a transaction. Send some
                  tokens to the address first.
                </p>
              ) : null}
            </div>
          </StackableContainer>
        ) : null}
        {accountOnChain && multisigAddress ? (
          <CreateTxForm senderAddress={multisigAddress} accountOnChain={accountOnChain} />
        ) : null}
      </StackableContainer>
      <style jsx>{`
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

export default NewTransactionPage;
