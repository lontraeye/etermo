import React from "react";
import { FaBackspace } from "react-icons/fa";
import "./Keyboard.css";
import { normalizeWord } from "../../Utils";

const keys = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Backspace"],
  ["Z", "X", "C", "V", "B", "N", "M", "Enter"],
];

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  absentLetters?: string[];
  correctLetters?: string[];
  presentLetters?: string[];
  isHardMode?: boolean;
}

const Keyboard: React.FC<KeyboardProps> = ({ 
  onKeyPress, 
  absentLetters = [], 
  correctLetters = [],
  presentLetters = [],
  isHardMode = false 
}) => {
  return (
    <div className="keyboard">
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => {
            const normalizedKey = normalizeWord(key);
            const isAbsent = isHardMode && absentLetters.includes(normalizedKey);
            const isCorrect = correctLetters.includes(normalizedKey);
            const isPresent = presentLetters.includes(normalizedKey);
            const isSpecialKey = key === "Enter" || key === "Backspace";
            
            return (
              <button
                key={key}
                className={`keyboard-key ${
                  isSpecialKey ? "special" : ""
                } ${isAbsent ? "absent" : ""} ${
                  isCorrect ? "correct" : ""
                } ${isPresent ? "present" : ""}`}
                onClick={() => onKeyPress(key)}
                disabled={isAbsent}
                aria-disabled={isAbsent}
              >
                {key === "Backspace" ? <FaBackspace /> : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;