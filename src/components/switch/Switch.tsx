import React from "react";
import "./Switch.css";

interface SwitchProps {
  isOn: boolean;
  handleToggle: () => void;
  disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({ isOn, handleToggle, disabled = false }) => {
  return (
    <div className={`switch-container ${disabled ? "disabled" : ""}`}>
      <input
        checked={isOn}
        onChange={!disabled ? handleToggle : undefined}
        className="switch-checkbox"
        id="switch"
        type="checkbox"
        disabled={disabled}
      />
      <label 
        className={`switch-label ${disabled ? "disabled" : ""}`} 
        htmlFor="switch"
      >
        <span className="switch-button" />
      </label>
    </div>
  );
};

export default Switch;