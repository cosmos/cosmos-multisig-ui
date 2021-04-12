import StackableContainer from "../layout/StackableContainer";

export default (props) => {
  const uatomToAtom = (uatom) => {
    if (uatom === 0) return 0;
    return uatom / 1000000;
  };

  return (
    <StackableContainer lessPadding>
      <h2>Holdings</h2>
      <StackableContainer lessPadding lessMargin>
        <span>{props.holdings} ATOM</span>
      </StackableContainer>
      <style jsx>{`
        span {
          text-align: center;
        }
      `}</style>
    </StackableContainer>
  );
};
