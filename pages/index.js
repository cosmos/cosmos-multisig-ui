import React from "react";

import FindMultisigForm from "../components/forms/FindMultisigForm";
import Page from "../components/layout/Page";
import StackableContainer from "../components/layout/StackableContainer";

const chainDisplayName = process.env.NEXT_PUBLIC_CHAIN_DISPLAY_NAME;

const MultiPage = () => (
  <Page>
    <StackableContainer base>
      <StackableContainer lessPadding>
        <h1 className="title">{chainDisplayName} Multisig Manager</h1>
      </StackableContainer>
      <FindMultisigForm />
    </StackableContainer>
  </Page>
);

export default MultiPage;
