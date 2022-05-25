import React, { useState } from "react";
import { withRouter, NextRouter } from "next/router";

import { useAppContext } from "../../context/AppContext";
import Button from "../inputs/Button";
import StackableContainer from "../layout/StackableContainer";
import Input from "../inputs/Input";
import { exampleAddress } from "../../lib/displayHelpers";

interface Props {
  router: NextRouter;
}

const FindMultisigForm = (props: Props) => {
  const { state } = useAppContext();
  const [address, setAddress] = useState("");
  const [_processing, setProcessing] = useState(false);

  const handleSearch = () => {
    setProcessing(true);

    props.router.push(`/multi/${address}`);
  };

  return (
    <StackableContainer>
      <StackableContainer lessPadding>
        <p>
          Already have a multisig address? Enter it below. If it’s a valid address, you will be able
          to view its transactions and create new ones.
        </p>
      </StackableContainer>
      <StackableContainer lessPadding lessMargin>
        <Input
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
          value={address}
          label="Multisig Address"
          name="address"
          placeholder={`E.g. ${exampleAddress(0, state!.chain.addressPrefix!)}`}
        />
        <Button label="Use this Multisig" onClick={handleSearch} primary />
      </StackableContainer>
      <StackableContainer lessPadding>
        <p className="create-help">Don't have a multisig?</p>
        <Button label="Create New Multisig" onClick={() => props.router.push("create")} />
      </StackableContainer>
      <style jsx>{`
        .multisig-form {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .error {
          color: coral;
          font-size: 0.8em;
          text-align: left;
          margin: 0.5em 0;
        }
        .create-help {
          text-align: center;
        }
      `}</style>
    </StackableContainer>
  );
};

export default withRouter(FindMultisigForm);
