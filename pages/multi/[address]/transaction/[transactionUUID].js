import fileDownload from "js-file-download";
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
  return (
    <div>
      <Head title="Home" />

      <div className="hero">
        <h1 className="title">multisig: {multi && multi.address}</h1>
        <h2>transaction: {transaction && transaction.uuid}</h2>
        <p className="description">
          Download the unsigned transaction json to sign. Once the necessary
          signatures are gathered here, you will be able to broadcast your
          transaction.
        </p>
        <TransactionSigning transaction={transaction} multi={multi} />
      </div>

      <style jsx>{`
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
          margin: 1em 0;
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
