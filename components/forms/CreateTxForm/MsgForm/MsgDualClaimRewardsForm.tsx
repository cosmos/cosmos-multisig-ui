import { MsgDualClaimRewardsEncodeObject } from "@/types/lava";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { checkAddress, exampleAddress, trimStringsObj } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";

interface MsgDualClaimRewardsFormProps {
  readonly delegatorAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgDualClaimRewardsForm = ({
  delegatorAddress,
  setMsgGetter,
  deleteMsg,
}: MsgDualClaimRewardsFormProps) => {
  const { chain } = useChains();

  const [providerAddress, setProviderAddress] = useState("");
  const [providerAddressError, setProviderAddressError] = useState("");

  const trimmedInputs = trimStringsObj({ providerAddress });

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { providerAddress } = trimmedInputs;

    const isMsgValid = (): boolean => {
      setProviderAddressError("");

      const addressErrorMsg = checkAddress(providerAddress, chain.addressPrefix);
      if (addressErrorMsg) {
        setProviderAddressError(`Invalid address for network ${chain.chainId}: ${addressErrorMsg}`);
        return false;
      }

      return true;
    };

    const msgValue = MsgCodecs[MsgTypeUrls.DualClaimRewards].fromPartial({
      creator: delegatorAddress,
      provider: providerAddress,
    });

    const msg: MsgDualClaimRewardsEncodeObject = {
      typeUrl: MsgTypeUrls.DualClaimRewards,
      value: msgValue,
    };

    setMsgGetter({ isMsgValid, msg });
  }, [chain.addressPrefix, chain.chainId, delegatorAddress, setMsgGetter, trimmedInputs]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgWithdrawDelegatorReward</h2>
      <div className="form-item">
        <Input
          label="Provider Address"
          name="provider-address"
          value={providerAddress}
          onChange={({ target }) => {
            setProviderAddress(target.value);
            setProviderAddressError("");
          }}
          error={providerAddressError}
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

export default MsgDualClaimRewardsForm;
