import { useState, useEffect } from "react";
import "./App.css";
import GridRow from "./components/grid/GridRow";
import Keyboard from "./components/keyboard/Keyboard";
import words from "./palavras-comuns.json";

type RowStatus = "active" | "completed" | "locked";

function App() {
  const [values, setValues] = useState<string[][]>(
    Array(6).fill(null).map(() => Array(5).fill(""))
  );

  const [rowStatuses, setRowStatuses] = useState<RowStatus[]>(
    Array(6).fill("locked").map((_, i) => (i === 0 ? "active" : "locked"))
  );

  const [shuffledWords, setShuffledWords] = useState(() => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled;
  });

  const [wordKey, setWordKey] = useState(shuffledWords[0]);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [showRetryButton, setShowRetryButton] = useState(false);

  console.log(`Palavra-chave: ${wordKey}`);

  useEffect(() => {
    const firstInput = document.querySelector<HTMLInputElement>(".grid-input");
    firstInput?.focus();
  }, []);

  const resetGame = () => {
    const newShuffledWords = [...words].sort(() => Math.random() - 0.5);
    setShuffledWords(newShuffledWords);
    setWordKey(newShuffledWords[0]);
    setValues(Array(6).fill(null).map(() => Array(5).fill("")));
    setRowStatuses(Array(6).fill("locked").map((_, i) => (i === 0 ? "active" : "locked")));
    setShowContinueButton(false);
    setShowRetryButton(false);

    const inputs = document.querySelectorAll(".grid-input");
    inputs.forEach((input) => {
      input.classList.remove("green", "yellow", "gray");
    });

    setTimeout(() => {
      const firstInput = document.querySelector<HTMLInputElement>(".grid-input");
      firstInput?.focus();
    }, 0);
  };

  const handleWin = () => {
    setShowContinueButton(true);
  };

  const handleGameOver = () => {
    setShowRetryButton(true);
  };

  const handleKeyPress = (key: string) => {
    console.log("Tecla pressionada:", key);
    // Adicione lógica para lidar com a tecla pressionada
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
          onWin={handleWin}
          onGameOver={handleGameOver}
        />
      ))}
      <Keyboard onKeyPress={handleKeyPress} />
      {showContinueButton && (
        <button onClick={resetGame} className="continue-button">
          Continuar?
        </button>
      )}
      {showRetryButton && (
        <button onClick={resetGame} className="retry-button">
          Tentar novamente
        </button>
      )}
    </div>
  );
}

export default App;