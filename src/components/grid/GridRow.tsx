import React, { useEffect, useRef } from "react";
import { RowStatus } from "../../Types";
import { restoreAccents, compareWords } from "../../Utils";
import "./GridRow.css";

interface GridRowProps {
  row: string[];
  rowIndex: number;
  values: string[][];
  wordKey: string;
  status: RowStatus;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  isShaking: boolean;
  onRestoreAccents?: (rowIndex: number, restoredWord: string) => void;
}

const GridRow: React.FC<GridRowProps> = ({
  row,
  rowIndex,
  values,
  wordKey,
  status,
  activeIndex,
  setActiveIndex,
  isShaking,
  onRestoreAccents,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isShaking && containerRef.current) {
      const el = containerRef.current;
      el.classList.remove("shake");
      void el.offsetWidth;
      el.classList.add("shake");
      const handleAnimationEnd = () => el.classList.remove("shake");
      el.addEventListener('animationend', handleAnimationEnd, { once: true });
      return () => el.removeEventListener('animationend', handleAnimationEnd);
    }
  }, [isShaking]);

  useEffect(() => {
    if (status === "completed") {
      const currentWord = values[rowIndex].join("");
      const restoredWord = restoreAccents(currentWord, wordKey);
      
      if (restoredWord !== currentWord && onRestoreAccents) {
        onRestoreAccents(rowIndex, restoredWord);
      }
    }
  }, [status, values, wordKey, rowIndex, onRestoreAccents]);

  const handleClick = (index: number) => {
    if (status === "active") {
      setActiveIndex(index);
    }
  };

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