import React, { useState, useEffect } from "react";
import "./App.css";
import GridRow from "./GridRow";
import words from "./palavras-comuns.json";

function App() {
  const [values, setValues] = useState<string[][]>(
    Array(6).fill(Array(5).fill(""))
  );
  const [activeRow, setActiveRow] = useState<number>(0);

  const [shuffledWords, setShuffledWords] = useState(() => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled;
  });

  const [wordKey, setWordKey] = useState(shuffledWords[0]);

  console.log(`Palavra-chave: ${wordKey}`);

  useEffect(() => {
    const firstInput = document.querySelector<HTMLInputElement>(".grid-input");
    firstInput?.focus();
  }, []);

  const resetGame = () => {
    const newShuffledWords = [...words].sort(() => Math.random() - 0.5);
    setShuffledWords(newShuffledWords);
    setWordKey(newShuffledWords[0]);
    setValues(Array(6).fill(Array(5).fill("")));
    setActiveRow(0);

    const inputs = document.querySelectorAll(".grid-input");
    inputs.forEach((input) => {
      input.classList.remove("green", "yellow", "gray");
    });

    setTimeout(() => {
      const firstInput = document.querySelector<HTMLInputElement>(".grid-input");
      firstInput?.focus();
    }, 0);
  };

  return (
    <div className="grid-container">
      <h1>ETERMO</h1>
      {values.map((row, rowIndex) => (
        <GridRow
          key={rowIndex}
          row={row}
          rowIndex={rowIndex}
          activeRow={activeRow}
          setActiveRow={setActiveRow}
          values={values}
          setValues={setValues}
          wordKey={wordKey}
          resetGame={resetGame}
        />
      ))}
    </div>
  );
}

export default App;
