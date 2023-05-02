import { Account, calculateFee } from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import axios from "axios";
import { NextRouter, withRouter } from "next/router";
import { useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import { capitalizeFirstLetter } from "../../../lib/displayHelpers";
import { TxMsg, TxType } from "../../../types/txMsg";
import Button from "../../inputs/Button";
import Input from "../../inputs/Input";
import StackableContainer from "../../layout/StackableContainer";
import MsgForm from "./MsgForm";

interface CreateTxFormProps {
  readonly router: NextRouter;
  readonly txType: TxType;
  readonly senderAddress: string;
  readonly accountOnChain: Account;
  readonly closeForm: () => void;
}

const CreateTxForm = ({
  router,
  txType,
  senderAddress,
  accountOnChain,
  closeForm,
}: CreateTxFormProps) => {
  const { state } = useAppContext();

  const [processing, setProcessing] = useState(false);
  const [checkAndGetMsg, setCheckAndGetMsg] = useState<() => TxMsg | null>();
  const [memo, setMemo] = useState("");
  const [gasLimit, setGasLimit] = useState(200000);
  const [gasLimitError, setGasLimitError] = useState("");

  const gasPrice = state.chain.gasPrice;
  assert(gasPrice, "gasPrice missing");

  const createTx = async () => {
    try {
      assert(typeof accountOnChain.accountNumber === "number", "accountNumber missing");
      assert(!!checkAndGetMsg, "form filled incorrectly");
      const msg = checkAndGetMsg();
      if (!msg) return;

      if (!Number.isSafeInteger(gasLimit) || gasLimit <= 0) {
        setGasLimitError("gas limit must be a positive integer");
        return;
      }

      setProcessing(true);

      const tx = {
        accountNumber: accountOnChain.accountNumber,
        sequence: accountOnChain.sequence,
        chainId: state.chain.chainId,
        msgs: [msg],
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
      <button className="remove" onClick={() => closeForm()}>
        ✕
      </button>
      <h2>Create New {capitalizeFirstLetter(txType)} Transaction</h2>
      <MsgForm
        txType={txType}
        senderAddress={senderAddress}
        setCheckAndGetMsg={setCheckAndGetMsg}
      />
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
        disabled={!checkAndGetMsg}
        loading={processing}
      />
      <style jsx>{`
        p {
          margin-top: 15px;
        }
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

export default withRouter(CreateTxForm);
