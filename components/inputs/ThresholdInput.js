export default (props) => (
  <>
    <p>Signatures required to send a transaction</p>
    <div className="threshold-group">
      <input
        type="number"
        name="threshold"
        onChange={props.onChange}
        value={props.value}
        autoComplete="off"
      />
      <div className="between">of</div>
      <div className="total">{props.total}</div>
    </div>
    <style jsx>{`
      .threshold-group {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .threshold-group * {
        width: 30%;
        text-align: center;
        font-size: 24px;
      }
      input {
        background: #722d6f;
        border: 2px solid #ffffff;
        box-sizing: border-box;
        border-radius: 9px;

        color: white;
        padding: 10px 5px 10px 20px;
      }
      .threshold-group .between {
        width: 15%
      }
      .threshold-group .total {
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.1)
        box-sizing: border-box;
        border-radius: 9px;

        color: white;
        padding: 10px 5px;
      }
      p {
        text-align: center;
        margin-bottom: 1em;
      }
    `}</style>
  </>
);
