import { updateTxHash } from "../../../../lib/graphqlHelpers";

export default async function (req, res) {
  switch (req.method) {
    case "POST":
      try {
        const { transactionID } = req.query;
        const { txHash } = req.body;
        console.log("Function `updateTransaction` invoked", txHash);
        const saveRes = await updateTxHash(transactionID, txHash);
        console.log("success", saveRes.data);
        res.status(200).send(saveRes.data.data.updateTransaction);
        return;
      } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
        return;
      }
  }
  // no route matched
  res.status(405).end();
  return;
}
