import React from "react";
import Select from "react-select";

const StyledSelect = (props) => {
  const customStyles = {
    control: (provided, state) => ({
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
    option: (provided, state) => ({
      ...provided,
      background: state.isSelected ? "rgba(255, 255, 255, 0.2)" : "none",
      color: "white",
      cursor: "pointer",
      "&:hover": {
        background: "rgba(255, 255, 255, 0.2)",
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 10,
      borderRadius: "10px",
      background: "#561253",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "white",
    }),
    input: (provided) => ({
      ...provided,
      color: "white",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "rgba(255,255,255, 0.6)",
    }),
    dropdownIndicator: (provided) => ({
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
