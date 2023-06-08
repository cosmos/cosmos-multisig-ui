import { MultisigThresholdPubkey, makeCosmoshubPath } from "@cosmjs/amino";
import { toBase64, toHex } from "@cosmjs/encoding";
import { LedgerSigner } from "@cosmjs/ledger-amino";
import { SigningStargateClient } from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import axios from "axios";
import { useCallback, useLayoutEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { getConnectError } from "../../lib/errorHelpers";
import { DbSignature, DbTransaction, WalletAccount } from "../../types";
import HashView from "../dataViews/HashView";
import Button from "../inputs/Button";
import StackableContainer from "../layout/StackableContainer";

type SigningStatus = "not_signed" | "not_a_member" | "signed";

interface LoadingStates {
  readonly signing?: boolean;
  readonly keplr?: boolean;
  readonly ledger?: boolean;
}

interface Props {
  signatures: DbSignature[];
  tx: DbTransaction;
  pubkey: MultisigThresholdPubkey;
  transactionID: string;
  addSignature: (signature: DbSignature) => void;
}

const TransactionSigning = (props: Props) => {
  const memberPubkeys = props.pubkey.value.pubkeys.map(({ value }) => value);

  const { state } = useAppContext();
  const [walletAccount, setWalletAccount] = useState<WalletAccount>();
  const [sigError, setSigError] = useState("");
  const [connectError, setConnectError] = useState("");
  const [signing, setSigning] = useState<SigningStatus>("not_signed");
  const [walletType, setWalletType] = useState<"Keplr" | "Ledger">();
  const [ledgerSigner, setLedgerSigner] = useState({});
  const [loading, setLoading] = useState<LoadingStates>({});

  const connectKeplr = useCallback(async () => {
    try {
      setLoading((oldLoading) => ({ ...oldLoading, keplr: true }));
      assert(state.chain.chainId, "chainId missing");

      await window.keplr.enable(state.chain.chainId);
      window.keplr.defaultOptions = {
        sign: { preferNoSetFee: true, preferNoSetMemo: true, disableBalanceCheck: true },
      };
      const tempWalletAccount = await window.keplr.getKey(state.chain.chainId);
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
      setConnectError("");
    } catch (e) {
      console.error(e);
      setConnectError(getConnectError(e));
    } finally {
      setLoading((newLoading) => ({ ...newLoading, keplr: false }));
    }
  }, [memberPubkeys, props.signatures, state.chain.chainId]);

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
      assert(state.chain.addressPrefix, "addressPrefix missing");

      // Prepare ledger
      const ledgerTransport = await TransportWebUSB.create(120000, 120000);

      // Setup signer
      const offlineSigner = new LedgerSigner(ledgerTransport, {
        hdPaths: [makeCosmoshubPath(0)],
        prefix: state.chain.addressPrefix,
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
      setConnectError("");
    } catch (e) {
      console.error(e);
      setConnectError(getConnectError(e));
    } finally {
      setLoading((newLoading) => ({ ...newLoading, ledger: false }));
    }
  };

  const signTransaction = async () => {
    try {
      setLoading((newLoading) => ({ ...newLoading, signing: true }));
      assert(state.chain.chainId, "chainId missing");

      const offlineSigner =
        walletType === "Keplr"
          ? window.getOfflineSignerOnlyAmino(state.chain.chainId)
          : ledgerSigner;

      const signerAddress = walletAccount?.bech32Address;
      assert(signerAddress, "Missing signer address");
      const signingClient = await SigningStargateClient.offline(offlineSigner);

      const signerData = {
        accountNumber: props.tx.accountNumber,
        sequence: props.tx.sequence,
        chainId: state.chain.chainId,
      };

      console.log({ msgs: props.tx.msgs });

      const { bodyBytes, signatures } = await signingClient.sign(
        signerAddress,
        props.tx.msgs,
        props.tx.fee,
        props.tx.memo,
        signerData,
      );

      console.log({ bodyBytes: toHex(bodyBytes) });

      // check existing signatures
      const bases64EncodedSignature = toBase64(signatures[0]);
      const bases64EncodedBodyBytes = toBase64(bodyBytes);
      const prevSigMatch = props.signatures.findIndex(
        (signature) => signature.signature === bases64EncodedSignature,
      );

      if (prevSigMatch > -1) {
        setSigError("This account has already signed.");
      } else {
        const signature = {
          bodyBytes: bases64EncodedBodyBytes,
          signature: bases64EncodedSignature,
          address: signerAddress,
        };
        const _res = await axios.post(
          `/api/transaction/${props.transactionID}/signature`,
          signature,
        );
        props.addSignature(signature);
        setSigning("signed");
      }
    } catch (e) {
      console.log("signing err: ", e);
    } finally {
      setLoading((newLoading) => ({ ...newLoading, signing: false }));
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
        {sigError ? (
          <StackableContainer lessPadding lessRadius lessMargin>
            <div className="signature-error">
              <p>This account has already signed this transaction</p>
            </div>
          </StackableContainer>
        ) : null}
        {connectError ? (
          <StackableContainer lessPadding lessRadius lessMargin>
            <div className="signature-error">
              <p>{connectError}</p>
            </div>
          </StackableContainer>
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
        .signature-error p {
          max-width: 550px;
          color: red;
          font-size: 16px;
          line-height: 1.4;
        }
        .signature-error p:first-child {
          margin-top: 0;
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
