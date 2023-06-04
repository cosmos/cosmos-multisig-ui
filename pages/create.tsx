import MultisigForm from "../components/forms/MultisigForm";
import Page from "../components/layout/Page";
import StackableContainer from "../components/layout/StackableContainer";

const CreatePage = () => (
  <Page goBack={{ pathname: "/", title: "home", needsConfirm: true }}>
    <StackableContainer base>
      <StackableContainer lessPadding>
        <h1 className="title">Create Legacy Multisig</h1>
      </StackableContainer>
      <MultisigForm />
    </StackableContainer>
  </Page>
);

export default CreatePage;
