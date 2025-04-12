import React from "react";
import "./Cell.css"; // CSS para estilo das células

interface CellProps {
  letter: string;
  color: string;
  isActive: boolean;
  onClick: () => void;
}

const Cell: React.FC<CellProps> = ({ letter, color, isActive, onClick }) => {
  return (
    <div
      className={`cell ${color} ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {letter}
    </div>
  );
};

export default Cell;