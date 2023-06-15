import { EncodeObject } from "@cosmjs/proto-signing";
import { Account, calculateFee } from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import axios from "axios";
import { NextRouter, withRouter } from "next/router";
import { useRef, useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import { exportMsgToJson, gasOfTx } from "../../../lib/txMsgHelpers";
import { DbTransaction } from "../../../types";
import { MsgTypeUrl, MsgTypeUrls } from "../../../types/txMsg";
import Button from "../../inputs/Button";
import Input from "../../inputs/Input";
import StackableContainer from "../../layout/StackableContainer";
import MsgForm from "./MsgForm";

export interface MsgGetter {
  readonly isMsgValid: () => boolean;
  readonly msg: EncodeObject;
}

interface CreateTxFormProps {
  readonly router: NextRouter;
  readonly senderAddress: string;
  readonly accountOnChain: Account;
}

const CreateTxForm = ({ router, senderAddress, accountOnChain }: CreateTxFormProps) => {
  const { state } = useAppContext();

  const [processing, setProcessing] = useState(false);
  const [msgTypes, setMsgTypes] = useState<readonly MsgTypeUrl[]>([]);
  const [msgKeys, setMsgKeys] = useState<readonly string[]>([]);
  const msgGetters = useRef<MsgGetter[]>([]);
  const [memo, setMemo] = useState("");
  const [gasLimit, setGasLimit] = useState(gasOfTx([]));
  const [gasLimitError, setGasLimitError] = useState("");
  const [showCreateTxError, setShowTxError] = useState(false);

  const gasPrice = state.chain.gasPrice;
  assert(gasPrice, "gasPrice missing");

  const addMsgType = (newMsgType: MsgTypeUrl) => {
    setMsgKeys((oldMsgKeys) => [...oldMsgKeys, crypto.randomUUID()]);
    setMsgTypes((oldMsgTypes) => {
      const newMsgTypes = [...oldMsgTypes, newMsgType];
      setGasLimit(gasOfTx(newMsgTypes));
      return newMsgTypes;
    });
  };

  const createTx = async () => {
    try {
      setShowTxError(false);

      assert(typeof accountOnChain.accountNumber === "number", "accountNumber missing");
      assert(msgGetters.current.length, "form filled incorrectly");
      assert(state.chain.chainId, "chainId missing");

      const msgs = msgGetters.current
        .filter(({ isMsgValid }) => isMsgValid())
        .map(({ msg }) => exportMsgToJson(msg));

      if (!msgs.length || msgs.length !== msgTypes.length) return;

      if (!Number.isSafeInteger(gasLimit) || gasLimit <= 0) {
        setGasLimitError("gas limit must be a positive integer");
        return;
      }

      setProcessing(true);

      const tx: DbTransaction = {
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
      setShowTxError(true);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <StackableContainer lessPadding>
      <h2>Create New Transaction</h2>
      {msgTypes.map((msgType, index) => (
        <MsgForm
          key={msgKeys[index]}
          msgType={msgType}
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
            setMsgKeys((oldMsgKeys) => [
              ...oldMsgKeys.slice(0, index),
              ...oldMsgKeys.slice(index + 1),
            ]);
            setMsgTypes((oldMsgTypes) => {
              const newMsgTypes: MsgTypeUrl[] = oldMsgTypes.slice();
              newMsgTypes.splice(index, 1);
              setGasLimit(gasOfTx(newMsgTypes));
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
      <StackableContainer>
        <Button label="Add MsgSend" onClick={() => addMsgType(MsgTypeUrls.Send)} />
        <Button label="Add MsgDelegate" onClick={() => addMsgType(MsgTypeUrls.Delegate)} />
        <Button label="Add MsgUndelegate" onClick={() => addMsgType(MsgTypeUrls.Undelegate)} />
        <Button
          label="Add MsgBeginRedelegate"
          onClick={() => addMsgType(MsgTypeUrls.BeginRedelegate)}
        />
        <Button
          label="Add MsgWithdrawDelegatorReward"
          onClick={() => addMsgType(MsgTypeUrls.WithdrawDelegatorReward)}
        />
        <Button
          label="Add MsgSetWithdrawAddress"
          onClick={() => addMsgType(MsgTypeUrls.SetWithdrawAddress)}
        />
        <Button
          label="Add MsgCreateVestingAccount"
          onClick={() => addMsgType(MsgTypeUrls.CreateVestingAccount)}
        />
        <Button label="Add MsgTransfer" onClick={() => addMsgType(MsgTypeUrls.Transfer)} />
      </StackableContainer>
      {showCreateTxError ? (
        <StackableContainer lessMargin lessPadding>
          <p className="multisig-error">
            Error when creating the transaction. See console for more details.
          </p>
        </StackableContainer>
      ) : null}
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
        .multisig-error {
          margin: 0;
          max-width: 100%;
          color: red;
          font-size: 16px;
          text-align: center;
        }
      `}</style>
    </StackableContainer>
  );
};

export default withRouter(CreateTxForm);
