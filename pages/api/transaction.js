const exec = require("../../utilities/promiseExec");
const { v4: uuidv4 } = require("uuid");
const { queries } = require("../../database/connectDatabase");

const post = async (req, res) => {
  try {
    // req.body should have unsignedJson, a json object of the
    // cosmos sdk standard send msg, and multiAddress, a string
    // with the address of the multisig that the tx is from
    const { unsignedJson, multiAddress } = req.body;

    // get corresponding multi record
    const multi = queries.getMultiFromAddress.get(multiAddress);
    const transactionUUID = uuidv4();

    const saveResult = queries.insertTransaction.run({
      multi_key_name: multi.key_name,
      unsigned: unsignedJson,
      uuid: transactionUUID,
    });

    res.status(200).send(transactionUUID);
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
