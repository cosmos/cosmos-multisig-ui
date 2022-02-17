import React from "react";

import { useAppContext } from "../../context/AppContext";
import { printableCoin } from "../../lib/displayHelpers";
import StackableContainer from "../layout/StackableContainer";

const MultisigHoldings = (props) => {
  const { state } = useAppContext();
  return (
    <StackableContainer lessPadding fullHeight>
      <h2>Holdings</h2>
      <StackableContainer lessPadding lessMargin>
        <span>{printableCoin(props.holdings, state.chain)}</span>
      </StackableContainer>
      <style jsx>{`
        span {
          text-align: center;
        }
      `}</style>
    </StackableContainer>
  );
};

export default MultisigHoldings;
