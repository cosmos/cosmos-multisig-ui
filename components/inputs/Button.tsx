import React from "react";

interface Props {
  primary?: boolean;
  disabled?: boolean;
  href?: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: () => any;
}
const Button = (props: Props) => (
  <>
    {props.href ? (
      <a className={props.primary ? "primary button" : "button"} href={props.href}>
        {props.label}
      </a>
    ) : (
      <button
        className={props.primary ? "primary button" : "button"}
        onClick={props.onClick}
        disabled={props.disabled}
      >
        {props.label}
      </button>
    )}
    <style jsx>{`
      .button {
        display: block;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.15);
        border: none;
        padding: 12px 0;
        font-size: 1rem;
        color: white;
        font-style: italic;
        margin-top: 20px;
        text-decoration: none;
        text-align: center;
      }
      .primary {
        border: 2px solid white;
      }

      button:first-child {
        margin-top: 0;
      }
      button:disabled {
        opacity: 0.5;
        cursor: initial;
      }
    `}</style>
  </>
);

export default Button;
