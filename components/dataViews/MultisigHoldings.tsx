import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { useAppContext } from "../../context/AppContext";
import { printableCoin } from "../../lib/displayHelpers";
import StackableContainer from "../layout/StackableContainer";

interface Props {
  holdings: readonly Coin[];
}

const MultisigHoldings = (props: Props) => {
  const { state } = useAppContext();
  return (
    <StackableContainer lessPadding fullHeight>
      <h2>Holdings</h2>
      <StackableContainer lessPadding lessMargin>
        {props.holdings.length ? (
          props.holdings.map((holding) => (
            <StackableContainer key={holding.denom} lessPadding lessMargin>
              <span>{printableCoin(holding, state.chain)}</span>
            </StackableContainer>
          ))
        ) : (
          <span>None</span>
        )}
      </StackableContainer>
      <style jsx>{`
        span {
          text-align: center;
          overflow-wrap: break-word;
        }
      `}</style>
    </StackableContainer>
  );
};

export default MultisigHoldings;
