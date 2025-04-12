import { useState, useEffect } from "react";
import "./App.css";
import GridRow from "./components/grid/GridRow";
import Keyboard from "./components/keyboard/Keyboard";
import { RowStatus } from "./Types";
import words from "./palavras-comuns.json";

function App() {
  const [values, setValues] = useState<string[][]>(
    Array(6).fill(null).map(() => Array(5).fill(""))
  );

  const [rowStatuses, setRowStatuses] = useState<RowStatus[]>(
    Array(6).fill("locked").map((_, i) => (i === 0 ? "active" : "locked"))
  );

  const [wordKey] = useState(words[0]);

  const [activeIndices, setActiveIndices] = useState<number[]>(
    Array(6).fill(0)
  );

  useEffect(() => {
    const firstInput = document.querySelector<HTMLInputElement>(".grid-input");
    firstInput?.focus();
  }, []);

  useEffect(() => {
    const handlePhysicalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        handleKeyPress("Backspace");
      } else if (e.key === "Enter") {
        handleKeyPress("Enter");
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toLowerCase());
      }
    };

    window.addEventListener("keydown", handlePhysicalKeyDown);
    return () => {
      window.removeEventListener("keydown", handlePhysicalKeyDown);
    };
  }, [values, rowStatuses, activeIndices]);

  const handleKeyPress = (key: string) => {
    const currentRowIndex = rowStatuses.findIndex(status => status === "active");
    if (currentRowIndex === -1) return;

    const currentRow = [...values[currentRowIndex]];
    const currentIndex = activeIndices[currentRowIndex];

    if (key === "Backspace") {
      if (currentRow[currentIndex]) {
        currentRow[currentIndex] = "";
      } else if (currentIndex > 0) {
        currentRow[currentIndex - 1] = "";
        updateActiveIndex(currentRowIndex, currentIndex - 1);
      }
    } else if (key === "Enter") {
      if (currentRow.every(cell => cell !== "")) {
        const newRowStatuses = [...rowStatuses];
        newRowStatuses[currentRowIndex] = "completed";
        if (currentRowIndex + 1 < rowStatuses.length) {
          newRowStatuses[currentRowIndex + 1] = "active";
        }
        setRowStatuses(newRowStatuses);
        updateActiveIndex(currentRowIndex + 1, 0);
      }
    } else if (key.length === 1) {
      if (currentIndex < currentRow.length) {
        currentRow[currentIndex] = key.toLowerCase();
        if (currentIndex < 4) {
          updateActiveIndex(currentRowIndex, currentIndex + 1);
        }
      }
    }

    const newValues = [...values];
    newValues[currentRowIndex] = currentRow;
    setValues(newValues);
  };

  const updateActiveIndex = (rowIndex: number, index: number) => {
    setActiveIndices(prev => {
      const updated = [...prev];
      updated[rowIndex] = index;
      return updated;
    });
  };

  return (
    <div className="grid-container">
      <h1>ETERMO</h1>
      {values.map((row, rowIndex) => (
        <GridRow
          key={rowIndex}
          row={row}
          rowIndex={rowIndex}
          values={values}
          setValues={setValues}
          wordKey={wordKey}
          status={rowStatuses[rowIndex]}
          setRowStatuses={setRowStatuses}
          activeIndex={activeIndices[rowIndex]}
          setActiveIndex={(index) => updateActiveIndex(rowIndex, index)}
        />
      ))}
      <Keyboard onKeyPress={handleKeyPress} />
    </div>
  );
}

export default App;