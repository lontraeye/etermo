// DropdownMenu.tsx
import React, { useState } from "react";
import { FaCog } from "react-icons/fa";
import * as Switch from '@radix-ui/react-switch';
import './DropdownMenu.css';

const DropdownMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHardMode, setIsHardMode] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="dropdown-menu">
      <button className={`menu-button ${isOpen ? "active" : ""}`} onClick={toggleMenu}>
        <FaCog size={20} />
      </button>
      {isOpen && (
        <ul className="menu-list">
          <li className="menu-item">
            <span>Difícil</span>
            <Switch.Root
              className="SwitchRoot"
              checked={isHardMode}
              onCheckedChange={setIsHardMode}
            >
              <Switch.Thumb className="SwitchThumb" />
            </Switch.Root>
          </li>
        </ul>
      )}
    </div>
  );
};

export default DropdownMenu;