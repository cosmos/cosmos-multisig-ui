import { MsgUpdateAdminEncodeObject } from "@cosmjs/cosmwasm-stargate";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { checkAddress, exampleAddress, trimStringsObj } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";

interface MsgUpdateAdminFormProps {
  readonly senderAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgUpdateAdminForm = ({
  senderAddress,
  setMsgGetter,
  deleteMsg,
}: MsgUpdateAdminFormProps) => {
  const { chain } = useChains();

  const [contractAddress, setContractAddress] = useState("");
  const [newAdminAddress, setNewAdminAddress] = useState("");

  const [contractAddressError, setContractAddressError] = useState("");
  const [newAdminAddressError, setNewAdminAddressError] = useState("");

  const trimmedInputs = trimStringsObj({ contractAddress, newAdminAddress });

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { contractAddress, newAdminAddress } = trimmedInputs;

    const isMsgValid = (): boolean => {
      setContractAddressError("");
      setNewAdminAddressError("");

      const contractAddressErrorMsg = checkAddress(contractAddress, chain.addressPrefix);
      if (contractAddressErrorMsg) {
        setContractAddressError(
          `Invalid address for network ${chain.chainId}: ${contractAddressErrorMsg}`,
        );
        return false;
      }

      const newAdminAddressErrorMsg = checkAddress(newAdminAddress, chain.addressPrefix);
      if (newAdminAddressErrorMsg) {
        setNewAdminAddressError(
          `Invalid address for network ${chain.chainId}: ${newAdminAddressErrorMsg}`,
        );
        return false;
      }

      return true;
    };

    const msgValue = MsgCodecs[MsgTypeUrls.UpdateAdmin].fromPartial({
      sender: senderAddress,
      contract: contractAddress,
      newAdmin: newAdminAddress,
    });

    const msg: MsgUpdateAdminEncodeObject = { typeUrl: MsgTypeUrls.UpdateAdmin, value: msgValue };

    setMsgGetter({ isMsgValid, msg });
  }, [chain.addressPrefix, chain.chainId, senderAddress, setMsgGetter, trimmedInputs]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgUpdateAdmin</h2>
      <div className="form-item">
        <Input
          label="Contract Address"
          name="contract-address"
          value={contractAddress}
          onChange={({ target }) => {
            setContractAddress(target.value);
            setContractAddressError("");
          }}
          error={contractAddressError}
          placeholder={`E.g. ${exampleAddress(0, chain.addressPrefix)}`}
        />
      </div>
      <div className="form-item">
        <Input
          label="New Admin"
          name="new-admin"
          value={newAdminAddress}
          onChange={({ target }) => {
            setNewAdminAddress(target.value);
            setNewAdminAddressError("");
          }}
          error={newAdminAddressError}
          placeholder={`E.g. ${exampleAddress(0, chain.addressPrefix)}`}
        />
      </div>
      <style jsx>{`
        .form-item {
          margin-top: 1.5em;
        }

        .form-item label {
          font-style: italic;
          font-size: 12px;
        }

        .form-select {
          display: flex;
          flex-direction: column;
          gap: 0.8em;
        }

        button.remove {
          background: rgba(255, 255, 255, 0.2);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: none;
          color: white;
          position: absolute;
          right: 10px;
          top: 10px;
        }
      `}</style>
    </StackableContainer>
  );
};

export default MsgUpdateAdminForm;
