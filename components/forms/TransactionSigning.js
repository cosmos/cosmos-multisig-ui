import axios from "axios";
import React from "react";

import Button from "../inputs/Button";
import StackableContainer from "../layout/StackableContainer";

export default class TransactionSigning extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      transaction: this.props.transaction,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.transaction && this.props.transaction) {
      this.setState({ transaction: this.props.transaction });
      console.log(JSON.parse(this.props.transaction.signatures));
    }
  }

  handleBroadcast = async () => {
    this.setState({ processing: true });
    const res = await axios.get(
      `/api/transaction/${this.state.transaction.uuid}/broadcast`
    );

    this.setState({
      transaction: res.data,
      processing: false,
    });
  };

  clickFileUpload = () => {
    this.fileInput.current.click();
  };

  render() {
    return (
      <StackableContainer lessPadding>
        <h2>Signatures</h2>
        {!this.state.signatures && (
          <StackableContainer lessPadding lessMargin lessRadius>
            <p>No signatures yet</p>
          </StackableContainer>
        )}
        <Button label="Sign this Transaction" />
        <style jsx>{`
          p {
            text-align: center;
            max-width: none;
          }
        `}</style>
      </StackableContainer>
    );
  }
}
