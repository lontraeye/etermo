import React, { KeyboardEvent, useRef, useEffect } from "react";

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

  useEffect(() => {
    if (rowIndex === activeRow) {
      const firstInput = inputsRef.current[0];
      firstInput?.focus();
    }
  }, [activeRow, rowIndex]);

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
      if (values[rowIndex].every((char) => char !== "")) {
        setActiveRow((prevActiveRow) => prevActiveRow + 1);
      }
    }
  };

  return (
    <div className={`grid ${rowIndex === activeRow ? "" : "inactive"}`}>
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
          disabled={rowIndex > activeRow}
        />
      ))}
    </div>
  );
};

export default GridRow;