export default (props) => (
  <>
    <button className={props.primary ? "primary" : ""} onClick={props.onClick}>
      {props.label}
    </button>
    <style jsx>{`
      button {
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.15);
        border: none;
        padding: 12px 0;
        font-size: 1rem;
        color: white;
        font-style: italic;
        margin-top: 20px;
      }
      .primary {
        border: 2px solid white;
      }

      button:first-child {
        margin-top: 0;
      }
    `}</style>
  </>
);
