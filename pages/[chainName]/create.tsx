import MultisigForm from "@/components/forms/MultisigForm";
import Page from "@/components/layout/Page";
import StackableContainer from "@/components/layout/StackableContainer";
import { useChains } from "@/context/ChainsContext";

export default function CreatePage() {
  const { chain } = useChains();

  return (
    <Page
      goBack={
        chain.registryName
          ? { pathname: `/${chain.registryName}`, title: "home", needsConfirm: true }
          : undefined
      }
    >
      <StackableContainer base>
        <StackableContainer lessPadding>
          <h1 className="title">Create Legacy Multisig</h1>
        </StackableContainer>
        <MultisigForm />
      </StackableContainer>
    </Page>
  );
}
