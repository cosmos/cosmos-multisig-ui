import axios from "axios";
import { calculateFee } from "@cosmjs/stargate";
import React, { useState } from "react";
import { withRouter } from "next/router";

import { useAppContext } from "../../context/AppContext";
import Button from "../../components/inputs/Button";
import Input from "../../components/inputs/Input";
import StackableContainer from "../layout/StackableContainer";
import { json } from "@codemirror/lang-json";
import * as dark from "@codemirror/theme-one-dark";
import CodeMirror from "@uiw/react-codemirror";

const blankMessageJSON = `{
  "typeUrl": "",
  "value": {
  }
}`;

const placeholderMessagesJSON = `[
  {
    "typeUrl": "/cosmos.staking.v1beta1.MsgDelegate",
    "value": {
      "delegatorAddress": "",
      "validatorAddress": "",
      "amount": {
        "amount": "",
        "denom": "uumee"
      }
    }
  }
]`;

const FlexibleTransactionForm = (props) => {
  const { state } = useAppContext();

  const [msgs, setMsgs] = useState([
    {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: {
        fromAddress: "",
        toAddress: "",
        amount: [
          {
            amount: "",
            denom: "uumee",
          },
        ],
      },
    },
  ]);

  const [memo, setMemo] = useState("");
  const [gas, setGas] = useState(200000);
  const [gasPrice, _setGasPrice] = useState(state.chain.gasPrice);
  const [_processing, setProcessing] = useState(false);

  const createTransaction = (txGas, txMsgs) => {
    const fee = calculateFee(Number(txGas), gasPrice);
    return {
      accountNumber: props.accountOnChain.accountNumber,
      sequence: props.accountOnChain.sequence,
      chainId: state.chain.chainId,
      msgs: txMsgs,
      fee: fee,
      memo: memo,
    };
  };

  const handleCreate = async () => {
    setProcessing(true);
    const tx = createTransaction(gas, msgs);
    console.log(tx);
    const dataJSON = JSON.stringify(tx);
    const res = await axios.post("/api/transaction", { dataJSON });
    const { transactionID } = res.data;
    props.router.push(`${props.address}/transaction/${transactionID}`);
  };

  function newCodeMirror(body, onChange) {
    return (
      <CodeMirror
        value={JSON.stringify(body, null, 2)}
        height="200px"
        extensions={[json(), dark.oneDark]}
        theme="dark"
        onChange={onChange}
      />
    );
  }

  function newMessage(newMsg) {
    const newMsgs = [];

    msgs.forEach((msg) => {
      newMsgs.push(msg);
    });

    newMsgs.push(newMsg);

    setMsgs(newMsgs);
  }

  return (
    <StackableContainer lessPadding>
      <button className="remove" onClick={() => props.closeForm()}>
        ✕
      </button>
      <h2>Create New transaction</h2>
      <div className="form-item">
        <Input
          label="Gas Limit"
          name="gas"
          type="number"
          value={gas}
          onChange={(e) => setGas(e.target.value)}
        />
      </div>
      <div className="form-item">
        <Input label="Gas Price" name="gas_price" type="string" value={gasPrice} disabled={true} />
      </div>
      <div className="form-item">
        <Input
          label="Memo"
          name="memo"
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      {msgs.map((msg, i) => {
        return (
          <StackableContainer lessPadding key={i}>
            <button
              className="remove"
              onClick={() => {
                const newMsgs = [];

                msgs.forEach((innerMsg, j) => {
                  // skip the deleted item
                  if (i != j) {
                    // deep copy
                    newMsgs[i] = JSON.parse(JSON.stringify(innerMsg));
                  }
                });

                setMsgs(newMsgs);
              }}
            >
              ✕
            </button>
            <h2>Msg {i}</h2>
            <pre>{msg.typeUrl}</pre>
            {newCodeMirror(msgs[i], (changedMsgJSON, viewUpdate) => {
              // will throw if unparseable
              // TODO, turn into ui error
              const newMsg = JSON.parse(changedMsgJSON);

              // deep copy
              const newMsgs = JSON.parse(JSON.stringify(msgs));

              newMsgs[i] = newMsg;

              setMsgs(newMsgs);
            })}
          </StackableContainer>
        );
      })}

      <Button label="New Message" onClick={() => newMessage(JSON.parse(blankMessageJSON))} />
      <Button label="Create Transaction" onClick={handleCreate} />
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

export default withRouter(FlexibleTransactionForm);
