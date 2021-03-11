const Input = (props) => (
  <div className="text-input">
    <label>{props.label || ""}</label>
    <input
      type={props.type || "text"}
      name={props.name || "text-input"}
      onChange={props.onChange}
      value={props.value}
      placeholder={props.placeholder || ""}
      autoComplete="off"
      onBlur={props.onBlur}
    />
    {props.error && <div className="error">{props.error}</div>}
    <style jsx>{`
      .text-input {
        display: flex;
        flex-direction: column;
        width: ${props.width ? props.width : ""};
      }

      label {
        font-style: italic;
        font-size: 12px;
        margin-bottom: 1em;
      }

      input {
        background: #722d6f;
        border: 2px solid #ffffff;
        box-sizing: border-box;
        border-radius: 9px;

        color: white;
        padding: 10px 5px;
      }

      input::placeholder {
        color: rgba(255, 255, 255, 0.3);
      }
      .error {
        font-size: 12px;
        color: coral;
        margin-top: 5px;
      }
    `}</style>
  </div>
);

export default Input;
