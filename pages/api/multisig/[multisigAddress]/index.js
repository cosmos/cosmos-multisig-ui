import { getMultisig } from "../../../../lib/graphqlHelpers";

export default async function (req, res) {
  switch (req.method) {
    case "GET":
      try {
        const { multisigAddress } = req.query;
        console.log("Function `getMultisig` invoked", multisigAddress);
        const getRes = await getMultisig(multisigAddress);
        if (!getRes.data.data.getMultisig) {
          res.status(404).send("Multisig not found");
          return;
        }
        console.log("success", getRes.data.data.getMultisig);
        res.status(200).send(getRes.data.data.getMultisig);
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
