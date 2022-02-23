import React, { useState, useEffect } from "react";

import { useAppContext } from "../../context/AppContext";
import Input from "../../components/inputs/Input";
import Select from "../../components/inputs/Select";
import { checkAddress, exampleAddress } from "../../lib/displayHelpers";

// https://docs.cosmos.network/v0.44/core/proto-docs.html#cosmos.gov.v1beta1.VoteOption
const voteOptions = [
  { label: "Unspecified", value: 0 },
  { label: "Yes", value: 1 },
  { label: "Abstain", value: 2 },
  { label: "No", value: 3 },
  { label: "No With Veto", value: 4 },
];

const MsgVote = (props) => {
  const onMsgChange = props.onMsgChange || (() => {});
  const onCheck = props.onCheck || (() => {});
  const { state } = useAppContext();
  const [voterError, setVoterError] = useState("");

  // const [amountError, setAmountError] = useState("");

  function checkMsg(m, updateInternalErrors) {
    if (!m) return false;
    if (!m.typeUrl) return false;
    if (!m.value) return false;

    const v = m.value;
    if (!v.proposalId) return false;
    if (!v.voter) return false;

    const toVoterError = checkAddress(v.voter, state.chain.addressPrefix);
    if (updateInternalErrors) {
      if (toVoterError) {
        const errorMsg = `Invalid voter address for network ${state.chain.chainId}: ${toVoterError}`;
        setVoterError(errorMsg);
      } else {
        setVoterError("");
      }
    }

    return true;
  }

  useEffect(() => {
    onCheck(checkMsg(props.msg, false));
  }, []);

  function checkAndSetDecision(decision) {
    const newMsg = JSON.parse(JSON.stringify(props.msg));
    newMsg.value.option = decision;
    onMsgChange(newMsg);
    onCheck(checkMsg(newMsg, true));
  }

  function checkAndSetProposalId(proposalId) {
    const newMsg = JSON.parse(JSON.stringify(props.msg));
    newMsg.value.proposalId = proposalId;
    onMsgChange(newMsg);
    onCheck(checkMsg(newMsg, true));
  }

  return (
    <div>
      <h2>Vote on Proposal</h2>
      <div className="form-item">
        <Input
          label="Voter"
          name="voter"
          value={props.msg.value.voter}
          disabled={true}
          error={voterError}
        />
      </div>
      <div className="form-item">
        <Input
          label="Proposal ID"
          name="proposalId"
          type="number"
          value={props.msg.value.proposalId}
          onChange={(e) => checkAndSetProposalId(e.target.value)}
        />
      </div>
      <div className="form-item">
        <Select
          label={`Decision`}
          name="option"
          options={voteOptions}
          value={voteOptions[props.msg.value.option]}
          onChange={(opt) => checkAndSetDecision(opt.value)}
        />
      </div>
      <style jsx>{`
        p {
          margin-top: 15px;
        }
        .form-item {
          margin-top: 1.5em;
        }
      `}</style>
    </div>
  );
};

export default MsgVote;
