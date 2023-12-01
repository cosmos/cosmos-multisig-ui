import FindMultisigForm from "@/components/forms/FindMultisigForm";
import Page from "@/components/layout/Page";
import StackableContainer from "@/components/layout/StackableContainer";
import { useChains } from "@/context/ChainsContext";

const MultiPage = () => {
  const { chain } = useChains();

  return (
    <Page>
      <StackableContainer base>
        <StackableContainer lessPadding>
          <h1 className="title">
            <span>{chain.chainDisplayName}</span> Multisig Manager
          </h1>
        </StackableContainer>
        <FindMultisigForm />
      </StackableContainer>
    </Page>
  );
};

export default MultiPage;
