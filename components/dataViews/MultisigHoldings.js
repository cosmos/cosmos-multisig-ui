import StackableContainer from "../layout/StackableContainer";

export default (props) => (
  <StackableContainer lessPadding>
    <h2>Holdings</h2>
    <StackableContainer lessPadding lessMargin>
      <span>1,021,010 ATOM</span>
    </StackableContainer>
    <style jsx>{`
      span {
        text-align: center;
      }
    `}</style>
  </StackableContainer>
);
