import "./App.css";
import { useRef, useEffect, useState, KeyboardEvent } from "react";

function App() {
  const inputsRef = useRef<HTMLInputElement[][]>([]);
  const [values, setValues] = useState<string[][]>(
    Array(6).fill(Array(5).fill(""))
  );
  const [activeRow, setActiveRow] = useState<number>(0);

  useEffect(() => {
    if (inputsRef.current[0] && inputsRef.current[0][0]) {
      inputsRef.current[0][0].focus();
    }
  }, []);

  const handleKeyDown = (
    rowIndex: number,
    colIndex: number,
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    const input = event.target as HTMLInputElement;

    if (
      !/^[a-zA-Z]$/.test(event.key) &&
      event.key !== "Backspace" &&
      event.key !== "Tab"
    ) {
      event.preventDefault();
      return;
    }

    if (event.key === "Backspace" && !input.value) {
      if (colIndex > 0) {
        const prevInput = inputsRef.current[rowIndex][colIndex - 1];
        prevInput?.focus();
        setValues((prevValues) => {
          const updatedValues = [...prevValues];
          updatedValues[rowIndex] = [...updatedValues[rowIndex]];
          updatedValues[rowIndex][colIndex - 1] = "";
          return updatedValues;
        });
      }
    }
  };

  return (
    <div className="grid-container">
      <h1>ETERMO</h1>
      {values.map((row, rowIndex) => (
        <div
          className={`grid ${rowIndex === activeRow ? "" : "inactive"}`}
          key={rowIndex}
        >
          {row.map((value, colIndex) => (
            <input
              key={colIndex}
              ref={(el) => {
                if (!inputsRef.current[rowIndex]) {
                  inputsRef.current[rowIndex] = [];
                }
                inputsRef.current[rowIndex][colIndex] = el!;
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

                if (colIndex < values[rowIndex].length - 1) {
                  const nextInput = inputsRef.current[rowIndex][colIndex + 1];
                  nextInput?.focus();
                }
              }}
              onKeyDown={(e) => handleKeyDown(rowIndex, colIndex, e)}
              onFocus={(e) => e.target.select()}
              disabled={rowIndex > activeRow}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default App;
