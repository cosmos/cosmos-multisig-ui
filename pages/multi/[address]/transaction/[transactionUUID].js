import fileDownload from "js-file-download";
import Head from "../../../../components/head";
import { queries } from "../../../../database/connectDatabase";
import TransactionForm from "../../../../components/TransactionForm";
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

const JsonDropDown = ({ object }) => {
  const [isOpen, setOpen] = React.useState(false);
  return (
    <div>
      <button
        onClick={() => {
          setOpen(!isOpen);
        }}
      >
        {isOpen ? "Hide" : "Show"} JSON
      </button>
      {isOpen && (
        <pre>{object && JSON.stringify(JSON.parse(object), null, 2)}</pre>
      )}
      <style jsx>{`
        button {
          display: block;
          background: rebeccapurple;

          border: 1px solid coral;
          padding: 0.5em;
          width: 100%;
          color: white;
        }
        pre {
          text-align: left;
          font-size: 10px;
          background: rebeccapurple;
          padding: 1em;
          overflow-x: scroll;
        }
      `}</style>
    </div>
  );
};

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
        <p className="required-sigs">
          {(transaction &&
            transaction.signatures &&
            transaction.signatures.length) ||
            0}{" "}
          of {multi && multi.multi_threshold} signatures uploaded
        </p>
        <div className="pieces">
          <div className="tx-piece">
            <h3>
              Unsigned transaction json{" "}
              <button
                className="download"
                onClick={() =>
                  fileDownload(transaction.unsigned, "unsigned.json")
                }
              >
                Download
              </button>
            </h3>
            <div className="group">
              <div className="instructions">
                Download this and sign the transaction by running:
                <pre>
                  gaiacli tx sign (path/to/unsigned.json) --multisig=
                  {multi && multi.address} --output-document signed.json
                </pre>
              </div>
              <div className="json">
                {transaction && <JsonDropDown object={transaction.unsigned} />}
              </div>
            </div>
          </div>
        </div>
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
        .title {
          margin: 0;
          width: 100%;
          padding-top: 2em;
          line-height: 1.15;
          font-size: 2em;
        }
        .pieces {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        h3 {
          margin: 0 0 1em;
        }
        .tx-piece {
          text-align: left;
          border: 1px solid rebeccapurple;
          padding: 1em;
          width: 60%;
        }
        .instructions {
          width: 65%;
          margin-right: 3%;
        }
        .json {
          width: 30%;
        }
        h2 {
          font-size: 1.5em;
        }
        .group {
          display: flex;
        }
        pre {
          font-size: 10px;
          white-space: pre-wrap;
          background: rebeccapurple;
          padding: 1em;
        }
        .download {
          background: rebeccapurple;
          border: 1px solid coral;
          padding: 0.5em;
          color: white;
          margin-left: 1em;
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
      `}</style>
    </div>
  );
};
