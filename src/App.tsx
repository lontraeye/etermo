import { useState, useEffect } from "react";
import "./App.css";
import GridRow from "./components/grid/GridRow";
import Keyboard from "./components/keyboard/Keyboard";
import { RowStatus } from "./Types";
import comuns from "./palavras-comuns.json";
import words from "./words.json";
import { normalizeWord, restoreAccents } from "./Utils";

function App() {
  const [values, setValues] = useState<string[][]>(
    Array(6).fill(null).map(() => Array(5).fill(""))
  );

  const [rowStatuses, setRowStatuses] = useState<RowStatus[]>(
    Array(6).fill("locked").map((_, i) => (i === 0 ? "active" : "locked"))
  );

  const [wordKey] = useState(comuns[0]);
  const [activeIndices, setActiveIndices] = useState<number[]>(Array(6).fill(0));
  const [shakingRowIndex, setShakingRowIndex] = useState<number | null>(null);

  console.log("Palavra chave:", wordKey);

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
      } else if (/^[a-zA-ZÀ-ÖØ-öø-ÿ]$/.test(e.key)) { // Aceita caracteres acentuados
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
        const word = currentRow.join("");
        const normalizedWord = normalizeWord(word);

        // Verifica se a palavra existe no dicionário (com ou sem acento)
        const validWords = [...words, ...comuns].map(w => normalizeWord(w));
        if (!validWords.includes(normalizedWord)) {
          triggerShakeAnimation(currentRowIndex);
          return;
        }

        // Restaura os acentos corretos antes de marcar como completada
        const wordWithAccents = restoreAccents(word, wordKey);
        const newRow = wordWithAccents.split("");

        // Atualiza os valores com a versão correta dos acentos
        setValues(prev => {
          const newValues = [...prev];
          newValues[currentRowIndex] = newRow;
          return newValues;
        });

        // Marca a linha como completada e ativa a próxima
        setRowStatuses(prev => {
          const newRowStatuses = [...prev];
          newRowStatuses[currentRowIndex] = "completed";
          if (currentRowIndex + 1 < prev.length) {
            newRowStatuses[currentRowIndex + 1] = "active";
          }
          return newRowStatuses;
        });
        
        updateActiveIndex(currentRowIndex + 1, 0);
        return; // Evita a atualização duplicada
      }
    } else if (key.length === 1) {
      if (currentIndex < currentRow.length) {
        currentRow[currentIndex] = key.toLowerCase();
        if (currentIndex < 4) {
          updateActiveIndex(currentRowIndex, currentIndex + 1);
        }
      }
    }

    // Atualização normal (para teclas que não sejam Enter)
    setValues(prev => {
      const newValues = [...prev];
      newValues[currentRowIndex] = currentRow;
      return newValues;
    });
  };

  const triggerShakeAnimation = (rowIndex: number) => {
    setShakingRowIndex(rowIndex);
    setTimeout(() => setShakingRowIndex(null), 600);
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
          wordKey={wordKey}
          status={rowStatuses[rowIndex]}
          activeIndex={activeIndices[rowIndex]}
          setActiveIndex={(index) => updateActiveIndex(rowIndex, index)}
          isShaking={shakingRowIndex === rowIndex}
        />
      ))}
      <Keyboard onKeyPress={handleKeyPress} />
    </div>
  );
}

export default App;