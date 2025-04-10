import React, { useEffect, useRef } from "react";
import words from "./words.json";

type RowStatus = "active" | "completed" | "locked";

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
  const inputsRef = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (status === "active") {
      const firstInput = inputsRef.current[0];
      firstInput?.focus();
    }
  }, [status]);

  const compareWords = (typedWord: string, keyWord: string): string[] => {
    const colors = Array(typedWord.length).fill("");
    const letterCount: Record<string, number> = {};

    for (const letter of keyWord) {
      letterCount[letter] = (letterCount[letter] || 0) + 1;
    }

    for (let i = 0; i < typedWord.length; i++) {
      if (typedWord[i] === keyWord[i]) {
        colors[i] = "green";
        letterCount[typedWord[i]]--;
      }
    }

    for (let i = 0; i < typedWord.length; i++) {
      if (
        colors[i] === "" &&
        keyWord.includes(typedWord[i]) &&
        letterCount[typedWord[i]] > 0
      ) {
        colors[i] = "yellow";
        letterCount[typedWord[i]]--;
      }
    }

    return colors;
  };

  const handleKeyDown = (colIndex: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    const input = event.target as HTMLInputElement;

    if (
      !/^[a-zA-Z]$/.test(event.key) &&
      event.key !== "Backspace" &&
      event.key !== "Enter"
    ) {
      event.preventDefault();
      return;
    }

    if (event.key === "Backspace" && !input.value) {
      if (colIndex > 0) {
        const prevInput = inputsRef.current[colIndex - 1];
        prevInput?.focus();
        setValues((prevValues) => {
          const updated = [...prevValues];
          updated[rowIndex] = [...updated[rowIndex]];
          updated[rowIndex][colIndex - 1] = "";
          return updated;
        });
      }
    }

    if (event.key === "Enter") {
      const word = values[rowIndex].join("").toLowerCase();
      if (values[rowIndex].every((char) => char !== "")) {
        if (!words.includes(word)) {
          inputsRef.current.forEach((input) => {
            input?.classList.add("shake");
            input?.addEventListener("animationend", () => {
              input.classList.remove("shake");
            }, { once: true });
          });
          return;
        }
    
        const colors = compareWords(word, wordKey);

        colors.forEach((color, i) => {
          const input = inputsRef.current[i];
          if (input) {
            input.classList.remove("green", "yellow", "gray");
            input.classList.add(color || "gray");
          }
        });

        if (colors.every((color) => color === "green")) {
          setRowStatuses((prev) => {
            const updated = [...prev];
            updated[rowIndex] = "completed";
            return updated;
          });
          onWin();
          return;
        }

        if (rowIndex === values.length - 1) {
          setRowStatuses((prev) => {
            const updated = [...prev];
            updated[rowIndex] = "completed";
            return updated;
          });
          onGameOver();
          return;
        }

        // Atualiza o status da linha atual e ativa a próxima
        setRowStatuses((prev) => {
          const updated = [...prev];
          updated[rowIndex] = "completed";
          if (rowIndex + 1 < updated.length) {
            updated[rowIndex + 1] = "active";
          }
          return updated;
        });
      }
    }
  };

  return (
    <div
      className={`grid row-${rowIndex} ${
        status === "completed" ? "passed" : ""
      } ${status === "locked" ? "inactive" : ""}`}
    >
      {row.map((value, colIndex) => (
        <input
          key={colIndex}
          ref={(el) => {
            inputsRef.current[colIndex] = el!;
          }}
          className="grid-input"
          type="text"
          maxLength={1}
          value={value}
          onChange={(e) => {
            const val = e.target.value.toUpperCase();
            setValues((prev) => {
              const updated = [...prev];
              updated[rowIndex] = [...updated[rowIndex]];
              updated[rowIndex][colIndex] = val;
              return updated;
            });
            if (colIndex < row.length - 1) {
              const nextInput = inputsRef.current[colIndex + 1];
              nextInput?.focus();
            }
          }}
          onKeyDown={(e) => handleKeyDown(colIndex, e)}
          onFocus={(e) => e.target.select()}
          disabled={status !== "active"}
        />
      ))}
    </div>
  );
};

export default GridRow;
