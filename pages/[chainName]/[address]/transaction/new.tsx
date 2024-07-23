import CreateTxForm from "@/components/forms/CreateTxForm";
import Head from "@/components/head";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { isChainInfoFilled } from "@/context/ChainsContext/helpers";
import { Account } from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import OldCreateTxForm from "../../../../components/forms/OldCreateTxForm";
import Page from "../../../../components/layout/Page";
import StackableContainer from "../../../../components/layout/StackableContainer";
import { useChains } from "../../../../context/ChainsContext";
import { getHostedMultisig, isAccount } from "../../../../lib/multisigHelpers";

export default function CreateTxPage() {
  const { chain } = useChains();
  const [showOldForm, setShowOldForm] = useState(true);
  const [accountOnChain, setAccountOnChain] = useState<Account | null>(null);
  const [hasAccountError, setHasAccountError] = useState(false);
  const router = useRouter();
  const multisigAddress = router.query.address?.toString();

  useEffect(() => {
    (async function fetchAccount() {
      try {
        if (!multisigAddress || !isChainInfoFilled(chain) || !chain.nodeAddress) {
          return;
        }

        const hostedMultisig = await getHostedMultisig(multisigAddress, chain);

        assert(
          hostedMultisig.hosted === "db+chain" && isAccount(hostedMultisig.accountOnChain),
          "Multisig address could not be found",
        );

        setAccountOnChain(hostedMultisig.accountOnChain);
        setHasAccountError(false);
      } catch (error: unknown) {
        setHasAccountError(true);
        console.error(
          error instanceof Error ? error.message : "Multisig address could not be found",
        );
      }
    })();
  }, [chain, multisigAddress]);

  const toggleOldNewForm = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === ".") {
      setShowOldForm((prev) => !prev);
      event.preventDefault();
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keyup", toggleOldNewForm);
    return () => {
      window.removeEventListener("keyup", toggleOldNewForm);
    };
  }, [toggleOldNewForm]);

  return showOldForm ? (
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
          <OldCreateTxForm senderAddress={multisigAddress} accountOnChain={accountOnChain} />
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
  ) : (
    <div className="m-4 mt-8 flex max-w-xl flex-1 flex-col justify-center gap-4">
      <Head title={`${chain.chainDisplayName || "Cosmos Hub"} Multisig Manager`} />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              {chain.registryName ? <Link href={`/${chain.registryName}`}>Home</Link> : null}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              {chain.registryName ? (
                <Link href={`/${chain.registryName}/${multisigAddress}`}>Multisig</Link>
              ) : null}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Account</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <CreateTxForm />
    </div>
  );
}
