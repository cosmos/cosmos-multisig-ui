import faunadb from "faunadb";

export default async function (req, res) {
  return new Promise(async (resolve) => {
    switch (req.method) {
      case "GET":
        const q = faunadb.query;
        const client = new faunadb.Client({
          secret: process.env.FAUNADB_SECRET,
        });
        try {
          const {
            query: { transactionID },
          } = req;
          console.log("Function `getTransactionByID` invoked", transactionID);
          const faunaRes = await client.query(
            q.Get(q.Ref(q.Collection("Transaction"), transactionID))
          );
          console.log("success", faunaRes);
          res.status(200).send(faunaRes);
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
