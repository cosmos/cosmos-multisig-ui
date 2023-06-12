interface Props {
  label?: string;
  type?: string;
  list?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: number | string | undefined;
  min?: string | number | undefined;
  checked?: boolean;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  width?: string;
}

const Input = (props: Props) => (
  <div className="text-input">
    <label>{props.label || ""}</label>
    <input
      type={props.type || "text"}
      list={props.list}
      name={props.name || "text-input"}
      onChange={props.onChange}
      value={props.value}
      checked={props.checked}
      min={props.type === "datetime-local" ? props.min : undefined}
      placeholder={props.placeholder || ""}
      autoComplete="off"
      onBlur={props.onBlur}
      disabled={props.disabled}
    />
    {props.error && <div className="error">{props.error}</div>}
    <style jsx>{`
      .text-input {
        width: ${props.width ? props.width : "auto"};
        display: flex;
        flex-direction: ${props.type === "checkbox" ? "row" : "column"};
        gap: ${props.type === "checkbox" ? "8px" : 0};
      }

      label {
        font-style: italic;
        font-size: 12px;
        margin-bottom: ${props.type === "checkbox" ? 0 : "1em"};
      }

      input {
        background: #722d6f;
        border: 2px solid rgba(255, 255, 255, 0.5);
        box-sizing: border-box;
        border-radius: 9px;

        color: white;
        padding: 10px 5px;
      }

      input:hover,
      input:focus {
        border-color: rgba(255, 255, 255, 1);
      }

      input::placeholder {
        color: rgba(255, 255, 255, 0.3);
      }
      input[type="datetime-local"]::-webkit-calendar-picker-indicator {
        cursor: pointer;
        opacity: 0.6;
        filter: invert(0.8);
      }
      input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
        opacity: 1;
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
