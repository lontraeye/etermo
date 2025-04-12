import React, { useEffect, useRef } from "react";
import { RowStatus } from "../../Types";
import { compareWords } from "../../Utils";

interface GridRowProps {
  row: string[];
  rowIndex: number;
  values: string[][];
  setValues: React.Dispatch<React.SetStateAction<string[][]>>;
  wordKey: string;
  status: RowStatus;
  setRowStatuses: React.Dispatch<React.SetStateAction<RowStatus[]>>;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

const GridRow: React.FC<GridRowProps> = ({
  row,
  rowIndex,
  values,
  setValues,
  wordKey,
  status,
  setRowStatuses,
  activeIndex,
  setActiveIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (index: number) => {
    if (status === "active") {
      setActiveIndex(index);
    }
  };

  useEffect(() => {
    if (status === "active" && activeIndex === 0) {
      const firstEmpty = values[rowIndex].findIndex((c) => c === "");
      const fallbackIndex = firstEmpty === -1 ? row.length - 1 : firstEmpty;
      setActiveIndex(fallbackIndex);
    }
  }, [status, values, rowIndex]);

  return (
    <div
      ref={containerRef}
      className={`grid row-${rowIndex} ${
        status === "completed" ? "passed" : ""
      } ${status === "locked" ? "inactive" : ""}`}
    >
      {row.map((_, colIndex) => {
        const value = values[rowIndex][colIndex];
        let color = "";
        if (status !== "active") {
          const word = values[rowIndex].join("").toLowerCase();
          const colors = compareWords(word, wordKey);
          color = colors[colIndex];
        }

        return (
          <div
            key={colIndex}
            className={`grid-input ${color} ${
              activeIndex === colIndex && status === "active" ? "active" : ""
            }`}
            onClick={() => handleClick(colIndex)}
          >
            {value}
          </div>
        );
      })}
    </div>
  );
};

export default GridRow;