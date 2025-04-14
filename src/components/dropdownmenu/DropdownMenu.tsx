import React, { useState } from "react";
import { FaCog } from "react-icons/fa";
import Switch from "../switch/Switch";
import "./DropdownMenu.css";

interface DropdownMenuProps {
  isHardMode: boolean;
  onHardModeToggle: () => void;
  disabled?: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ 
  isHardMode, 
  onHardModeToggle,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown-menu">
      <button
        className={`menu-button ${isOpen ? "active" : ""}`}
        onClick={toggleMenu}
      >
        <FaCog size={20} />
      </button>
      <ul className={`menu-list ${isOpen ? "open" : ""}`}>
        <li className="menu-item">
          <span>Modo Difícil</span>
          <Switch 
            isOn={isHardMode} 
            handleToggle={disabled ? () => {} : onHardModeToggle} 
            disabled={disabled}
          />
        </li>
      </ul>
    </div>
  );
};

export default DropdownMenu;