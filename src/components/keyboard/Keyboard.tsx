import React from "react";
import { FaBackspace } from "react-icons/fa";
import "./Keyboard.css";

const keys = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Backspace"],
  ["Z", "X", "C", "V", "B", "N", "M", "Enter"],
];

interface KeyboardProps {
  onKeyPress: (key: string) => void;
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress }) => {
  return (
    <div className="keyboard">
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => (
            <button
              key={key}
              className={`keyboard-key ${
                key === "Enter" || key === "Backspace" ? "special" : ""
              }`}
              onClick={() => onKeyPress(key)}
            >
              {key === "Backspace" ? <FaBackspace /> : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
