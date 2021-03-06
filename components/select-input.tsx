import React from "react";

import general from "./general.module.css";

function optionsJsx(options: string[]): React.ReactNode {
  return options.map((option) => {
    return (
      <option value={option}
          key={option}>{option}</option>
    );
  });
}

function SelectInput(props): React.ReactElement {
  const selectHandler = (e): void => {
    props.selectCallback(e.target.value);
  };

  return (
    <div className={general.horizWrapper}>
      <div className={general.horizWrapper + ' ' + general.spacer}>
        {props.label}
        <select className={general.settingsInput}
            value={props.selected}
            onChange={selectHandler}>
          {optionsJsx(props.options)}
        </select>
      </div>
    </div>
  );
}

export default SelectInput;
