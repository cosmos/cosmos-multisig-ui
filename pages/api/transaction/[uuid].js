const exec = require("../../utilities/promiseExec");
const { v4: uuidv4 } = require("uuid");
const { queries } = require("../../database/connectDatabase");

const post = async (req, res) => {
  try {
    const {
      query: { uuid },
    } = req;

    // req.body should have signature, a json object of the
    // signature for this transaction
    const { signature } = req.body;

    // get corresponding multi record
    const transaction = queries.getTransactionForUUID.get(uuid);

    if (!transaction) {
      res.status(404).send();
    } else {
      // add signature to existing signatures and save
      transaction.signatures = transaction.signatures
        ? JSON.parse(transaction.signatures)
        : [];

      transaction.signatures.push(signature);
      queries.updateTransactionSignatures({
        signatures: JSON.stringify(transaction.signatures),
        uuid: transaction.uuid,
      });
      const updatedTransaction = queries.getTransactionForUUID.get(uuid);
      res.status(200).send(updatedTransaction);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
};

export default (req, res) => {
  switch (req.method) {
    case "POST":
      post(req, res);
      break;
    default:
      res.status(404).send();
  }
};
