import { assert } from "@cosmjs/utils";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../../../context/AppContext";
import { checkAddress, exampleAddress } from "../../../../lib/displayHelpers";
import { TxMsg, TxMsgClaimRewards } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";

interface MsgClaimRewardsFormProps {
  readonly delegatorAddress: string;
  readonly setCheckAndGetMsg: Dispatch<SetStateAction<(() => TxMsg | null) | undefined>>;
}

const MsgClaimRewardsForm = ({ delegatorAddress, setCheckAndGetMsg }: MsgClaimRewardsFormProps) => {
  const { state } = useAppContext();
  assert(state.chain.addressPrefix, "addressPrefix missing");

  const [validatorAddress, setValidatorAddress] = useState("");
  const [validatorAddressError, setValidatorAddressError] = useState("");

  const checkAndGetMsg = useCallback(() => {
    assert(state.chain.addressPrefix, "addressPrefix missing");

    const addressErrorMsg = checkAddress(validatorAddress, state.chain.addressPrefix);
    if (addressErrorMsg) {
      setValidatorAddressError(
        `Invalid address for network ${state.chain.chainId}: ${addressErrorMsg}`,
      );
      return null;
    }

    const msg: TxMsgClaimRewards = {
      typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
      value: { delegatorAddress, validatorAddress },
    };

    return msg;
  }, [delegatorAddress, state.chain.addressPrefix, state.chain.chainId, validatorAddress]);

  useEffect(() => {
    setCheckAndGetMsg(() => checkAndGetMsg);
  }, [checkAndGetMsg, setCheckAndGetMsg]);

  return (
    <>
      <div className="form-item">
        <Input
          label="Validator Address"
          name="validator-address"
          value={validatorAddress}
          onChange={({ target }) => setValidatorAddress(target.value)}
          error={validatorAddressError}
          placeholder={`E.g. ${exampleAddress(0, state.chain.addressPrefix)}`}
        />
      </div>
      <style jsx>{`
        p {
          margin-top: 15px;
        }
        .form-item {
          margin-top: 1.5em;
        }
      `}</style>
    </>
  );
};

export default MsgClaimRewardsForm;
