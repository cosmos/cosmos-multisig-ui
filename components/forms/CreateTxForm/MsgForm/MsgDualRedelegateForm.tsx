import { MsgDualRedelegateEncodeObject } from "@/types/lava";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { displayCoinToBaseCoin } from "../../../../lib/coinHelpers";
import { exampleAddress, trimStringsObj } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";

interface MsgDualRedelegateFormProps {
  readonly delegatorAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgDualRedelegateForm = ({
  delegatorAddress,
  setMsgGetter,
  deleteMsg,
}: MsgDualRedelegateFormProps) => {
  const { chain } = useChains();

  const [fromProviderAddress, setFromProviderAddress] = useState("");
  const [toProviderAddress, setToProviderAddress] = useState("");
  const [fromChainID, setFromChainID] = useState("");
  const [toChainID, setToChainID] = useState("");
  const [amount, setAmount] = useState("0");

  const [fromProviderAddressError, setFromProviderAddressError] = useState("");
  const [toProviderAddressError, setToProviderAddressError] = useState("");
  const [fromChainIDError, setFromChainIDError] = useState("");
  const [toChainIDError, setToChainIDError] = useState("");
  const [amountError, setAmountError] = useState("");

  const trimmedInputs = trimStringsObj({
    fromProviderAddress,
    toProviderAddress,
    fromChainID,
    toChainID,
    amount,
  });

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { fromProviderAddress, toProviderAddress, fromChainID, toChainID, amount } =
      trimmedInputs;

    const isMsgValid = (): boolean => {
      setFromProviderAddressError("");
      setToProviderAddressError("");
      setFromChainIDError("");
      setToChainIDError("");
      setAmountError("");

      if (!fromProviderAddress) {
        setFromProviderAddressError("From Provider address is required");
        return false;
      }

      if (!toProviderAddress) {
        setToProviderAddressError("To Provider address is required");
        return false;
      }

      if (!fromChainID) {
        setFromChainIDError("From Chain ID is required");
        return false;
      }

      if (!toChainID) {
        setToChainIDError("To Chain ID is required");
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

    const msgValue = MsgCodecs[MsgTypeUrls.DualRedelegate].fromPartial({
      creator: delegatorAddress,
      fromProvider: fromProviderAddress,
      toProvider: toProviderAddress,
      fromChainID,
      toChainID,
      amount: microCoin,
    });

    const msg: MsgDualRedelegateEncodeObject = {
      typeUrl: MsgTypeUrls.DualRedelegate,
      value: msgValue,
    };

    setMsgGetter({ isMsgValid, msg });
  }, [chain.assets, chain.displayDenom, delegatorAddress, setMsgGetter, trimmedInputs]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>Dualstaking MsgRedelegate</h2>
      <div className="form-item">
        <Input
          label="From Provider Address"
          name="from-provider-address"
          value={fromProviderAddress}
          onChange={({ target }) => {
            setFromProviderAddress(target.value);
            setFromProviderAddressError("");
          }}
          error={fromProviderAddressError}
          placeholder={`E.g. ${exampleAddress(0, chain.addressPrefix)}`}
        />
      </div>
      <div className="form-item">
        <Input
          label="To Provider Address"
          name="to-provider-address"
          value={toProviderAddress}
          onChange={({ target }) => {
            setToProviderAddress(target.value);
            setToProviderAddressError("");
          }}
          error={toProviderAddressError}
          placeholder={`E.g. ${exampleAddress(0, chain.addressPrefix)}`}
        />
      </div>
      <div className="form-item">
        <Input
          label="From Chain ID"
          name="from-chain-id"
          value={fromChainID}
          onChange={({ target }) => {
            setFromChainID(target.value);
            setFromChainIDError("");
          }}
          error={fromChainIDError}
        />
      </div>
      <div className="form-item">
        <Input
          label="To Chain ID"
          name="to-chain-id"
          value={toChainID}
          onChange={({ target }) => {
            setToChainID(target.value);
            setToChainIDError("");
          }}
          error={toChainIDError}
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

export default MsgDualRedelegateForm;
