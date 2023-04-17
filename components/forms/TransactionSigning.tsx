import { makeCosmoshubPath } from "@cosmjs/amino";
import { toBase64 } from "@cosmjs/encoding";
import { LedgerSigner } from "@cosmjs/ledger-amino";
import { SigningStargateClient } from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import axios from "axios";
import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { DbSignature, DbTransaction, WalletAccount } from "../../types";
import HashView from "../dataViews/HashView";
import Button from "../inputs/Button";
import StackableContainer from "../layout/StackableContainer";

interface LoadingStates {
  readonly signing?: boolean;
  readonly keplr?: boolean;
  readonly ledger?: boolean;
}

interface Props {
  signatures: DbSignature[];
  tx: DbTransaction;
  transactionID: string;
  addSignature: (signature: DbSignature) => void;
}

const TransactionSigning = (props: Props) => {
  const { state } = useAppContext();
  const [walletAccount, setWalletAccount] = useState<WalletAccount>();
  const [sigError, setSigError] = useState("");
  const [hasSigned, setHasSigned] = useState(false);
  const [walletType, setWalletType] = useState<"Keplr" | "Ledger">();
  const [ledgerSigner, setLedgerSigner] = useState({});
  const [loading, setLoading] = useState<LoadingStates>({});

  const connectKeplr = async () => {
    try {
      setLoading((newLoading) => ({ ...newLoading, keplr: true }));
      assert(state.chain.chainId, "chainId missing");

      await window.keplr.enable(state.chain.chainId);
      window.keplr.defaultOptions = {
        sign: { preferNoSetFee: true, preferNoSetMemo: true, disableBalanceCheck: true },
      };
      const tempWalletAccount = await window.keplr.getKey(state.chain.chainId);
      console.log(tempWalletAccount);
      const tempHasSigned = props.signatures.some(
        (sig) => sig.address === tempWalletAccount.bech32Address,
      );
      setWalletAccount(tempWalletAccount);
      setHasSigned(tempHasSigned);
      setWalletType("Keplr");
    } catch (e) {
      console.log("enable keplr err: ", e);
    } finally {
      setLoading((newLoading) => ({ ...newLoading, keplr: false }));
    }
  };

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
      console.log(offlineSigner);
      const accounts = await offlineSigner.getAccounts();
      console.log(accounts);
      const tempWalletAccount: WalletAccount = {
        bech32Address: accounts[0].address,
        pubkey: accounts[0].pubkey,
        algo: accounts[0].algo,
      };

      const tempHasSigned = props.signatures.some(
        (sig) => sig.address === tempWalletAccount.bech32Address,
      );
      setWalletAccount(tempWalletAccount);
      setHasSigned(tempHasSigned);
      setLedgerSigner(offlineSigner);
      setWalletType("Ledger");
    } catch (e) {
      console.log("enable ledger err: ", e);
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
        setHasSigned(true);
      }
    } catch (e) {
      console.log("signing err: ", e);
    } finally {
      setLoading((newLoading) => ({ ...newLoading, signing: false }));
    }
  };

  return (
    <StackableContainer lessPadding lessMargin>
      {hasSigned ? (
        <StackableContainer lessPadding lessMargin lessRadius>
          <div className="confirmation">
            <svg viewBox="0 0 77 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 30L26 51L72 5" stroke="white" strokeWidth="12" />
            </svg>
            <p>You've signed this transaction.</p>
          </div>
        </StackableContainer>
      ) : (
        <>
          <h2>Sign this transaction</h2>
          <StackableContainer lessPadding lessMargin lessRadius>
            {walletAccount ? (
              <>
                <p>
                  Connected signer {walletAccount.bech32Address} (
                  {walletType ?? "Unknown wallet type"}).
                </p>
                <Button
                  label="Sign transaction"
                  onClick={signTransaction}
                  loading={loading.signing}
                />
              </>
            ) : (
              <>
                <Button label="Connect Keplr" onClick={connectKeplr} loading={loading.keplr} />
                <Button
                  label="Connect Ledger (WebUSB)"
                  onClick={connectLedger}
                  loading={loading.ledger}
                />
              </>
            )}
          </StackableContainer>
        </>
      )}
      {sigError && (
        <StackableContainer lessPadding lessRadius lessMargin>
          <div className="signature-error">
            <p>This account has already signed this transaction.</p>
          </div>
        </StackableContainer>
      )}
      <h2>Current Signers</h2>
      <StackableContainer lessPadding lessMargin lessRadius>
        {props.signatures.map((signature, i) => (
          <StackableContainer lessPadding lessRadius lessMargin key={`${signature.address}_${i}`}>
            <HashView hash={signature.address} />
          </StackableContainer>
        ))}

        {props.signatures.length === 0 && <p>No signatures yet</p>}
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
      `}</style>
    </StackableContainer>
  );
};

export default TransactionSigning;
