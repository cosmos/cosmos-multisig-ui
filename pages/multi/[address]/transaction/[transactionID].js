import Page from "../../../../components/layout/Page";
import StackableContainer from "../../../../components/layout/StackableContainer";
import TransactionInfo from "../../../../components/dataViews/TransactionInfo";
import TransactionSigning from "../../../../components/forms/TransactionSigning";

export async function getServerSideProps(context) {
  import { StargateClient } from "@cosmjs/stargate";
  import { findTransactionByID } from "../../../../lib/graphqlHelpers";
  import { getMultisigAccount } from "../../../../lib/multisigHelpers";
  // get multisig account and transaction info
  const client = await StargateClient.connect("143.198.6.14:26657");
  const multisigAddress = context.params.address;
  const holdings = await client.getBalance(multisigAddress, "uatom");
  const transactionID = context.params.transactionID;
  let transactionJSON;
  let accountOnChain;
  try {
    accountOnChain = await getMultisigAccount(multisigAddress, client);
    console.log("Function `findTransactionByID` invoked", transactionID);
    const getRes = await findTransactionByID(transactionID);
    console.log("success", getRes.data);
    transactionJSON = getRes.data.data.findTransactionByID.dataJSON;
  } catch (err) {
    console.log(err);
  }
  return {
    props: { transactionJSON, accountOnChain, holdings },
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
        <TransactionSigning tx={txInfo} />
      </StackableContainer>

      <style jsx>{``}</style>
    </Page>
  );
};

export default transactionPage;
