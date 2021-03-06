import axios from "axios";
import React from "react";

import StackableContainer from "../layout/StackableContainer";
import TransactionInfo from "../dataViews/TransactionInfo";

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
              <TransactionInfo tx={tx} abbreviate />
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
        `}</style>
      </StackableContainer>
    );
  }
}

export default TransactionList;
