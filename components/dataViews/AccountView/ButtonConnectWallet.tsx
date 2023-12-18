import { LoadingStates, WalletInfo, WalletType } from "@/types/signing";
import { makeCosmoshubPath } from "@cosmjs/amino";
import { toBase64 } from "@cosmjs/encoding";
import { LedgerSigner } from "@cosmjs/ledger-amino";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useCallback, useLayoutEffect, useState } from "react";
import { useChains } from "../../../context/ChainsContext";
import { getConnectError } from "../../../lib/errorHelpers";
import { Button } from "../../ui/button";

interface ButtonConnectWalletProps {
  readonly walletType: WalletType;
  readonly walletInfoState: [
    WalletInfo | null | undefined,
    Dispatch<SetStateAction<WalletInfo | null | undefined>>,
  ];
  readonly setError: Dispatch<SetStateAction<string>>;
}

export default function ButtonConnectWallet({
  walletType,
  walletInfoState: [walletInfo, setWalletInfo],
  setError,
}: ButtonConnectWalletProps) {
  const { chain } = useChains();
  const [loading, setLoading] = useState<LoadingStates>({});

  const connectKeplr = useCallback(async () => {
    try {
      setError("");
      setLoading((oldLoading) => ({ ...oldLoading, keplr: true }));

      await window.keplr.enable(chain.chainId);
      window.keplr.defaultOptions = {
        sign: { preferNoSetFee: true, preferNoSetMemo: true, disableBalanceCheck: true },
      };

      const { bech32Address: address, pubKey: pubKeyArray } = await window.keplr.getKey(
        chain.chainId,
      );
      const pubKey = toBase64(pubKeyArray);

      setWalletInfo({ type: "Keplr", address, pubKey });
    } catch (e) {
      console.error(e);
      setError(getConnectError(e));
    } finally {
      setLoading((newLoading) => ({ ...newLoading, keplr: false }));
    }
  }, [chain.chainId, setError, setWalletInfo]);

  useLayoutEffect(() => {
    if (!walletInfo?.address) {
      return;
    }

    const accountChangeKey = "keplr_keystorechange";

    if (walletInfo.type === "Keplr") {
      window.addEventListener(accountChangeKey, connectKeplr);
    } else {
      window.removeEventListener(accountChangeKey, connectKeplr);
    }
  }, [connectKeplr, walletInfo]);

  const connectLedger = async () => {
    try {
      setError("");
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
      console.error(e);
      setError(getConnectError(e));
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

  return (
    <Button onClick={onClick} disabled={loading.keplr || loading.ledger}>
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Image
          alt=""
          src={`/assets/icons/${walletType.toLowerCase()}.svg`}
          width={20}
          height={20}
          className="mr-2"
        />
      )}
      Connect {walletType}
    </Button>
  );
}
