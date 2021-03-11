import faunadb from "faunadb"; /* Import faunaDB sdk */

/* configure faunaDB Client with our secret */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET,
});

exports.handler = async (event, context, callback) => {
  const data = JSON.parse(event.body);
  console.log("Function `createMultisig` invoked", data);
  const multisig = {
    data: data,
  };
  try {
    const faunaRes = await client.query(
      q.Create(q.Collection("Multisig"), multisig)
    );
    console.log("success", response);
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.log("error", error);
    return {
      statusCode: 400,
      body: JSON.stringify(error),
    };
  }
};
