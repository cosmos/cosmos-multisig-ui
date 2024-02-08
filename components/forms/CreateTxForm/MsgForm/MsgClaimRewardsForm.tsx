import SelectValidator from "@/components/SelectValidator";
import { MsgWithdrawDelegatorRewardEncodeObject } from "@cosmjs/stargate";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { checkAddress, exampleAddress, trimStringsObj } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";

interface MsgClaimRewardsFormProps {
  readonly delegatorAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgClaimRewardsForm = ({
  delegatorAddress,
  setMsgGetter,
  deleteMsg,
}: MsgClaimRewardsFormProps) => {
  const { chain } = useChains();

  const [validatorAddress, setValidatorAddress] = useState("");
  const [validatorAddressError, setValidatorAddressError] = useState("");

  const trimmedInputs = trimStringsObj({ validatorAddress });

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { validatorAddress } = trimmedInputs;

    const isMsgValid = (): boolean => {
      setValidatorAddressError("");

      const addressErrorMsg = checkAddress(validatorAddress, chain.addressPrefix);
      if (addressErrorMsg) {
        setValidatorAddressError(
          `Invalid address for network ${chain.chainId}: ${addressErrorMsg}`,
        );
        return false;
      }

      return true;
    };

    const msgValue = MsgCodecs[MsgTypeUrls.WithdrawDelegatorReward].fromPartial({
      delegatorAddress,
      validatorAddress,
    });

    const msg: MsgWithdrawDelegatorRewardEncodeObject = {
      typeUrl: MsgTypeUrls.WithdrawDelegatorReward,
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
        <SelectValidator
          validatorAddress={validatorAddress}
          setValidatorAddress={setValidatorAddress}
        />
        <Input
          label="Validator Address"
          name="validator-address"
          value={validatorAddress}
          onChange={({ target }) => {
            setValidatorAddress(target.value);
            setValidatorAddressError("");
          }}
          error={validatorAddressError}
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

export default MsgClaimRewardsForm;
