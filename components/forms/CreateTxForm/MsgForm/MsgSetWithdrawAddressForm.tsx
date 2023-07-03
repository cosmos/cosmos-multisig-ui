import { EncodeObject } from "@cosmjs/proto-signing";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { checkAddress, exampleAddress } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";

interface MsgSetWithdrawAddressFormProps {
  readonly delegatorAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgSetWithdrawAddressForm = ({
  delegatorAddress,
  setMsgGetter,
  deleteMsg,
}: MsgSetWithdrawAddressFormProps) => {
  const { chain } = useChains();

  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAddressError, setWithdrawAddressError] = useState("");

  useEffect(() => {
    try {
      setWithdrawAddressError("");

      const isMsgValid = (): boolean => {
        const addressErrorMsg = checkAddress(withdrawAddress, chain.addressPrefix);
        if (addressErrorMsg) {
          setWithdrawAddressError(
            `Invalid address for network ${chain.chainId}: ${addressErrorMsg}`,
          );
          return false;
        }

        return true;
      };

      const msgValue = MsgCodecs[MsgTypeUrls.SetWithdrawAddress].fromPartial({
        delegatorAddress,
        withdrawAddress,
      });
      const msg: EncodeObject = { typeUrl: MsgTypeUrls.SetWithdrawAddress, value: msgValue };

      setMsgGetter({ isMsgValid, msg });
    } catch {}
  }, [chain.addressPrefix, chain.chainId, delegatorAddress, setMsgGetter, withdrawAddress]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgSetWithdrawAddress</h2>
      <div className="form-item">
        <Input
          label="Withdraw Address"
          name="withdraw-address"
          value={withdrawAddress}
          onChange={({ target }) => setWithdrawAddress(target.value)}
          error={withdrawAddressError}
          placeholder={`E.g. ${exampleAddress(0, chain.addressPrefix)}`}
        />
      </div>
      <style jsx>{`
        .form-item {
          margin-top: 1.5em;
        }
        button.remove {
          background: rgba(255, 255, 255, 0.2);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: none;
          color: white;
          position: absolute;
          right: 10px;
          top: 10px;
        }
      `}</style>
    </StackableContainer>
  );
};

export default MsgSetWithdrawAddressForm;
