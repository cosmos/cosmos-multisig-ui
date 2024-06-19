import { getKeplrKey, useKeplrReconnect } from "@/lib/keplr";
import { cn, toastError } from "@/lib/utils";
import { LoadingStates, WalletInfo, WalletType } from "@/types/signing";
import { makeCosmoshubPath } from "@cosmjs/amino";
import { toBase64 } from "@cosmjs/encoding";
import { LedgerSigner } from "@cosmjs/ledger-amino";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { Loader2, Unplug } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { useChains } from "../../../context/ChainsContext";
import { getConnectError } from "../../../lib/errorHelpers";
import { Button } from "../../ui/button";

interface ButtonConnectWalletProps {
  readonly walletType: WalletType;
  readonly walletInfoState: [
    WalletInfo | null | undefined,
    Dispatch<SetStateAction<WalletInfo | null | undefined>>,
  ];
}

export default function ButtonConnectWallet({
  walletType,
  walletInfoState: [walletInfo, setWalletInfo],
}: ButtonConnectWalletProps) {
  const { chain } = useChains();
  const [loading, setLoading] = useState<LoadingStates>({});

  const connectKeplr = useCallback(async () => {
    try {
      setLoading((oldLoading) => ({ ...oldLoading, keplr: true }));

      const { bech32Address: address, pubKey: pubKeyArray } = await getKeplrKey(chain.chainId);
      const pubKey = toBase64(pubKeyArray);
      setWalletInfo({ type: "Keplr", address, pubKey });
    } catch (e) {
      const connectError = getConnectError(e);
      console.error(connectError, e);
      toastError({
        description: connectError,
        fullError: e instanceof Error ? e : undefined,
      });
    } finally {
      setLoading((newLoading) => ({ ...newLoading, keplr: false }));
    }
  }, [chain.chainId, setWalletInfo]);

  useKeplrReconnect(!!walletInfo?.address, connectKeplr);

  const connectLedger = async () => {
    try {
      setLoading((newLoading) => ({ ...newLoading, ledger: true }));

      const ledgerTransport = await TransportWebUSB.create(120000, 120000);
      const offlineSigner = new LedgerSigner(ledgerTransport, {
        hdPaths: [makeCosmoshubPath(0)],
        prefix: chain.addressPrefix,
      });

      const [{ address, pubkey: pubKeyArray }] = await offlineSigner.getAccounts();
      const pubKey = toBase64(pubKeyArray);

      setWalletInfo({ type: "Ledger", address, pubKey });
    } catch (e) {
      const connectError = getConnectError(e);
      console.error(connectError, e);
      toastError({
        description: connectError,
        fullError: e instanceof Error ? e : undefined,
      });
    } finally {
      setLoading((newLoading) => ({ ...newLoading, ledger: false }));
    }
  };

  const onClick = (() => {
    if (walletType === "Keplr") {
      return connectKeplr;
    }

    if (walletType === "Ledger") {
      return connectLedger;
    }

    return () => {};
  })();

  const isLoading =
    (walletType === "Keplr" && loading.keplr) || (walletType === "Ledger" && loading.ledger);

  return walletInfo?.type === walletType ? (
    <Button
      variant="outline"
      onClick={() => {
        setWalletInfo(null);
      }}
    >
      <Unplug className="mr-2 h-auto w-5 text-destructive" />
      Disconnect {walletInfo.type}
    </Button>
  ) : (
    <Button onClick={onClick} disabled={loading.keplr || loading.ledger} variant="outline">
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Image
          alt=""
          src={`/assets/icons/${walletType.toLowerCase()}.svg`}
          width={walletType === "Ledger" ? 23 : 20}
          height={walletType === "Ledger" ? 23 : 20}
          className={cn("mr-2", walletType === "Ledger" && "bg-white p-0.5")}
        />
      )}
      Connect {walletType}
    </Button>
  );
}
