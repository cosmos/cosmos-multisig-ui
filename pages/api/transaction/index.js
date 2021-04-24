import { createTransaction } from "../../../lib/graphqlHelpers";

export default async function (req, res) {
  return new Promise(async (resolve) => {
    switch (req.method) {
      case "POST":
        try {
          const data = req.body;
          console.log("Function `createTransaction` invoked", data);
          const saveRes = await createTransaction(data.dataJSON);
          console.log("success", saveRes.data);
          res
            .status(200)
            .send({ transactionID: saveRes.data.data.createTransaction._id });
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
