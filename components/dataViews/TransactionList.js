import axios from "axios";
import React from "react";

import { abbreviateLongString } from "../../lib/displayHelpers";
import StackableContainer from "../layout/StackableContainer";

const dummyTXs = [
  {
    to: "cosmos1nynns8ex9fq6sjjfj8k79ymkdz4sqth06xexae",
    from: "cosmos1whn7htz4ktrnmvjzvd6nvsye6l8k238ma7uzaf",
    amount: 405.8807,
    txHash: "A75448D31770E29F826717E3C6FDD5F656453951CF8A82FF212C9258B9C8844F",
    status: "success",
    time: "2021-02-28 19:59:40",
    fee: 0.0025,
    memo: "1473141937",
    gas: "62,532 /100,000",
    height: 5327793,
    type: "send",
  },
  {
    to: "cosmos1nynns8ex9fq6sjjfj8k79ymkdz4sqth06xexae",
    from: "cosmos1whn7htz4ktrnmvjzvd6nvsye6l8k238ma7uzaf",
    amount: 405.8807,
    txHash: "A75448D31770E29F826717E3C6FDD5F656453951CF8A82FF212C9258B9C8844F",
    status: "success",
    time: "2021-02-28 19:59:40",
    fee: 0.0025,
    memo: "1473141937",
    gas: "62,532 /100,000",
    height: 5327793,
    type: "send",
  },
  {
    to: "cosmos1nynns8ex9fq6sjjfj8k79ymkdz4sqth06xexae",
    from: "cosmos1whn7htz4ktrnmvjzvd6nvsye6l8k238ma7uzaf",
    amount: 405.8807,
    txHash: "A75448D31770E29F826717E3C6FDD5F656453951CF8A82FF212C9258B9C8844F",
    status: "success",
    time: "2021-02-28 19:59:40",
    fee: 0.0025,
    memo: "1473141937",
    gas: "62,532 /100,000",
    height: 5327793,
    type: "send",
  },
];
class TransactionList extends React.Component {
  render() {
    return (
      <StackableContainer lessPadding>
        <h2>Past Transactions</h2>
        <ul>
          {dummyTXs.map((tx, i) => (
            <li key={tx.txHash} className="tx">
              <StackableContainer lessPadding lessMargin>
                <ul className="meta-data">
                  <li>
                    <label>Amount:</label>
                    <div>{tx.amount} ATOM</div>
                  </li>
                  <li>
                    <label>To:</label>
                    <div title={tx.to}>{abbreviateLongString(tx.to)}</div>
                  </li>

                  <li>
                    <label>Tx Hash:</label>
                    <div title={tx.txHash}>
                      {abbreviateLongString(tx.txHash)}
                    </div>
                  </li>
                  <li>
                    <label>Status:</label>
                    <div>{tx.status}</div>
                  </li>
                  <li>
                    <label>Fee:</label>
                    <div>{tx.fee}</div>
                  </li>
                  <li>
                    <label>Date:</label>
                    <div>{tx.time}</div>
                  </li>
                </ul>
              </StackableContainer>
            </li>
          ))}
        </ul>
        <style jsx>{`
          ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .tx {
            margin-top: 20px;
          }
          .meta-data li {
            margin-top: 10px;
            background: rgba(255, 255, 255, 0.03);
            padding: 6px 10px;
            border-radius: 8px;
            display: flex;
            align-items: center;
          }
          .meta-data li:first-child {
            margin-top: 0;
          }
          .meta-data label {
            font-size: 12px;
            background: rgba(255, 255, 255, 0.1);
            padding: 3px 6px;
            border-radius: 5px;
            display: block;
          }
          .meta-data li div {
            padding: 3px 6px;
          }
        `}</style>
      </StackableContainer>
    );
  }
}

export default TransactionList;
