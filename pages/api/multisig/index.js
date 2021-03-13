import faunadb from "faunadb";

export default async function (req, res) {
  return new Promise(async (resolve) => {
    switch (req.method) {
      case "POST":
        const q = faunadb.query;
        const client = new faunadb.Client({
          secret: process.env.FAUNADB_SECRET,
        });
        try {
          const data = req.body;
          console.log("Function `createMultisig` invoked", data);
          const multisig = {
            data: data,
          };
          const faunaRes = await client.query(
            q.Create(q.Collection("Multisig"), multisig)
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
