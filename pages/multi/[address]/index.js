import MultisigHoldings from "../../../components/dataViews/MultisigHoldings";
import MultisigMembers from "../../../components/dataViews/MultisigMembers";
import Page from "../../../components/layout/Page";
import StackableContainer from "../../../components/layout/StackableContainer";
import TransactionForm from "../../../components/forms/TransactionForm";
import TransactionList from "../../../components/dataViews/TransactionList";

export default () => {
  return (
    <Page>
      <StackableContainer base>
        <StackableContainer>
          <label>Multisig Address</label>
          <h1>cosmos1fjrzd7ycxzse05zme3r2zqwpsvcrskv80wj82h</h1>
        </StackableContainer>
        <div className="interfaces">
          <div className="col-1">
            <MultisigMembers />
            <TransactionList />
          </div>
          <div className="col-2">
            <MultisigHoldings />
            <TransactionForm />
          </div>
        </div>
      </StackableContainer>
      <style jsx>{`
        .interfaces {
          display: flex;
          justify-content: space-between;
          margin-top: 50px;
        }
        .col-1 {
          flex: 2;
          padding-right: 50px;
        }
        .col-2 {
          flex: 1;
        }
        label {
          font-size: 12px;
          font-style: italic;
        }
      `}</style>
    </Page>
  );
};
