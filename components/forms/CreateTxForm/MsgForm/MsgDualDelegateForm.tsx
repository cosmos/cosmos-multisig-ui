import SelectProvider from "@/components/SelectProvider";
import SelectValidator from "@/components/SelectValidator";
import { MsgDualDelegateEncodeObject } from "@/types/lava";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { displayCoinToBaseCoin } from "../../../../lib/coinHelpers";
import { checkAddress, exampleAddress, trimStringsObj } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";

interface MsgDualDelegateFormProps {
  readonly delegatorAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgDualDelegateForm = ({
  delegatorAddress,
  setMsgGetter,
  deleteMsg,
}: MsgDualDelegateFormProps) => {
  const { chain } = useChains();

  const [validatorAddress, setValidatorAddress] = useState("");
  const [providerAddress, setProviderAddress] = useState("");
  const [chainID, setChainID] = useState("");
  const [amount, setAmount] = useState("0");

  const [validatorAddressError, setValidatorAddressError] = useState("");
  const [providerAddressError, setProviderAddressError] = useState("");
  const [amountError, setAmountError] = useState("");

  const trimmedInputs = trimStringsObj({ validatorAddress, providerAddress, chainID, amount });

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { validatorAddress, providerAddress, chainID, amount } = trimmedInputs;

    const isMsgValid = (): boolean => {
      setValidatorAddressError("");
      setProviderAddressError("");
      setAmountError("");

      const validatorAddressErrorMsg = checkAddress(validatorAddress, chain.addressPrefix);
      if (validatorAddressErrorMsg) {
        setValidatorAddressError(
          `Invalid address for network ${chain.chainId}: ${validatorAddressErrorMsg}`,
        );
        return false;
      }

      if (!providerAddress) {
        setProviderAddressError("Provider address is required");
        return false;
      }

      const providerAddressErrorMsg = checkAddress(providerAddress, chain.addressPrefix);
      if (providerAddressErrorMsg) {
        setProviderAddressError(
          `Invalid address for network ${chain.chainId}: ${providerAddressErrorMsg}`,
        );
        return false;
      }

      if (!amount || Number(amount) <= 0) {
        setAmountError("Amount must be greater than 0");
        return false;
      }

      try {
        displayCoinToBaseCoin({ denom: chain.displayDenom, amount }, chain.assets);
      } catch (e: unknown) {
        setAmountError(e instanceof Error ? e.message : "Could not set decimals");
        return false;
      }

      return true;
    };

    const microCoin = (() => {
      try {
        return displayCoinToBaseCoin({ denom: chain.displayDenom, amount }, chain.assets);
      } catch {
        return { denom: chain.displayDenom, amount: "0" };
      }
    })();

    const msgValue = MsgCodecs[MsgTypeUrls.DualDelegate].fromPartial({
      creator: delegatorAddress,
      validator: validatorAddress,
      provider: providerAddress,
      chainID,
      amount: microCoin,
    });

    const msg: MsgDualDelegateEncodeObject = { typeUrl: MsgTypeUrls.DualDelegate, value: msgValue };

    setMsgGetter({ isMsgValid, msg });
  }, [
    chain.addressPrefix,
    chain.assets,
    chain.chainId,
    chain.displayDenom,
    delegatorAddress,
    setMsgGetter,
    trimmedInputs,
  ]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>Dualstaking MsgDelegate</h2>
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
      <div className="form-item">
        <Input
          label="Chain ID"
          name="chain-id"
          value={chainID}
          onChange={({ target }) => {
            setChainID(target.value);
          }}
        />
      </div>
      <div className="form-item">
        <SelectProvider
          key={chainID}
          chainID={chainID}
          providerAddress={providerAddress}
          setProviderAddress={setProviderAddress}
        />
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
      <div className="form-item">
        <Input
          type="number"
          label={`Amount (${chain.displayDenom})`}
          name="amount"
          value={amount}
          onChange={({ target }) => {
            setAmount(target.value);
            setAmountError("");
          }}
          error={amountError}
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

export default MsgDualDelegateForm;
