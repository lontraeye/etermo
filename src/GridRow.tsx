import React, { KeyboardEvent, useRef, useEffect } from "react";
import words from "./words.json";

interface GridRowProps {
  row: string[];
  rowIndex: number;
  activeRow: number;
  setActiveRow: React.Dispatch<React.SetStateAction<number>>;
  values: string[][];
  setValues: React.Dispatch<React.SetStateAction<string[][]>>;
}

const GridRow: React.FC<GridRowProps> = ({
  row,
  rowIndex,
  activeRow,
  setActiveRow,
  values,
  setValues,
}) => {
  const inputsRef = useRef<HTMLInputElement[]>([]);

  const wordKey = "altas";

  useEffect(() => {
    if (rowIndex === activeRow) {
      const firstInput = inputsRef.current[0];
      firstInput?.focus();
    }
  }, [activeRow, rowIndex]);

  const compareWords = (typedWord: string, keyWord: string): string[] => {
    const colors: string[] = Array(typedWord.length).fill("");
    const keyLetterCounts: Record<string, number> = {};

    for (const char of keyWord) {
      keyLetterCounts[char] = (keyLetterCounts[char] || 0) + 1;
    }

    for (let i = 0; i < typedWord.length; i++) {
      if (typedWord[i] === keyWord[i]) {
        colors[i] = "green";
        keyLetterCounts[typedWord[i]]--;
      }
    }

    for (let i = 0; i < typedWord.length; i++) {
      if (colors[i] === "" && keyWord.includes(typedWord[i]) && keyLetterCounts[typedWord[i]] > 0) {
        colors[i] = "yellow";
        keyLetterCounts[typedWord[i]]--;
      }
    }

    for (let i = 0; i < typedWord.length; i++) {
      if (colors[i] === "") {
        colors[i] = "gray";
      }
    }

    return colors;
  };

  const handleKeyDown = (
    colIndex: number,
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    const input = event.target as HTMLInputElement;

    if (
      !/^[a-zA-Z]$/.test(event.key) &&
      event.key !== "Backspace" &&
      event.key !== "Tab" &&
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
          const updatedValues = [...prevValues];
          updatedValues[rowIndex] = [...updatedValues[rowIndex]];
          updatedValues[rowIndex][colIndex - 1] = "";
          return updatedValues;
        });
      }
    }

    if (event.key === "Enter" && rowIndex === activeRow) {
      const currentWord = values[rowIndex].join("").toLowerCase();
      if (values[rowIndex].every((char) => char !== "")) {
        if (!words.includes(currentWord)) {
          inputsRef.current.forEach((input) => {
            input.classList.add("shake");
          });
          setTimeout(() => {
            inputsRef.current.forEach((input) => {
              input.classList.remove("shake");
            });
          }, 300);
        } else {
          const colors = compareWords(currentWord, wordKey);

          for (let i = 0; i < colors.length; i++) {
            const input = inputsRef.current[i];
            if (input) {
              input.classList.remove("green", "yellow", "gray");
              if (colors[i] === "green") {
                input.classList.add("green");
              } else if (colors[i] === "yellow") {
                input.classList.add("yellow");
              } else if (colors[i] === "gray") {
                input.classList.add("gray");
              }
            }
          }

          setActiveRow((prevActiveRow) => prevActiveRow + 1);
        }
      }
    }
  };

  return (
    <div
      className={`grid ${rowIndex < activeRow ? "passed" : ""} ${
        rowIndex > activeRow ? "inactive" : ""
      }`}
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
            const newValue = e.target.value.toUpperCase();
            setValues((prevValues) => {
              const updatedValues = [...prevValues];
              updatedValues[rowIndex] = [...updatedValues[rowIndex]];
              updatedValues[rowIndex][colIndex] = newValue;
              return updatedValues;
            });

            if (colIndex < row.length - 1) {
              const nextInput = inputsRef.current[colIndex + 1];
              nextInput?.focus();
            }
          }}
          onKeyDown={(e) => handleKeyDown(colIndex, e)}
          onFocus={(e) => e.target.select()}
          disabled={rowIndex !== activeRow}
        />
      ))}
    </div>
  );
};

export default GridRow;