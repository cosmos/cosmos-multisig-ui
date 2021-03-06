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

const transactionPage = ({ transaction, multi }) => {
  const txInfo = (transaction && JSON.parse(transaction.unsigned)) || null;
  return (
    <Page>
      <StackableContainer base>
        <StackableContainer>
          <h1>Un-broadcast Transaction</h1>
        </StackableContainer>
        <TransactionInfo tx={dummyTX} />
        <TransactionSigning />
      </StackableContainer>

      <style jsx>{``}</style>
    </Page>
  );
};

export default transactionPage;
