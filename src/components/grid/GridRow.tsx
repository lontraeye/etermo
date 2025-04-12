import React, { useEffect, useRef, useState } from "react";
import words from "../../words.json";

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

const normalizeWord = (word: string): string =>
  word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const restoreAccents = (typedWord: string, keyWord: string): string => {
  let result = "";
  for (let i = 0; i < typedWord.length; i++) {
    const typedChar = typedWord[i];
    const keyChar = keyWord[i];
    if (normalizeWord(typedChar) === normalizeWord(keyChar)) {
      result += keyChar;
    } else {
      result += typedChar;
    }
  }
  return result;
};

const compareWords = (typedWord: string, keyWord: string): string[] => {
  const normalizedTyped = normalizeWord(typedWord);
  const normalizedKey = normalizeWord(keyWord);

  const colors = Array(normalizedTyped.length).fill("gray");
  const letterCount: Record<string, number> = {};

  for (const letter of normalizedKey) {
    letterCount[letter] = (letterCount[letter] || 0) + 1;
  }

  for (let i = 0; i < normalizedTyped.length; i++) {
    if (normalizedTyped[i] === normalizedKey[i]) {
      colors[i] = "green";
      letterCount[normalizedTyped[i]]--;
    }
  }

  for (let i = 0; i < normalizedTyped.length; i++) {
    if (
      colors[i] === "gray" &&
      normalizedKey.includes(normalizedTyped[i]) &&
      letterCount[normalizedTyped[i]] > 0
    ) {
      colors[i] = "yellow";
      letterCount[normalizedTyped[i]]--;
    }
  }

  return colors;
};

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
      // Apenas define o índice ativo inicial quando a linha é ativada
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

        // Se estamos no final e o campo atual está preenchido, apagamos ele mesmo
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

          const allGreen = colors.every((c) => c === "green");
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

          // Se já estamos no último caractere, não avança mais
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

  // Função para atualizar o activeIndex quando o quadrado for clicado
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
