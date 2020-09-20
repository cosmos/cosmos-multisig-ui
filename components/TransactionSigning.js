import axios from "axios";
import fileDownload from "js-file-download";
import React from "react";

const JsonDropDown = ({ object }) => {
  const [isOpen, setOpen] = React.useState(false);
  let json = object;

  if (typeof object === "string") {
    json = JSON.parse(object);
  }
  return (
    <div>
      <button
        onClick={() => {
          setOpen(!isOpen);
        }}
      >
        {isOpen ? "Hide" : "Show"} JSON
      </button>
      {isOpen && <pre>{object && JSON.stringify(json, null, 2)}</pre>}
      <style jsx>{`
        button {
          display: block;
          background: rebeccapurple;
          border-radius: 1em;
          border: 1px solid coral;
          padding: 0.5em;
          width: 100%;
          color: white;
          font-size: 0.7em;
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

export default class TransactionSigning extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      transaction: this.props.transaction,
    };

    this.fileInput = React.createRef();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.transaction && this.props.transaction) {
      this.setState({ transaction: this.props.transaction });
      console.log(JSON.parse(this.props.transaction.signatures));
    }
  }

  handleFileSelection = (e) => {
    const signatureFile = e.target.files[0];
    const reader = new FileReader();

    reader.addEventListener("load", async (event) => {
      // do the upload
      const signature = JSON.parse(event.target.result);

      const res = await axios.post(
        `/api/transaction/${this.state.transaction.uuid}`,
        {
          signature: signature,
        }
      );

      const updatedTx = res.data;

      this.setState({
        transaction: updatedTx,
      });
    });

    reader.readAsText(signatureFile);
  };

  handleBroadcast = async () => {
    this.setState({ processing: true });
    const res = await axios.get(
      `/api/transaction/${this.state.transaction.uuid}/broadcast`
    );

    this.setState({
      transaction: res.data,
      processing: false,
    });
  };

  clickFileUpload = () => {
    this.fileInput.current.click();
  };

  render() {
    return (
      <div>
        <p className="required-sigs">
          {(this.state.transaction &&
            this.state.transaction.signatures &&
            JSON.parse(this.state.transaction.signatures).length) ||
            0}{" "}
          of {this.props.multi && this.props.multi.multi_threshold} signatures
          uploaded
        </p>
        <div className="pieces">
          <div className="tx-piece">
            <h3>
              Unsigned transaction json{" "}
              <button
                className="download"
                onClick={() =>
                  fileDownload(this.state.transaction.unsigned, "unsigned.json")
                }
              >
                Download
              </button>
            </h3>
            <div className="group">
              <div className="instructions">
                Download this and sign the transaction by running:
                <pre>
                  gaiacli tx sign {"{"}path/to/unsigned.json{"}"} --multisig=
                  {this.props.multi && this.props.multi.address} --from {"{"}
                  local-key-name{"}"} --output-document signed.json
                </pre>
              </div>
              <div className="json">
                {this.state.transaction && (
                  <JsonDropDown object={this.state.transaction.unsigned} />
                )}
              </div>
            </div>
          </div>
          {this.state.transaction && this.state.transaction.signatures && (
            <div className="tx-piece">
              <h3>Current signatures</h3>
              <div className="signatures">
                {JSON.parse(this.state.transaction.signatures).map(
                  (signature, i) => (
                    <div key={`sig-${i}`} className="group signature">
                      <h4>Sig {i + 1}</h4>
                      <div className="json">
                        <JsonDropDown object={signature} />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
        {this.state.transaction && !this.state.transaction.completed_tx && (
          <div>
            {(this.state.transaction.signatures &&
              JSON.parse(this.state.transaction.signatures).length) >=
            (this.props.multi && this.props.multi.multi_threshold) ? (
              <div>
                {this.state.processing ? (
                  <button className="main broadcast processing" disabled>
                    Processing
                  </button>
                ) : (
                  <button
                    className="main broadcast"
                    onClick={this.handleBroadcast}
                  >
                    Sign and Broadcast Transaction
                  </button>
                )}
              </div>
            ) : (
              <button
                className="main upload-signature"
                onClick={this.clickFileUpload}
              >
                Upload Signature
              </button>
            )}
          </div>
        )}
        <input
          id="fileInput"
          type="file"
          ref={this.fileInput}
          style={{ display: "none" }}
          accept=".json"
          onChange={this.handleFileSelection}
        />
        {this.state.transaction && this.state.transaction.completed_tx && (
          <div className="transaction-response">
            <h3>Transaction info</h3>
            <pre>{this.state.transaction.completed_tx}</pre>
          </div>
        )}
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
            font-size: 1.2em;
            font-weight: bold;
          }
          .tx-piece {
            text-align: left;
            border: 1px solid rebeccapurple;
            border-radius: 1em;
            padding: 1em;
            margin-bottom: 1em;
            width: 60%;
          }
          .instructions {
            width: 65%;
            margin-right: 3%;
          }
          .json {
            width: 30%;
          }
          .group {
            display: flex;
          }
          .signatures {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
          }
          .group.signature {
            flex-direction: column;
            width: 48%;
            margin-bottom: 1em;
          }
          .group.signature .json {
            width: 100%;
          }
          h4 {
            margin: 0 0 0.5em;
          }
          pre {
            font-size: 10px;
            white-space: pre-wrap;
            background: rebeccapurple;
            padding: 1em;
          }
          button {
            display: block;
            border: 1px solid coral;
            background: none;
            color: white;
            font-size: 1em;
            border-radius: 1em;
            padding: 0.5em 1em;
            cursor: pointer;
          }
          button.main {
            width: 60%;
            margin: 2em auto;
            font-size: 1.3em;
          }
          button.broadcast {
            background: coral;
          }
          button.broadcast.processing {
            font-style: italic;
          }
          button.upload-signature:hover {
            background: rebeccapurple;
          }
          button.download {
            display: inline-block;
            background: rebeccapurple;
            border: 1px solid coral;
            border-radius: 1em;
            padding: 0.5em;
            color: white;
            margin-left: 1em;
            font-size: 0.7em;
          }
        `}</style>
      </div>
    );
  }
}
