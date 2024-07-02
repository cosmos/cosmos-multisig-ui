import { printVoteOption, voteOptions } from "@/lib/gov";
import { MsgVoteEncodeObject } from "@cosmjs/stargate";
import { longify } from "@cosmjs/stargate/build/queryclient";
import { voteOptionFromJSON } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { trimStringsObj } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import Select from "../../../inputs/Select";
import StackableContainer from "../../../layout/StackableContainer";

const selectVoteOptions = voteOptions.map((opt) => {
  const voteOptionObj = voteOptionFromJSON(opt);

  return {
    label: printVoteOption(voteOptionObj),
    value: voteOptionObj,
  };
});

interface MsgVoteFormProps {
  readonly fromAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgVoteForm = ({ fromAddress, setMsgGetter, deleteMsg }: MsgVoteFormProps) => {
  const [proposalId, setProposalId] = useState("0");
  const [selectedVote, setSelectedVote] = useState(selectVoteOptions[0]);

  const [proposalIdError, setProposalIdError] = useState("");

  const trimmedInputs = trimStringsObj({ proposalId });

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { proposalId } = trimmedInputs;

    const isMsgValid = (): boolean => {
      setProposalIdError("");

      if (!proposalId || Number(proposalId) <= 0 || !Number.isSafeInteger(Number(proposalId))) {
        setProposalIdError("Proposal ID must be an integer greater than 0");
        return false;
      }

      try {
        longify(proposalId);
      } catch (e: unknown) {
        setProposalIdError(e instanceof Error ? e.message : "Proposal ID is not a valid Big Int");
        return false;
      }

      return true;
    };

    const proposalIdBigInt = (() => {
      try {
        return longify(proposalId);
      } catch {
        return 0n;
      }
    })();

    const msgValue = MsgCodecs[MsgTypeUrls.Vote].fromPartial({
      voter: fromAddress,
      proposalId: proposalIdBigInt,
      option: selectedVote.value,
    });

    const msg: MsgVoteEncodeObject = { typeUrl: MsgTypeUrls.Vote, value: msgValue };

    setMsgGetter({ isMsgValid, msg });
  }, [fromAddress, selectedVote.value, setMsgGetter, trimmedInputs]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgVote</h2>
      <div className="form-item">
        <Input
          type="number"
          label="Proposal ID"
          name="proposal-id"
          value={proposalId}
          onChange={({ target }) => {
            setProposalId(target.value);
            setProposalIdError("");
          }}
          error={proposalIdError}
        />
      </div>
      <div className="form-item form-select">
        <label>Choose a vote:</label>
        <Select
          label="Select vote"
          name="vote-select"
          options={selectVoteOptions}
          value={selectedVote}
          onChange={(option: (typeof selectVoteOptions)[number]) => {
            setSelectedVote(option);
          }}
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

export default MsgVoteForm;
