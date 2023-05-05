import { Account, calculateFee } from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import axios from "axios";
import { NextRouter, withRouter } from "next/router";
import { useRef, useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import { TxMsg, TxType } from "../../../types/txMsg";
import Button from "../../inputs/Button";
import Input from "../../inputs/Input";
import StackableContainer from "../../layout/StackableContainer";
import MsgForm from "./MsgForm";

export interface MsgGetter {
  readonly isMsgValid: (msg: TxMsg) => msg is TxMsg;
  readonly msg: TxMsg;
}

const getMsgFormKey = (txType: TxType, msg: TxMsg) => JSON.stringify({ txType, msg });

interface CreateTxFormProps {
  readonly router: NextRouter;
  readonly senderAddress: string;
  readonly accountOnChain: Account;
}

const CreateTxForm = ({ router, senderAddress, accountOnChain }: CreateTxFormProps) => {
  const { state } = useAppContext();

  const [processing, setProcessing] = useState(false);
  const [msgTypes, setMsgTypes] = useState<readonly TxType[]>([]);
  const msgGetters = useRef<MsgGetter[]>([]);
  const [memo, setMemo] = useState("");
  const [gasLimit, setGasLimit] = useState(200000);
  const [gasLimitError, setGasLimitError] = useState("");

  const gasPrice = state.chain.gasPrice;
  assert(gasPrice, "gasPrice missing");

  const addTxType = (newTxType: TxType) => {
    setMsgTypes((oldMsgTypes) => {
      const newTxTypes = [...oldMsgTypes, newTxType];
      setGasLimit((oldGasLimit) => (oldGasLimit / (oldMsgTypes.length || 1)) * newTxTypes.length);
      return newTxTypes;
    });
  };

  const createTx = async () => {
    try {
      assert(typeof accountOnChain.accountNumber === "number", "accountNumber missing");
      assert(!!msgGetters.current.length, "form filled incorrectly");

      const msgs = msgGetters.current
        .filter(({ isMsgValid, msg }) => isMsgValid(msg))
        .map(({ msg }) => msg);

      if (!msgs.length || msgs.length !== msgTypes.length) return;

      if (!Number.isSafeInteger(gasLimit) || gasLimit <= 0) {
        setGasLimitError("gas limit must be a positive integer");
        return;
      }

      setProcessing(true);

      const tx = {
        accountNumber: accountOnChain.accountNumber,
        sequence: accountOnChain.sequence,
        chainId: state.chain.chainId,
        msgs,
        fee: calculateFee(gasLimit, gasPrice),
        memo,
      };

      const {
        data: { transactionID },
      } = await axios.post("/api/transaction", {
        dataJSON: JSON.stringify(tx),
      });

      router.push(`${senderAddress}/transaction/${transactionID}`);
    } catch (error) {
      console.error("Creat transaction error:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <StackableContainer lessPadding>
      <h2>Create New Transaction</h2>
      {msgTypes.map((txType, index) => (
        <MsgForm
          key={getMsgFormKey(txType, msgGetters.current[index]?.msg ?? {})}
          txType={txType}
          senderAddress={senderAddress}
          setMsgGetter={(msgGetter) => {
            msgGetters.current = [
              ...msgGetters.current.slice(0, index),
              msgGetter,
              ...msgGetters.current.slice(index + 1),
            ];
          }}
          deleteMsg={() => {
            msgGetters.current.splice(index, 1);
            setMsgTypes((oldMsgTypes) => {
              const newMsgTypes: TxType[] = oldMsgTypes.slice();
              newMsgTypes.splice(index, 1);
              setGasLimit(
                (oldGasLimit) => (oldGasLimit / oldMsgTypes.length) * (newMsgTypes.length || 1),
              );
              return newMsgTypes;
            });
          }}
        />
      ))}
      <div className="form-item">
        <Input
          type="number"
          label="Gas Limit"
          name="gas-limit"
          value={gasLimit}
          onChange={({ target }) => setGasLimit(Number(target.value))}
        />
      </div>
      <div className="form-item">
        <Input
          label="Gas Price"
          name="gas-price"
          value={gasPrice}
          disabled={true}
          error={gasLimitError}
        />
      </div>
      <div className="form-item">
        <Input
          label="Memo"
          name="memo"
          value={memo}
          onChange={({ target }) => setMemo(target.value)}
        />
      </div>
      <Button
        label="Create Transaction"
        onClick={createTx}
        disabled={!msgTypes.length}
        loading={processing}
      />
      <style jsx>{`
        p {
          margin-top: 15px;
        }
        .form-item {
          margin-top: 1.5em;
        }
      `}</style>
    </StackableContainer>
  );
};

export default withRouter(CreateTxForm);
