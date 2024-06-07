import { toastError, toastSuccess } from "@/lib/utils";
import { LoadingStates, SigningStatus } from "@/types/signing";
import { MultisigThresholdPubkey, makeCosmoshubPath } from "@cosmjs/amino";
import { createWasmAminoConverters, wasmTypes } from "@cosmjs/cosmwasm-stargate";
import { toBase64 } from "@cosmjs/encoding";
import { LedgerSigner } from "@cosmjs/ledger-amino";
import { Registry } from "@cosmjs/proto-signing";
import {
  AminoTypes,
  SigningStargateClient,
  createDefaultAminoConverters,
  defaultRegistryTypes,
} from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import * as lavajs from "@lavanet/lavajs";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { useCallback, useLayoutEffect, useState } from "react";
import { toast } from "sonner";
import { useChains } from "../../context/ChainsContext";
import { getConnectError } from "../../lib/errorHelpers";
import { requestJson } from "../../lib/request";
import { DbSignature, DbTransaction, WalletAccount } from "../../types";
import HashView from "../dataViews/HashView";
import Button from "../inputs/Button";
import StackableContainer from "../layout/StackableContainer";

interface TransactionSigningProps {
  readonly signatures: DbSignature[];
  readonly tx: DbTransaction;
  readonly pubkey: MultisigThresholdPubkey;
  readonly transactionID: string;
  readonly addSignature: (signature: DbSignature) => void;
}

