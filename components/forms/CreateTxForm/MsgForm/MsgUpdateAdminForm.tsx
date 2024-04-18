import { MsgUpdateAdminEncodeObject } from "@cosmjs/cosmwasm-stargate";
import { useEffect, useRef, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { checkAddress, exampleAddress, trimStringsObj } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";

interface MsgUpdateAdminFormProps {
  readonly fromAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgUpdateAdminForm = ({
                                      fromAddress,
                                      setMsgGetter,
                                      deleteMsg,
                                    }: MsgUpdateAdminFormProps) => {
  const { chain } = useChains();

  const [contractAddress, setContractAddress] = useState("");
  const [newAdmin, setNewAdmin] = useState("");

  const [contractAddressError, setContractAddressError] = useState("");
  const [codeIdError, setNewAdminError] = useState("");

  const trimmedInputs = trimStringsObj({ contractAddress, newAdmin });

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { contractAddress, newAdmin } = trimmedInputs;

    const isMsgValid = (): boolean => {
      setContractAddressError("");
      setNewAdminError("");

      const addressErrorMsg = checkAddress(contractAddress, chain.addressPrefix);
      if (addressErrorMsg) {
        setContractAddressError(`Invalid address for network ${chain.chainId}: ${addressErrorMsg}`);
        return false;
      }

      const newAdminErrorMsg = checkAddress(newAdmin, chain.addressPrefix);
      if (newAdminErrorMsg) {
        setNewAdminError("New admin should be a valid bech32 address.");
        return false;
      }

      return true;
    };

    const msgValue = MsgCodecs[MsgTypeUrls.UpdateAdmin].fromPartial({
      sender: fromAddress,
      contract: contractAddress,
      newAdmin: newAdmin,
    });

    const msg: MsgUpdateAdminEncodeObject = { typeUrl: MsgTypeUrls.UpdateAdmin, value: msgValue };

    setMsgGetter({ isMsgValid, msg });
  }, [chain.addressPrefix, chain.chainId, fromAddress, setMsgGetter, trimmedInputs]);

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
          value={newAdmin}
          onChange={({ target }) => {
            setNewAdmin(target.value);
            setNewAdminError("");
          }}
          error={codeIdError}
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
