import React, { useEffect, useRef, useState } from "react";
import { normalizeWord, restoreAccents, compareWords } from "../../Utils"; // Importando as funções
import { RowStatus } from "../../Types"; // Importando o tipo RowStatus
import words from "../../words.json";

interface GridRowProps {
  row: string[];
  rowIndex: number;
  values: string[][];
  setValues: React.Dispatch<React.SetStateAction<string[][]>>;
  wordKey: string;
  status: RowStatus;
  setRowStatuses: React.Dispatch<React.SetStateAction<RowStatus[]>>;
  onWin: () => void;
  onGameOver: () => void;
}

const GridRow: React.FC<GridRowProps> = ({
  row,
  rowIndex,
  values,
  setValues,
  wordKey,
  status,
  setRowStatuses,
  onWin,
  onGameOver,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (status === "active") {
      const firstEmpty = values[rowIndex].findIndex((c) => c === "");
      setActiveIndex(firstEmpty === -1 ? row.length : firstEmpty);
    }
  }, [status, values, rowIndex]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (
      !/^[a-zA-Z]$/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Enter"
    ) {
      e.preventDefault();
      return;
    }

    setValues((prev) => {
      const updated = [...prev];
      const current = [...updated[rowIndex]];

      if (e.key === "Backspace") {
        let newIndex = activeIndex;

        if (activeIndex > 0 && !current[activeIndex]) {
          newIndex = activeIndex - 1;
        } else {
          newIndex = activeIndex;
        }

        current[newIndex] = "";
        updated[rowIndex] = current;
        setActiveIndex(newIndex);
      } else if (e.key === "Enter") {
        const word = current.join("").toLowerCase();
        if (current.every((c) => c !== "")) {
          const normalizedWord = normalizeWord(word);
          const validWords = words.map(normalizeWord);
          if (!validWords.includes(normalizedWord)) {
            if (containerRef.current) {
              containerRef.current.classList.add("shake");
              containerRef.current.addEventListener(
                "animationend",
                () => containerRef.current?.classList.remove("shake"),
                { once: true }
              );
            }
            return prev;
          }

          const colors = compareWords(word, wordKey);
          const wordWithAccents = restoreAccents(word, wordKey);
          updated[rowIndex] = wordWithAccents.split("");

          const allGreen: boolean = colors.every((c: string) => c === "green");
          const isLastRow = rowIndex === values.length - 1;

          setTimeout(() => {
            setRowStatuses((prevStatuses) => {
              const newStatuses = [...prevStatuses];
              newStatuses[rowIndex] = "completed";
              if (!allGreen && !isLastRow) {
                newStatuses[rowIndex + 1] = "active";
              }
              return newStatuses;
            });

            if (allGreen) {
              onWin();
            } else if (isLastRow) {
              onGameOver();
            }
          }, 200);

          return updated;
        }
      } else {
        if (activeIndex < row.length) {
          current[activeIndex] = e.key.toUpperCase();
          updated[rowIndex] = current;

          const nextIndex =
            activeIndex === row.length - 1 ? activeIndex : activeIndex + 1;

          setActiveIndex(nextIndex);
        }
      }

      return updated;
    });
  };

  useEffect(() => {
    if (status === "active") {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [status, activeIndex]);

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