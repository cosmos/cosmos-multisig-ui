import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { explorerLinkAccount } from "@/lib/displayHelpers";
import { cn } from "@/lib/utils";
import { WalletInfo } from "@/types/signing";
import copy from "copy-to-clipboard";
import { ArrowUpRightSquare, Copy } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useChains } from "../../../context/ChainsContext";
import { Button } from "../../ui/button";
import BalancesTable from "../BalancesTable";
import ButtonConnectWallet from "./ButtonConnectWallet";

export default function AccountView() {
  const { chain } = useChains();

  const walletInfoState = useState<WalletInfo | null>();
  const [walletInfo] = walletInfoState;

  const explorerLink =
    explorerLinkAccount(chain.explorerLinks.account, walletInfo?.address || "") || "";

  return (
    <div className="mt-6 flex flex-col gap-4">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center text-2xl">
            {walletInfo?.type ? (
              <Image
                alt=""
                src={`/assets/icons/${walletInfo.type.toLowerCase()}.svg`}
                width={walletInfo.type === "Ledger" ? 30 : 27}
                height={walletInfo.type === "Ledger" ? 30 : 27}
                className={cn("mr-2", walletInfo.type === "Ledger" && "bg-white p-0.5")}
              />
            ) : null}
            {walletInfo?.type ? `Connected to ${walletInfo.type}` : "Connect to a wallet"}
          </CardTitle>
          <CardDescription>Choose between Keplr or Ledger to show its account info</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-6">
            <ButtonConnectWallet walletType="Keplr" walletInfoState={walletInfoState} />
            <ButtonConnectWallet walletType="Ledger" walletInfoState={walletInfoState} />
          </div>
        </CardContent>
      </Card>
      {walletInfo?.address ? (
        <Card>
          <CardHeader>
            <CardTitle>Account info</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div
              onClick={async () => {
                copy(walletInfo.address);
                toast(`Copied address to clipboard`, { description: walletInfo.address });
              }}
              className="flex items-center space-x-4 rounded-md border p-4 transition-colors hover:cursor-pointer hover:bg-muted/50"
            >
              <Copy className="w-5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Address</p>
                <p className="text-sm text-muted-foreground">{walletInfo.address}</p>
              </div>
            </div>
            <div
              onClick={async () => {
                copy(walletInfo.pubKey);
                toast(`Copied public key to clipboard`, { description: walletInfo.pubKey });
              }}
              className="flex items-center space-x-4 rounded-md border p-4 transition-colors hover:cursor-pointer hover:bg-muted/50"
            >
              <Copy className="w-5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Public key</p>
                <p className="text-sm text-muted-foreground">{walletInfo.pubKey}</p>
              </div>
            </div>
            {explorerLink ? (
              <Button asChild variant="secondary">
                <a href={explorerLink} target="_blank">
                  View in explorer <ArrowUpRightSquare className="ml-1" />
                </a>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
      {walletInfo?.address ? (
        <Card>
          <CardHeader>
            <CardTitle>Balances</CardTitle>
            <CardDescription>
              Your list of tokens on {chain.chainDisplayName || "Cosmos Hub"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BalancesTable walletAddress={walletInfo.address} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
