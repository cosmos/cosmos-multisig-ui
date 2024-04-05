import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isChainInfoFilled } from "@/context/ChainsContext/helpers";
import { explorerLinkAccount } from "@/lib/displayHelpers";
import { getMultisigAccount } from "@/lib/multisigHelpers";
import { toastError } from "@/lib/utils";
import { SinglePubkey, isSecp256k1Pubkey, pubkeyToAddress } from "@cosmjs/amino";
import { StargateClient } from "@cosmjs/stargate";
import copy from "copy-to-clipboard";
import { AlertCircle, ArrowUpRightSquare, Copy, Info } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useChains } from "../../../context/ChainsContext";
import { Button } from "../../ui/button";
import BalancesTable from "../BalancesTable";

type MultisigInfo =
  | {
      readonly status: "success";
      readonly address: string;
      readonly members: readonly SinglePubkey[];
      readonly threshold: string;
    }
  | {
      readonly status: "error";
      readonly error: "account-not-found" | "pubkeys-unavailable";
    }
  | {
      readonly status: "loading";
    };

export default function MultisigView() {
  const router = useRouter();
  const { chain } = useChains();

  const [multisigInfo, setMultisigInfo] = useState<MultisigInfo>({ status: "loading" });

  useEffect(() => {
    (async function fetchMultisigInfo() {
      try {
        const multisigAddress =
          typeof router.query.address === "string" ? router.query.address : null;

        if (!multisigAddress || !chain.nodeAddress || !isChainInfoFilled(chain)) {
          return;
        }

        const client = await StargateClient.connect(chain.nodeAddress);
        const [pubkey, account] = await getMultisigAccount(
          multisigAddress,
          chain.addressPrefix,
          client,
        );

        if (!account) {
          setMultisigInfo({ status: "error", error: "account-not-found" });
        } else {
          setMultisigInfo({
            status: "success",
            address: account.address,
            members: pubkey.value.pubkeys,
            threshold: pubkey.value.threshold,
          });
        }
      } catch (e) {
        console.error("Failed to find multisig:", e);
        setMultisigInfo({ status: "error", error: "pubkeys-unavailable" });
        toastError({
          description: "Failed to find multisig",
          fullError: e instanceof Error ? e : undefined,
        });
      }
    })();
  }, [chain, router.query.address]);

  const explorerLink =
    multisigInfo.status === "success"
      ? explorerLinkAccount(chain.explorerLinks.account, multisigInfo.address)
      : null;

  return (
    <div className="mt-6 flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Multisig info</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {multisigInfo.status === "success" ? (
            <>
              <div
                onClick={async () => {
                  copy(multisigInfo.address);
                  toast(`Copied address to clipboard`, { description: multisigInfo.address });
                }}
                className=" flex items-center space-x-4 rounded-md border p-4 transition-colors hover:cursor-pointer hover:bg-muted/50"
              >
                <Copy className="w-5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Multisig address</p>
                  <p className="text-sm text-muted-foreground">{multisigInfo.address}</p>
                </div>
              </div>
              {explorerLink ? (
                <Button asChild variant="secondary">
                  <a href={explorerLink} target="_blank">
                    View in explorer <ArrowUpRightSquare className="ml-1" />
                  </a>
                </Button>
              ) : null}
              <h4 className="font-bold">Members</h4>
              <div className="mx-4 flex flex-col gap-2">
                {multisigInfo.members.map((member) => {
                  const memberAddress = pubkeyToAddress(member, chain.addressPrefix);
                  // simplePubkey is base64 encoded compressed secp256k1 in almost every case. The fallback is added to be safe though.
                  const simplePubkey = isSecp256k1Pubkey(member)
                    ? member.value
                    : `${member.type} pubkey`;

                  return (
                    <div
                      key={memberAddress}
                      onClick={async () => {
                        copy(memberAddress);
                        toast(`Copied address to clipboard`, { description: memberAddress });
                      }}
                      className="flex items-center space-x-2 rounded-md border p-2 transition-colors hover:cursor-pointer hover:bg-muted/50"
                    >
                      <Copy className="w-5" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{memberAddress}</p>
                        <p className="text-sm text-muted-foreground">{simplePubkey}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">Threshold = {multisigInfo.threshold}</Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-secondary">
                <Info className="text-secondary" />
                <p>
                  Transactions need to be signed by {multisigInfo.threshold} out of the{" "}
                  {multisigInfo.members.length} members.
                </p>
              </div>
            </>
          ) : null}
          {multisigInfo.status === "error" ? (
            <>
              {multisigInfo.error === "account-not-found" ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    An account needs to be present on chain before creating a transaction. Send some
                    tokens to the address first.
                  </AlertDescription>
                </Alert>
              ) : null}
              {multisigInfo.error === "pubkeys-unavailable" ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    <p>
                      This multisig address's pubkeys are not available, and so it cannot be used
                      with this tool.
                    </p>
                    <p className="mt-2">
                      You can recreate it with this tool here, or sign and broadcast a transaction
                      with the tool you used to create it. Either option will make the pubkeys
                      accessible and will allow this tool to use this multisig fully.
                    </p>
                  </AlertDescription>
                </Alert>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>
      {multisigInfo.status === "success" ? (
        <>
          <Button asChild variant="secondary" className="my-4">
            <a href={`/${chain.registryName}/${multisigInfo.address}/transaction/new`}>
              Create new transaction
            </a>
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>Holdings</CardTitle>
              <CardDescription>
                This multisig's list of tokens on {chain.chainDisplayName || "Cosmos Hub"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BalancesTable walletAddress={multisigInfo.address} />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
