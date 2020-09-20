import React from "react";

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
    }
  }

  handleFileSelection = (e) => {
    const signatureFile = e.target.files[0];
    const reader = new FileReader();

    reader.addEventListener("load", (event) => {
      // do the upload
      console.log(event.target.result);
    });

    reader.readAsText(signatureFile);
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
            this.state.transaction.signatures.length) ||
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
                  gaiacli tx sign (path/to/unsigned.json) --multisig=
                  {this.props.multi && this.props.multi.address}{" "}
                  --output-document signed.json
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
              {this.state.transaction.signatures.map((signature) => (
                <div className="group">
                  <div className="json">
                    <JsonDropDown object={signature} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="upload-signature" onClick={this.clickFileUpload}>
          Upload Signature
        </button>
        <input
          id="fileInput"
          type="file"
          ref={this.fileInput}
          style={{ display: "none" }}
          accept=".json"
          onChange={this.handleFileSelection}
        />
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
          button.upload-signature {
            width: 60%;
            margin: 2em auto;
            font-size: 1.3em;
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
