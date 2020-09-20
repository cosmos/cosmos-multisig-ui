const fs = require("fs");
const gaiaWrap = require("../../../../lib/gaiaWrap");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { queries } = require("../../../../database/connectDatabase");

const get = async (req, res) => {
  try {
    const {
      query: { uuid },
    } = req;

    // get corresponding multi record
    const transaction = queries.getTransactionForUUID.get(uuid);

    if (!transaction) {
      res.status(404).send();
    } else {
      const multi = queries.getMultiFromUUID.get(transaction.multi_key_name);
      const signatures = JSON.parse(transaction.signatures);
      if (signatures.length < multi.multi_threshold) {
        res.status(400).send("Not enough signatures");
      } else {
        // create the files and multisign the tx
        const unsignedJsonPath = `${transaction.uuid}-unsigned.json`;
        fs.writeFileSync(unsignedJsonPath, transaction.unsigned);

        const signatureFilePaths = [];
        for (var i = 0; i < signatures.length; i++) {
          const signature = signatures[i];
          const filePath = `${transaction.uuid}-sign${i}.json`;

          fs.writeFileSync(filePath, JSON.stringify(signature));
          signatureFilePaths.push(filePath);
        }

        let signedTransaction = await gaiaWrap.signMulti({
          keyName: multi.key_name,
          signatureFiles: signatureFilePaths,
          unsignedFile: unsignedJsonPath,
        });

        signedTransaction = signedTransaction.replace(/(\r\n|\n|\r)/gm, "");

        // save signed tx
        queries.updateTransactionSigned.run({
          uuid: transaction.uuid,
          signed: signedTransaction,
        });

        // save signed transaction
        const signedTxPath = `${transaction.uuid}-signed.json`;
        fs.writeFileSync(signedTxPath, signedTransaction);

        // broadcast tx
        const broadcastRes = await gaiaWrap.broadcastTX({
          txFilename: signedTxPath,
        });

        queries.updateTransactionCompleted.run({
          completed_tx: broadcastRes,
          uuid: transaction.uuid,
        });

        const updatedTransaction = queries.getTransactionForUUID.get(uuid);

        res.status(200).send(updatedTransaction);

        // delete unsigned and signatures
        fs.unlink(unsignedJsonPath, (err) => {
          throw err;
        });

        for (var i = 0; i < signatureFilePaths.length; i++) {
          fs.unlink(signatureFilePaths[i], (err) => {
            throw err;
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
};

export default (req, res) => {
  switch (req.method) {
    case "GET":
      get(req, res);
      break;
    default:
      res.status(404).send();
  }
};
