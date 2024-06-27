import { DbSignatureObj } from "@/graphql";
import { MultisigThresholdPubkey } from "@cosmjs/amino";
import { useEffect, useState } from "react";
import StackableContainer from "../layout/StackableContainer";
import CopyAndPaste from "./CopyAndPaste";

interface Props {
  signatures: DbSignatureObj[];
  pubkey: MultisigThresholdPubkey;
}

const ThresholdInfo = ({ signatures, pubkey }: Props) => {
  const [urlToCopy, setUrlToCopy] = useState("");

  useEffect(() => {
    const urlWithoutQuery = window.location.href.split("?")[0];
    setUrlToCopy(urlWithoutQuery);
  }, []);

  const remainingSignatures = Math.max(Number(pubkey.value.threshold) - signatures.length, 0);
  if (!remainingSignatures) return null;

  return (
    <>
      <StackableContainer lessPadding lessMargin lessRadius>
        <div className="threshold">
          <div className="current">{signatures.length}</div>
          <div className="label divider">of</div>
          <div className="required">{pubkey.value.threshold}</div>
          <div className="label">signatures complete</div>
        </div>
        <StackableContainer lessPadding lessMargin lessRadius>
          <p>
            {remainingSignatures} remaining {remainingSignatures > 1 ? "signatures" : "signature"}{" "}
            before this transaction can be broadcast
          </p>
        </StackableContainer>
        <StackableContainer lessPadding lessMargin lessRadius>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CopyAndPaste copyText={urlToCopy} />
            <p style={{ margin: 0 }}>
              Copy the current URL and share it with the other members in the multisig so they can
              sign it
            </p>
          </div>
        </StackableContainer>
      </StackableContainer>
      <style jsx>{`
        .threshold {
          display: flex;
          font-size: 30px;
          justify-content: center;
          align-items: center;
        }
        .threshold div {
          padding: 0 5px;
        }
        .label {
          font-size: 16px;
        }
        p {
          margin-top: 1em;
        }
        p:first-child {
          margin-top: 0;
        }
      `}</style>
    </>
  );
};

export default ThresholdInfo;
