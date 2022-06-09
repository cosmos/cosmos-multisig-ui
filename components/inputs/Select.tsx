import React, { CSSProperties } from "react";
import Select, { ControlProps } from "react-select";

const StyledSelect = (props: any) => {
  const customStyles = {
    control: (provided: CSSProperties, state: ControlProps) => ({
      ...provided,
      borderRadius: "10px",
      background: "none",
      borderColor: state.isFocused ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.5)",
      borderWidth: "2px",
      boxShadow: "none",
      cursor: "pointer",
      color: "white",
      "&:hover": {
        borderColor: "rgba(255, 255, 255, 1)",
      },
    }),
    option: (provided: CSSProperties, state: any) => ({
      ...provided,
      background: state.isSelected ? "rgba(255, 255, 255, 0.2)" : "none",
      color: "white",
      cursor: "pointer",
      "&:hover": {
        background: "rgba(255, 255, 255, 0.2)",
      },
    }),
    menu: (provided: CSSProperties) => ({
      ...provided,
      zIndex: 10,
      borderRadius: "10px",
      background: "#561253",
    }),
    singleValue: (provided: CSSProperties) => ({
      ...provided,
      color: "white",
    }),
    input: (provided: CSSProperties) => ({
      ...provided,
      color: "white",
    }),
    placeholder: (provided: CSSProperties) => ({
      ...provided,
      color: "rgba(255,255,255, 0.6)",
    }),
    dropdownIndicator: (provided: CSSProperties) => ({
      ...provided,
      color: "rgba(255, 255, 255, 0.6)",
      "&:hover": {
        color: "rgba(255, 255, 255, 1)",
      },
    }),
  };

  return <Select {...props} styles={customStyles} />;
};

export default StyledSelect;
