import React from "react";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";

import { useAppContext } from "../../context/AppContext";
import { printableCoin } from "../../lib/displayHelpers";
import StackableContainer from "../layout/StackableContainer";

interface Props {
  holdings: Coin | null;
}

const MultisigHoldings = (props: Props) => {
  const { state } = useAppContext();
  return (
    <StackableContainer lessPadding fullHeight>
      <h2>Holdings</h2>
      <StackableContainer lessPadding lessMargin>
        {props.holdings ? (
          <span>{printableCoin(props.holdings, state.chain)}</span>
        ) : (
          <span>None</span>
        )}
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
