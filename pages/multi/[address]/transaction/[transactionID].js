import faunadb from "faunadb";

import Page from "../../../../components/layout/Page";
import StackableContainer from "../../../../components/layout/StackableContainer";
import TransactionInfo from "../../../../components/dataViews/TransactionInfo";
import TransactionSigning from "../../../../components/forms/TransactionSigning";

const dummyTX = {
  to: "cosmos1nynns8ex9fq6sjjfj8k79ymkdz4sqth06xexae",
  from: "cosmos1whn7htz4ktrnmvjzvd6nvsye6l8k238ma7uzaf",
  amount: 405.8807,
  status: "unsigned",
  fee: 0.0025,
  memo: "1473141937",
  gas: "62,532 / 100,000",
  height: 5327793,
  type: "send",
};

export async function getServerSideProps(context) {
  const q = faunadb.query;
  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SECRET,
  });
  const transactionID = context.params.transactionID;
  let transactionJSON = "";
  try {
    console.log("Function `getTransactionByID` invoked", transactionID);
    const faunaRes = await client.query(
      q.Get(q.Ref(q.Collection("Transaction"), transactionID))
    );
    console.log("success", faunaRes);
    transactionJSON = faunaRes.data.dataJSON;
  } catch (err) {
    console.log(err);
  }
  return {
    props: { transactionJSON },
  };
}

const transactionPage = ({ transactionJSON }) => {
  const txInfo = (transactionJSON && JSON.parse(transactionJSON)) || null;
  console.log(txInfo);
  return (
    <Page>
      <StackableContainer base>
        <StackableContainer>
          <h1>In Progress Transaction</h1>
        </StackableContainer>
        <TransactionInfo tx={txInfo} />
        <TransactionSigning />
      </StackableContainer>

      <style jsx>{``}</style>
    </Page>
  );
};

export default transactionPage;
