import BadgeWithCopy from "@/components/BadgeWithCopy";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { explorerLinkAccount } from "@/lib/displayHelpers";
import { WalletInfo } from "@/types/signing";
import { AlertCircle, Unplug } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useChains } from "../../../context/ChainsContext";
import { Button } from "../../ui/button";
import BalancesList from "./BalancesList";
import ButtonConnectWallet from "./ButtonConnectWallet";

export default function AccountView() {
  const { chain } = useChains();

  const walletInfoState = useState<WalletInfo | null>();
  const [walletInfo, setWalletInfo] = walletInfoState;
  const [error, setError] = useState("");

  const explorerLink =
    explorerLinkAccount(chain.explorerLink.account, walletInfo?.address || "") || "";

  return (
    <div className="mt-6 flex flex-col gap-4">
      <Card className="bg-fuchsia-850 min-w-[400px] border-transparent">
        <CardHeader className="p-0">
          <CardTitle className="flex items-baseline gap-2">
            {walletInfo?.type ? (
              <Image
                alt=""
                src={`/assets/icons/${walletInfo.type.toLowerCase()}.svg`}
                width={20}
                height={20}
              />
            ) : null}
            {walletInfo?.type ? `${walletInfo.type} wallet connected` : "Connect wallet"}
          </CardTitle>
        </CardHeader>
        {walletInfo ? (
          <CardContent className="mt-4 max-w-md p-0">
            <h2>Address</h2>
            <div className="flex flex-col gap-4">
              <BadgeWithCopy name="address" toCopy={walletInfo.address} />
              {explorerLink ? (
                <Button asChild className="self-center">
                  <a href={explorerLink} target="_blank">
                    View in explorer
                  </a>
                </Button>
              ) : null}
            </div>
            <div className="mt-4">
              <h2>Public key</h2>
              <BadgeWithCopy name="pubKey" toCopy={walletInfo.pubKey} />
            </div>
          </CardContent>
        ) : null}
        <CardFooter className="my-8 flex w-full flex-col gap-4 p-0">
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          {walletInfo?.type ? (
            <Button
              onClick={() => {
                setWalletInfo(null);
              }}
            >
              <Unplug className="mr-2 h-auto w-5 text-red-500" />
              Disconnect {walletInfo.type}
            </Button>
          ) : (
            <div className="flex w-full flex-col gap-4">
              <ButtonConnectWallet
                walletType="Keplr"
                walletInfoState={walletInfoState}
                setError={setError}
              />
              <ButtonConnectWallet
                walletType="Ledger"
                walletInfoState={walletInfoState}
                setError={setError}
              />
            </div>
          )}
        </CardFooter>
      </Card>
      {walletInfo?.address ? (
        <BalancesList
          key={walletInfo.address}
          walletAddress={walletInfo.address}
          setError={setError}
        />
      ) : null}
    </div>
  );
}
