import { useRouter } from "next/router";
import Head from "../../components/head";
import { queries } from "../../database/connectDatabase";
import TransactionForm from "../../components/TransactionForm";

export async function getStaticPaths() {
  return {
    paths: [{ params: { transactionUUID: "*" } }],
    fallback: true,
  };
}

export async function getStaticProps(context) {
  const { transactionUUID } = context.params;
  const transaction = queries.getTransactionForUUID.get(transactionUUID);

  // if (transaction) {
  //   const multi = queries.getMultiFromUUID.get(transaction.multi_key_name);
  // }
  return {
    props: {
      transaction,
      //multi,
    },
  };
}

export default ({ transaction }) => {
  return (
    <div>
      <Head title="Home" />

      <div className="hero">
        <h1 className="title">
          transaction: {transaction && transaction.uuid}
        </h1>
        <p className="description">
          Download json to sign, and upload json signatures
        </p>

        <div className="unsigned">
          <h3>Unsigned transaction json</h3>
          <p>
            Download this to sign the transaction.
            <pre>
              {transaction &&
                JSON.stringify(JSON.parse(transaction.unsigned), null, 2)}
            </pre>
            Run{" "}
            <pre>
              gaiacli tx sign unsigned.json --multisig=address --output-document
              sign1.json
            </pre>
          </p>
        </div>
      </div>

      <style jsx>{`
        .hero {
          width: 100%;
          text-align: center;
        }
        .title {
          margin: 0;
          width: 100%;
          padding-top: 2em;
          line-height: 1.15;
          font-size: 2em;
        }
        pre {
          text-align: left;
          font-size: 10px;
          background: rebeccapurple;
          padding: 1em;
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
      `}</style>
    </div>
  );
};
