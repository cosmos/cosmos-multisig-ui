import { useChains } from "@/context/ChainsContext";
import { DbTransaction } from "@/graphql";
import { getDbMultisigTxs, getDbNonce } from "@/lib/api";
import { ellideMiddle } from "@/lib/displayHelpers";
import { getConnectError } from "@/lib/errorHelpers";
import { getKeplrKey, getKeplrVerifySignature, useKeplrReconnect } from "@/lib/keplr";
import { msgTypeCountsFromJson } from "@/lib/txMsgHelpers";
import { cn, toastError } from "@/lib/utils";
import { WalletInfo } from "@/types/signing";
import { toBase64 } from "@cosmjs/encoding";
import { StargateClient } from "@cosmjs/stargate";
import { Loader2, MoveRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface ListMultisigTxsProps {
  readonly multisigAddress: string;
  readonly multisigThreshold: number;
}

export default function ListMultisigTxs({
  multisigAddress,
  multisigThreshold,
}: ListMultisigTxsProps) {
  const { chain } = useChains();

  const [loading, setLoading] = useState(false);
  const [walletInfo, setWalletInfo] = useState<Omit<WalletInfo, "type"> | null>(null);
  const [showBroadcasted, setShowBroadcasted] = useState(false);
  const [transactions, setTransactions] = useState<readonly DbTransaction[] | null>(null);

  const pendingTxs = transactions?.filter(({ txHash }) => !txHash) ?? null;

  const getSignature = useCallback(
    async (address: string) => {
      const client = await StargateClient.connect(chain.nodeAddress);
      const accountOnChain = await client.getAccount(address);

      if (!accountOnChain) {
        throw new Error(`Account not found on chain for ${address}`);
      }

      const nonce = await getDbNonce(accountOnChain.address, chain.chainId);

      const signature = await getKeplrVerifySignature(accountOnChain.address, chain, nonce);
      return signature;
    },
    [chain],
  );

  const fetchTransactions = useCallback(
    async (address: string) => {
      try {
        const signature = await getSignature(address);
        const fetchedTransactions = await getDbMultisigTxs(multisigAddress, chain, signature);
        setTransactions(fetchedTransactions);
      } catch (e: unknown) {
        console.error("Failed to fetch transactions:", e);
        toastError({
          description: "Failed to fetch transactions",
          fullError: e instanceof Error ? e : undefined,
        });
      }
    },
    [chain, getSignature, multisigAddress],
  );

  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);

      const { bech32Address: address, pubKey: pubKeyArray } = await getKeplrKey(chain.chainId);
      const pubKey = toBase64(pubKeyArray);
      setWalletInfo({ address, pubKey });

      await fetchTransactions(address);
    } catch (e) {
      const connectError = getConnectError(e);
      console.error(connectError, e);
      toastError({
        description: connectError,
        fullError: e instanceof Error ? e : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [chain.chainId, fetchTransactions]);

  useKeplrReconnect(!!walletInfo?.address, connectWallet);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>
          The list of transactions created by this multisig. Verify your identity with Keplr by
          signing a message for free.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {!walletInfo && !transactions ? (
          <Button onClick={connectWallet} disabled={loading} variant="outline">
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Image
                alt=""
                src={`/assets/icons/keplr.svg`}
                width={20}
                height={20}
                className="mr-2"
              />
            )}
            Verify identity
          </Button>
        ) : null}
        {walletInfo && !transactions ? (
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin" />
            <p>Loading transactions</p>
          </div>
        ) : null}
        {walletInfo && transactions ? (
          <div className="flex items-center space-x-2">
            <Switch
              id="multisigs-type"
              checked={showBroadcasted}
              onCheckedChange={(checked) => {
                setShowBroadcasted(checked);
              }}
            />
            <Label htmlFor="multisigs-type">Also show broadcasted transactions</Label>
          </div>
        ) : null}
        {!showBroadcasted && pendingTxs && !pendingTxs.length
          ? "No pending transactions found"
          : null}
        {showBroadcasted && transactions && !transactions.length ? "No transactions found" : null}
        {transactions?.length || pendingTxs?.length ? (
          <div className="flex flex-col gap-2">
            {((showBroadcasted ? transactions : pendingTxs) ?? []).map((tx) => {
              const msgTypeCounts = msgTypeCountsFromJson(tx.dataJSON);
              const hasSigned = Boolean(
                tx.signatures.find(({ address }) => address === walletInfo?.address),
              );

              return (
                <Link
                  key={tx.id}
                  href={`/${chain.registryName}/${multisigAddress}/transaction/${tx.id}`}
                  className="flex items-center space-x-2 rounded-md border p-2 transition-colors hover:cursor-pointer hover:bg-muted/50"
                >
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        className={cn(
                          "font-mono text-white",
                          hasSigned && "bg-yellow-600 hover:bg-yellow-500",
                          tx.txHash && "bg-green-600 hover:bg-green-500",
                        )}
                      >
                        {tx.signatures.length}/{multisigThreshold}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div>
                        <p>signatures: {tx.signatures.length}</p>
                        <p>threshold: {multisigThreshold}</p>
                        <p>{hasSigned ? "Signed by you" : "Not signed by you"}</p>
                        <p>
                          {tx.txHash
                            ? `Broadcasted with hash: ${ellideMiddle(tx.txHash, 12)}`
                            : "Not broadcasted"}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex-1 space-y-1">
                    <div className="flex-1 flex-col space-x-0.5">
                      {msgTypeCounts.map(({ msgType, count }) => (
                        <Badge key={msgType} className="pointer-events-none">
                          {msgType}
                          {count > 1 ? ` (${count})` : ""}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex-1 flex-col space-x-0.5">
                      <p className="font-mono text-sm text-muted-foreground">{tx.id}</p>
                    </div>
                  </div>
                  <MoveRightIcon className="w-5" />
                </Link>
              );
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
