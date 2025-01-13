import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isChainInfoFilled } from "@/context/ChainsContext/helpers";
import { checkAddress } from "@/lib/displayHelpers";
import { getKeplrKey } from "@/lib/keplr";
import {
  HostedMultisig,
  createMultisigFromCompressedSecp256k1Pubkeys,
  getHostedMultisig,
} from "@/lib/multisigHelpers";
import { toastError } from "@/lib/utils";
import { isMultisigThresholdPubkey, isSecp256k1Pubkey, pubkeyToAddress } from "@cosmjs/amino";
import { assert } from "@cosmjs/utils";
import copy from "copy-to-clipboard";
import { AlertCircle, ArrowUpRightSquare, Copy, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useChains } from "../../../context/ChainsContext";
import { Button } from "../../ui/button";
import BalancesTable from "../BalancesTable";
import ListMultisigTxs from "../ListMultisigTxs";

export default function MultisigView() {
  const router = useRouter();
  const { chain } = useChains();
  const [hostedMultisig, setHostedMultisig] = useState<HostedMultisig>();

  const multisigAddress = typeof router.query.address === "string" ? router.query.address : null;

  useEffect(() => {
    (async function updateHostedMultisig() {
      try {
        if (!multisigAddress || !isChainInfoFilled(chain) || !chain.nodeAddress) {
          return;
        }

        const newHostedMultisig = await getHostedMultisig(multisigAddress, chain);

        // If the multisig is on chain and not on DB, automatically create it on DB and reload the view
        if (newHostedMultisig.hosted === "chain" && newHostedMultisig.accountOnChain?.pubkey) {
          assert(
            isMultisigThresholdPubkey(newHostedMultisig.accountOnChain.pubkey),
            "Pubkey on chain is not of type MultisigThreshold",
          );

          const { bech32Address: address } = await getKeplrKey(chain.chainId);

          await createMultisigFromCompressedSecp256k1Pubkeys(
            newHostedMultisig.accountOnChain.pubkey.value.pubkeys.map((p) => p.value),
            Number(newHostedMultisig.accountOnChain.pubkey.value.threshold),
            chain.addressPrefix,
            chain.chainId,
            address,
          );

          router.reload();
        }

        setHostedMultisig(newHostedMultisig);
      } catch (e) {
        console.error("Failed to find multisig:", e);
        toastError({
          description: "Failed to find multisig",
          fullError: e instanceof Error ? e : undefined,
        });
      }
    })();
  }, [chain, multisigAddress, router]);

  const explorerLink =
    hostedMultisig?.hosted === "chain" || hostedMultisig?.hosted === "db+chain"
      ? hostedMultisig.explorerLink
      : null;

  const pubkey =
    hostedMultisig?.hosted === "db" || hostedMultisig?.hosted === "db+chain"
      ? hostedMultisig.pubkeyOnDb
      : null;

  return (
    <div className="mt-6 flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Multisig info</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {multisigAddress ? (
            <div
              onClick={async () => {
                copy(multisigAddress);
                toast(`Copied address to clipboard`, { description: multisigAddress });
              }}
              className="flex items-center space-x-4 rounded-md border p-4 transition-colors hover:cursor-pointer hover:bg-muted/50"
            >
              <Copy className="w-5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Multisig address</p>
                <p className="text-sm text-muted-foreground">{multisigAddress}</p>
              </div>
            </div>
          ) : null}
          {!hostedMultisig ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" />
              <p>Loading multisig info</p>
            </div>
          ) : null}
          {explorerLink ? (
            <Button asChild variant="secondary">
              <a href={explorerLink} target="_blank">
                View in explorer <ArrowUpRightSquare className="ml-1" />
              </a>
            </Button>
          ) : null}
          {pubkey ? (
            <>
              <h4 className="font-bold">Members</h4>
              <div className="mx-4 flex flex-col gap-2">
                {pubkey.value.pubkeys.map((member) => {
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
              <div className="flex items-center gap-1 text-sm text-secondary">
                <Info className="text-secondary" />
                <p>
                  {pubkey.value.threshold}{" "}
                  {pubkey.value.threshold === "1" ? "signature" : "signatures"} needed to send a
                  transaction.
                </p>
              </div>
            </>
          ) : null}
          {hostedMultisig?.hosted === "nowhere" ? (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {checkAddress(multisigAddress || "", chain.addressPrefix) ? (
                  <p>
                    The multisig address does not look like it belongs to {chain.chainDisplayName}{" "}
                    and it was not found neither on the network nor on the tool's database. You need
                    to create it using this tool.
                  </p>
                ) : (
                  <p>
                    The multisig address was not found neither on the network nor on the tool's
                    database. You need to create it using this tool.
                  </p>
                )}
                <Button
                  asChild
                  className="mt-2 border border-black/50 bg-white text-amber-600 hover:bg-white"
                >
                  <Link href={`/${chain.registryName}/create`}>Create new multisig</Link>
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}
          {hostedMultisig?.hosted === "db" ? (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                After creating the multisig you need to send some tokens to its address so that it
                appears on the network.
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
      {hostedMultisig?.hosted === "db+chain" && multisigAddress ? (
        <>
          <Button asChild variant="secondary" className="my-4">
            <a href={`/${chain.registryName}/${multisigAddress}/transaction/new`}>
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
              <BalancesTable walletAddress={multisigAddress} />
            </CardContent>
          </Card>
        </>
      ) : null}
      {hostedMultisig?.hosted === "db+chain" && multisigAddress ? (
        <ListMultisigTxs
          multisigAddress={multisigAddress}
          multisigThreshold={Number(hostedMultisig.pubkeyOnDb.value.threshold)}
        />
      ) : null}
    </div>
  );
}
