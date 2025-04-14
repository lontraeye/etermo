// DropdownMenu.tsx
import React, { useState } from "react";
import { FaCog } from "react-icons/fa";
import "./DropdownMenu.css";

const DropdownMenu: React.FC = () => {
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
          <span>Difícil</span>
          <div className="SwitchRoot">
            <div className="SwitchThumb" />
          </div>
        </li>
      </ul>
    </div>
  );
};

export default DropdownMenu;