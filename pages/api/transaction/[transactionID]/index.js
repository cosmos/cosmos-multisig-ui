import { updateTxHash } from "../../../../lib/graphqlHelpers";

export default async function (req, res) {
  return new Promise(async (resolve) => {
    switch (req.method) {
      case "POST":
        try {
          const { transactionID } = req.query;
          const { txHash } = req.body;
          console.log("Function `updateTransaction` invoked", txHash);
          const saveRes = await updateTxHash(transactionID, txHash);
          console.log("success", saveRes.data);
          res.status(200).send(saveRes.data.data.updateTransaction);
          return resolve();
        } catch (err) {
          console.log(err);
          res.status(400).send(err.message);
          return resolve();
        }
    }
    // no route matched
    res.status(405).end();
    return resolve();
  });
}
