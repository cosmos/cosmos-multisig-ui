import React from "react";

import { printableCoin } from "../../lib/displayHelpers";
import StackableContainer from "../layout/StackableContainer";

const MultisigHoldings = (props) => {
  return (
    <StackableContainer lessPadding fullHeight>
      <h2>Holdings</h2>
      <StackableContainer lessPadding lessMargin>
        <span>{printableCoin(props.holdings)}</span>
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