const TransactionSigning = (props: TransactionSigningProps) => {
  const memberPubkeys = props.pubkey.value.pubkeys.map(({ value }) => value);

  const { chain } = useChains();
  const [walletAccount, setWalletAccount] = useState<WalletAccount>();
  const [signing, setSigning] = useState<SigningStatus>("not_signed");
  const [walletType, setWalletType] = useState<"Keplr" | "Ledger">();
  const [ledgerSigner, setLedgerSigner] = useState({});
  const [loading, setLoading] = useState<LoadingStates>({});

  const connectKeplr = useCallback(async () => {
    try {
      setLoading((oldLoading) => ({ ...oldLoading, keplr: true }));

      await window.keplr.enable(chain.chainId);
      window.keplr.defaultOptions = {
        sign: { preferNoSetFee: true, preferNoSetMemo: true, disableBalanceCheck: true },
      };
      const tempWalletAccount = await window.keplr.getKey(chain.chainId);
      setWalletAccount(tempWalletAccount);

      const pubkey = toBase64(tempWalletAccount.pubKey);
      const isMember = memberPubkeys.includes(pubkey);
      const hasSigned = isMember
        ? props.signatures.some((sig) => sig.address === tempWalletAccount.bech32Address)
        : false;
      if (!isMember) {
        setSigning("not_a_member");
      } else {
        if (hasSigned) {
          setSigning("signed");
        } else {
          setSigning("not_signed");
        }
      }

      setWalletType("Keplr");
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
  }, [chain.chainId, memberPubkeys, props.signatures]);

  useLayoutEffect(() => {
    const accountChangeKey = "keplr_keystorechange";

    if (walletType === "Keplr") {
      window.addEventListener(accountChangeKey, connectKeplr);
    } else {
      window.removeEventListener(accountChangeKey, connectKeplr);
    }
  }, [connectKeplr, walletType]);

  const connectLedger = async () => {
    try {
      setLoading((newLoading) => ({ ...newLoading, ledger: true }));

      // Prepare ledger
      const ledgerTransport = await TransportWebUSB.create(120000, 120000);

      // Setup signer
      const offlineSigner = new LedgerSigner(ledgerTransport, {
        hdPaths: [makeCosmoshubPath(0)],
        prefix: chain.addressPrefix,
      });
      const accounts = await offlineSigner.getAccounts();
      const tempWalletAccount: WalletAccount = {
        bech32Address: accounts[0].address,
        pubKey: accounts[0].pubkey,
        algo: accounts[0].algo,
      };
      setWalletAccount(tempWalletAccount);

      const pubkey = toBase64(tempWalletAccount.pubKey);
      const isMember = memberPubkeys.includes(pubkey);
      const hasSigned = isMember
        ? props.signatures.some((sig) => sig.address === tempWalletAccount.bech32Address)
        : false;
      if (!isMember) {
        setSigning("not_a_member");
      } else {
        if (hasSigned) {
          setSigning("signed");
        } else {
          setSigning("not_signed");
        }
      }

      setLedgerSigner(offlineSigner);
      setWalletType("Ledger");
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

  const signTransaction = async () => {
    const loadingToastId = toast.loading("Signing transaction");

    try {
      setLoading((newLoading) => ({ ...newLoading, signing: true }));

      const offlineSigner =
        walletType === "Keplr" ? window.getOfflineSignerOnlyAmino(chain.chainId) : ledgerSigner;

      const signerAddress = walletAccount?.bech32Address;
      assert(signerAddress, "Missing signer address");
      const signingClient = await SigningStargateClient.offline(offlineSigner, {
        registry: new Registry([...defaultRegistryTypes, ...wasmTypes]),
        aminoTypes: new AminoTypes({
          ...createDefaultAminoConverters(),
          ...createWasmAminoConverters(),
          ...lavajs.lavanetAminoConverters,
        }),
      });

      const signerData = {
        accountNumber: props.tx.accountNumber,
        sequence: props.tx.sequence,
        chainId: chain.chainId,
      };

      const { bodyBytes, signatures } = await signingClient.sign(
        signerAddress,
        props.tx.msgs,
        props.tx.fee,
        props.tx.memo,
        signerData,
      );

      // check existing signatures
      const bases64EncodedSignature = toBase64(signatures[0]);
      const bases64EncodedBodyBytes = toBase64(bodyBytes);
      const prevSigMatch = props.signatures.findIndex(
        (signature) => signature.signature === bases64EncodedSignature,
      );

      if (prevSigMatch > -1) {
        throw new Error("This account has already signed");
      }

      const signature = {
        bodyBytes: bases64EncodedBodyBytes,
        signature: bases64EncodedSignature,
        address: signerAddress,
      };
      await requestJson(`/api/transaction/${props.transactionID}/signature`, { body: signature });
      toastSuccess("Transaction signed by", signerAddress);
      props.addSignature(signature);
      setSigning("signed");
    } catch (e) {
      console.error("Failed to sign the tx:", e);
      toastError({
        description: "Failed to sign the tx",
        fullError: e instanceof Error ? e : undefined,
      });
    } finally {
      setLoading((newLoading) => ({ ...newLoading, signing: false }));
      toast.dismiss(loadingToastId);
    }
  };

  return (
    <>
      <StackableContainer lessPadding lessMargin lessRadius>
        <h2>Current Signers</h2>
        {props.signatures.map((signature, i) => (
          <StackableContainer lessPadding lessRadius lessMargin key={`${signature.address}_${i}`}>
            <HashView hash={signature.address} />
          </StackableContainer>
        ))}
        {!props.signatures.length ? <p>No signatures yet</p> : null}
      </StackableContainer>
      <StackableContainer lessPadding lessMargin lessRadius>
        {signing === "signed" ? (
          <div className="confirmation">
            <svg viewBox="0 0 77 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 30L26 51L72 5" stroke="white" strokeWidth="12" />
            </svg>
            <p>You've signed this transaction</p>
          </div>
        ) : null}
        {signing === "not_a_member" ? (
          <div className="multisig-error">
            <p>You don't belong to this multisig</p>
          </div>
        ) : null}
        {signing === "not_signed" ? (
          <>
            {walletAccount ? (
              <>
                <p>
                  You can sign this transaction with {walletAccount.bech32Address} (
                  {walletType ?? "Unknown wallet type"})
                </p>
                <Button
                  label="Sign transaction"
                  onClick={signTransaction}
                  loading={loading.signing}
                />
              </>
            ) : (
              <>
                <h2>Choose wallet to sign</h2>
                <Button label="Connect Keplr" onClick={connectKeplr} loading={loading.keplr} />
                <Button
                  label="Connect Ledger (WebUSB)"
                  onClick={connectLedger}
                  loading={loading.ledger}
                />
              </>
            )}
          </>
        ) : null}
      </StackableContainer>
      <style jsx>{`
        p {
          text-align: center;
          max-width: none;
        }
        h2 {
          margin-top: 1em;
        }
        h2:first-child {
          margin-top: 0;
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .confirmation {
          display: flex;
          justify-content: center;
        }
        .confirmation svg {
          height: 0.8em;
          margin-right: 0.5em;
        }
        .multisig-error p {
          color: red;
          font-size: 16px;
        }
      `}</style>
    </>
  );
};

export default TransactionSigning;
