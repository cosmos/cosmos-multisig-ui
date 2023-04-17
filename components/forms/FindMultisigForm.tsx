import { assert } from "@cosmjs/utils";
import { NextRouter, withRouter } from "next/router";
import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { exampleAddress } from "../../lib/displayHelpers";
import Button from "../inputs/Button";
import Input from "../inputs/Input";
import StackableContainer from "../layout/StackableContainer";

interface Props {
  router: NextRouter;
}

const FindMultisigForm = (props: Props) => {
  const { state } = useAppContext();
  const [address, setAddress] = useState("");

  const handleSearch = () => {
    props.router.push(`/multi/${address}`);
  };

  assert(state.chain.addressPrefix, "addressPrefix missing");

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
          placeholder={`E.g. ${exampleAddress(0, state.chain.addressPrefix)}`}
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
