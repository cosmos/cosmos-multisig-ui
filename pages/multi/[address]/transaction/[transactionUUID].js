import Head from "../../../../components/head";
import { queries } from "../../../../database/connectDatabase";
import TransactionSigning from "../../../../components/TransactionSigning";
import { useRouter } from "next/router";

export async function getStaticPaths() {
  return {
    paths: [{ params: { transactionUUID: "*", address: "*" } }],
    fallback: true,
  };
}

export async function getStaticProps(context) {
  const { transactionUUID, address } = context.params;
  const transaction = queries.getTransactionForUUID.get(transactionUUID);
  const multi = queries.getMultiFromAddress.get(address);
  return {
    props: {
      transaction,
      multi,
    },
  };
}

export default ({ transaction, multi }) => {
  const txInfo = (transaction && JSON.parse(transaction.unsigned)) || null;
  return (
    <div>
      <Head title="Home" />
      <div className="hero">
        {txInfo && (
          <div className="transaction-info">
            <h2>Transaction Info</h2>
            <ul>
              <li>
                <span>To:</span> {txInfo.value.msg[0].value.to_address}
              </li>
              <li>
                <span>From:</span> {txInfo.value.msg[0].value.from_address}
              </li>
              <li>
                <span>Amount:</span>{" "}
                {txInfo.value.msg[0].value.amount[0].amount} uatom
              </li>
              <li>
                <span>To:</span> {txInfo.value.fee.gas} uatom
              </li>
            </ul>
          </div>
        )}
        <p className="description">
          Download the unsigned transaction json to sign. Once the necessary
          signatures are gathered here, you will be able to broadcast your
          transaction.
        </p>
        <TransactionSigning transaction={transaction} multi={multi} />
      </div>

      <style jsx>{`
        .transaction-info {
          text-align: left;
          border: 1px solid rebeccapurple;
          border-radius: 1em;
          padding: 0.5em 1em;
          width: 60%;
          margin: 2em auto 1em;
        }

        .transaction-info ul {
          list-style: none;
          padding: 0;
          font-size: 1.2em;
        }

        .transaction-info span {
          font-weight: bold;
          margin-right: 0.5em;
        }
        .transaction-info li {
          margin: 0.5em 0;
        }
        .hero {
          width: 100%;
          text-align: center;
        }
        p {
          max-width: 600px;
          margin: 0 auto 1em;
        }
        .required-sigs {
          font-size: 1.5em;
        }

        h2 {
          font-size: 1.5em;
          margin: 0.25em 0;
          font-weight: bold;
        }
        .title {
          margin: 0;
          width: 100%;
          padding-top: 2em;
          line-height: 1.15;
          font-size: 2em;
        }
      `}</style>
      <style global jsx>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
          color: white;
          background: #500a58;
          font-size: 16px;
          margin: 0;
        }
        *:focus {
          outline: none;
        }
        button {
          cursor: pointer;
        }
        button:hover {
          font-style: italic;
        }
      `}</style>
    </div>
  );
};
