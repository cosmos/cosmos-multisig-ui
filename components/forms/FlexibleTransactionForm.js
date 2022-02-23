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
import { MsgDelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx";

const blankMessageJSON = `{
  "typeUrl": "",
  "value": {
  }
}`;

const FlexibleTransactionForm = (props) => {
  const { state } = useAppContext();

  const [advanced, setAdvanced] = useState(props.advanced);

  const [rawJsonMsgs, setRawJsonMsgs] = useState(
    (function () {
      if (!props.msgs) {
        return { 0: blankMessageJSON };
      }

      const out = {};
      props.msgs.forEach(function (msg, i) {
        out[i.toString()] = JSON.stringify(msg, null, 2);
      });
      return out;
    })(),
  );

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
    const msgs = [];
    for (let i; i < rawJsonMsgs.length; ++i) {
      msgs[i.toString] = JSON.parse(rawJsonMsgs[i.toString()]);
    }

    const tx = createTransaction(gas, msgs);
    console.log(tx);
    const dataJSON = JSON.stringify(tx);
    const res = await axios.post("/api/transaction", { dataJSON });
    const { transactionID } = res.data;
    props.router.push(`${props.address}/transaction/${transactionID}`);
  };

  function newCodeMirror(jsonBody, onChange) {
    console.log("RAW", jsonBody);
    return (
      <CodeMirror
        value={jsonBody}
        height="200px"
        extensions={[json(), dark.oneDark]}
        theme="dark"
        onChange={onChange}
      />
    );
  }

  function newMessage(newMsg) {
    const newRawJsonMsgs = JSON.parse(JSON.stringify(rawJsonMsgs));
    newRawJsonMsgs[Object.keys(newRawJsonMsgs).length] = newMsg;
    setRawJsonMsgs(newRawJsonMsgs);
  }

  function getMsgUI(msg) {
    switch (msg.typeUrl) {
      case "/cosmos.staking.v1beta1.MsgDelegate":
        return <MsgDelegate msg={msg} />;
    }
    return null;
  }

  return (
    <StackableContainer lessPadding>
      <button className="remove" onClick={() => props.closeForm()}>
        ✕
      </button>
      <h2>Create New transaction</h2>
      <Button label="✏️ edit" onClick={() => setAdvanced(!advanced)} />
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

      {Object.entries(rawJsonMsgs).map(([k, rawMsg]) => {
        const msgUI = (function () {
          if (advanced) {
            return newCodeMirror(rawJsonMsgs[k.toString()], (newRawJsonMsg, _viewUpdate) => {
              // will throw if unparseable
              // TODO, turn into ui error
              const newRawJsonMsgs = JSON.parse(JSON.stringify(rawJsonMsgs));
              newRawJsonMsgs[k.toString()] = newRawJsonMsg;
              setRawJsonMsgs(newRawJsonMsgs);
            });
          } else {
            // const msgGUI = getMsgUI(JSON.parse(rawMsg));
            // TODO: fix this, react doesnt like the component right now for some reason
            const msgGUI = null
            if (msgGUI === null) {
              return <pre>{rawMsg}</pre>;
            }
            return msgGUI;
          }
        })();

        return (
          <StackableContainer lessPadding key={k}>
            <button
              className="remove"
              onClick={() => {
                const newRawJsonMsgs = {};
                let newIdx = 0;
                for (let j; j < rawJsonMsgs.length; ++j) {
                  if (parseInt(k, 10) != j) {
                    newRawJsonMsgs[newIdx.toString()] = rawJsonMsgs[j.toString()];
                    ++newIdx;
                  }
                }
                setRawJsonMsgs(newRawJsonMsgs);
              }}
            >
              ✕
            </button>
            <h2>Msg {k}</h2>
            <pre>{rawMsg.typeUrl}</pre>
            {msgUI}
          </StackableContainer>
        );
      })}

      <Button label="New Message" onClick={() => newMessage(blankMessageJSON)} />
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
