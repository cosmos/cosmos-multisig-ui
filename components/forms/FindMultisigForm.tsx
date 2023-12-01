import { StargateClient } from "@cosmjs/stargate";
import { NextRouter, withRouter } from "next/router";
import { useEffect, useState } from "react";
import { useChains } from "../../context/ChainsContext";
import { exampleAddress } from "../../lib/displayHelpers";
import { getMultisigAccount } from "../../lib/multisigHelpers";
import Button from "../inputs/Button";
import Input from "../inputs/Input";
import StackableContainer from "../layout/StackableContainer";

interface Props {
  router: NextRouter;
}

const FindMultisigForm = (props: Props) => {
  const { chain } = useChains();
  const [address, setAddress] = useState("");
  const [multisigError, setMultisigError] = useState("");

  const handleSearch = () => {
    props.router.push(`/${chain.registryName}/${address}`);
  };

  useEffect(() => {
    (async function () {
      if (!address) {
        setMultisigError("");
        return;
      }

      try {
        const client = await StargateClient.connect(chain.nodeAddress);
        await getMultisigAccount(address, chain.addressPrefix, client);
        setMultisigError("");
      } catch (error) {
        if (error instanceof Error) {
          setMultisigError(error.message);
        } else {
          setMultisigError("Multisig error");
        }
        console.error("Multisig error:", error);
      }
    })();
  }, [address, chain.addressPrefix, chain.nodeAddress]);

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
          placeholder={`E.g. ${exampleAddress(0, chain.addressPrefix)}`}
          error={multisigError}
        />
        <Button
          label="Use this Multisig"
          onClick={handleSearch}
          primary
          disabled={!address || !!multisigError}
        />
      </StackableContainer>
      <StackableContainer lessPadding>
        <p className="create-help">Don't have a multisig?</p>
        <Button
          label="Create New Multisig"
          onClick={() => props.router.push(`${chain.registryName}/create`)}
        />
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
