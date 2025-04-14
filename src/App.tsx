import { useState, useEffect, useRef } from "react";
import "./App.css";
import GridRow from "./components/grid/GridRow";
import Keyboard from "./components/keyboard/Keyboard";
import GameOverModal from "./components/modal/GameOverModal";
import DropdownMenu from "./components/dropdownmenu/DropdownMenu";
import { RowStatus } from "./Types";
import comuns from "./palavras-comuns.json";
import words from "./words.json";
import { normalizeWord, restoreAccents } from "./Utils";

function App() {
  const [values, setValues] = useState<string[][]>(
    Array(6)
      .fill(null)
      .map(() => Array(5).fill(""))
  );
  const [isHardMode, setIsHardMode] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isScrolledToBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 1;
      container.classList.toggle("scrolled-to-bottom", isScrolledToBottom);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const [rowStatuses, setRowStatuses] = useState<RowStatus[]>(
    Array(6)
      .fill("locked")
      .map((_, i) => (i === 0 ? "active" : "locked"))
  );

  const [wordKey, setWordKey] = useState("");
  const [activeIndices, setActiveIndices] = useState<number[]>(
    Array(6).fill(0)
  );
  const [shakingRowIndex, setShakingRowIndex] = useState<number | null>(null);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">(
    "playing"
  );
  const [usedWords, setUsedWords] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    const activeRowIndex = rowStatuses.findIndex(
      (status) => status === "active"
    );
    if (containerRef.current && activeRowIndex !== -1) {
      const rowElement = containerRef.current.children[
        activeRowIndex + 1
      ] as HTMLElement;
      rowElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [rowStatuses]);

  const startNewGame = () => {
    const availableWords = comuns.filter((word) => !usedWords.includes(word));

    if (availableWords.length === 0) {
      setUsedWords([]);
    }

    const randomWord =
      availableWords.length > 0
        ? availableWords[Math.floor(Math.random() * availableWords.length)]
        : comuns[Math.floor(Math.random() * comuns.length)];

    setWordKey(randomWord);
    setUsedWords((prev) => [...prev, randomWord]);
    setValues(
      Array(6)
        .fill(null)
        .map(() => Array(5).fill(""))
    );
    setRowStatuses(
      Array(6)
        .fill("locked")
        .map((_, i) => (i === 0 ? "active" : "locked"))
    );
    setActiveIndices(Array(6).fill(0));
    setGameStatus("playing");
    console.log("Nova palavra chave:", randomWord);
  };

  useEffect(() => {
    const handlePhysicalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        handleKeyPress("Backspace");
      } else if (e.key === "Enter") {
        handleKeyPress("Enter");
      } else if (/^[a-zA-ZÀ-ÖØ-öø-ÿ]$/.test(e.key)) {
        handleKeyPress(e.key.toLowerCase());
      }
    };

    window.addEventListener("keydown", handlePhysicalKeyDown);
    return () => {
      window.removeEventListener("keydown", handlePhysicalKeyDown);
    };
  }, [values, rowStatuses, activeIndices, isHardMode]);

  const getLetterHints = (
    row: string[],
    key: string
  ): ("correct" | "present" | "absent")[] => {
    const hints: ("correct" | "present" | "absent")[] = [];
    const keyLetters = key.split("");
    const rowLetters = row;

    for (let i = 0; i < rowLetters.length; i++) {
      if (normalizeWord(rowLetters[i]) === normalizeWord(keyLetters[i])) {
        hints.push("correct");
      } else if (
        keyLetters.some(
          (letter) => normalizeWord(letter) === normalizeWord(rowLetters[i])
        )
      ) {
        hints.push("present");
      } else {
        hints.push("absent");
      }
    }

    return hints;
  };

  const getCorrectLettersFromPreviousRow = (rowIndex: number): string[] => {
    if (!isHardMode || rowIndex === 0) return Array(5).fill("");

    const previousRowIndex = rowIndex - 1;
    if (rowStatuses[previousRowIndex] !== "completed") return Array(5).fill("");

    const previousRow = values[previousRowIndex];
    const hints = getLetterHints(previousRow, wordKey);

    return hints.map((hint, i) => (hint === "correct" ? previousRow[i] : ""));
  };

  const handleKeyPress = (key: string) => {
    if (gameStatus !== "playing") return;

    const currentRowIndex = rowStatuses.findIndex(
      (status) => status === "active"
    );
    if (currentRowIndex === -1) return;

    const currentRow = [...values[currentRowIndex]];
    const currentIndex = activeIndices[currentRowIndex];
    const correctLetters = getCorrectLettersFromPreviousRow(currentRowIndex);

    if (key === "Backspace") {
      if (currentRow[currentIndex] && !correctLetters[currentIndex]) {
        currentRow[currentIndex] = "";
      } else if (currentIndex > 0 && !correctLetters[currentIndex - 1]) {
        currentRow[currentIndex - 1] = "";
        updateActiveIndex(currentRowIndex, currentIndex - 1);
      }
    } else if (key === "Enter") {
      const submittedRow = currentRow.map((char, index) =>
        correctLetters[index] ? correctLetters[index] : char
      );

      if (submittedRow.every((cell) => cell !== "")) {
        const word = submittedRow.join("");
        const normalizedWord = normalizeWord(word);

        const validWords = [...words, ...comuns].map((w) => normalizeWord(w));
        if (!validWords.includes(normalizedWord)) {
          triggerShakeAnimation(currentRowIndex);
          return;
        }

        if (isHardMode && currentRowIndex > 0) {
          const previousRow = values[currentRowIndex - 1];
          const previousHints = getLetterHints(previousRow, wordKey);

          for (let i = 0; i < previousHints.length; i++) {
            if (
              previousHints[i] === "correct" &&
              submittedRow[i] !== previousRow[i]
            ) {
              triggerShakeAnimation(currentRowIndex);
              return;
            }
          }
        }

        const wordWithAccents = restoreAccents(word, wordKey);
        const newRow = wordWithAccents.split("");

        setValues((prev) => {
          const newValues = [...prev];
          newValues[currentRowIndex] = newRow;
          return newValues;
        });

        const isCorrect = normalizeWord(word) === normalizeWord(wordKey);

        setRowStatuses((prev) => {
          const newRowStatuses = [...prev];
          newRowStatuses[currentRowIndex] = "completed";

          if (!isCorrect && currentRowIndex < 5) {
            newRowStatuses[currentRowIndex + 1] = "active";
          }
          return newRowStatuses;
        });

        if (isCorrect) {
          setGameStatus("won");
          return;
        }

        if (currentRowIndex < 5) {
          const newCorrectLetters = isHardMode
            ? getCorrectLettersFromPreviousRow(currentRowIndex + 1)
            : Array(5).fill("");

          let firstNonLocked = 0;
          while (firstNonLocked < 5 && newCorrectLetters[firstNonLocked]) {
            firstNonLocked++;
          }
          updateActiveIndex(currentRowIndex + 1, Math.min(firstNonLocked, 4));
        } else {
          setGameStatus("lost");
        }
        return;
      }
    } else if (key.length === 1) {
      if (currentIndex < currentRow.length && !correctLetters[currentIndex]) {
        currentRow[currentIndex] = key.toLowerCase();

        let nextIndex = currentIndex + 1;
        while (nextIndex < 5 && correctLetters[nextIndex]) {
          nextIndex++;
        }
        if (nextIndex < 5) {
          updateActiveIndex(currentRowIndex, nextIndex);
        }
      }
    }

    setValues((prev) => {
      const newValues = [...prev];
      newValues[currentRowIndex] = currentRow;
      return newValues;
    });
  };

  const handleRowCompleted = (rowIndex: number) => {
    const correctLetters = getCorrectLettersFromPreviousRow(rowIndex);
    const completedWord = values[rowIndex]
      .map((char, index) =>
        correctLetters[index] ? correctLetters[index] : char
      )
      .join("");

    if (normalizeWord(completedWord) === normalizeWord(wordKey)) {
      setGameStatus("won");
    } else if (rowIndex === 5) {
      setGameStatus("lost");
    }
  };

  const handleRestoreAccents = (rowIndex: number, restoredWord: string) => {
    setValues((prev) => {
      const newValues = [...prev];
      newValues[rowIndex] = restoredWord.split("");
      return newValues;
    });
  };

  const triggerShakeAnimation = (rowIndex: number) => {
    setShakingRowIndex(rowIndex);
    setTimeout(() => setShakingRowIndex(null), 600);
  };

  const updateActiveIndex = (rowIndex: number, index: number) => {
    setActiveIndices((prev) => {
      const updated = [...prev];
      if (isHardMode && rowIndex > 0) {
        const correctLetters = getCorrectLettersFromPreviousRow(rowIndex);
        let firstNonLocked = index;
        while (firstNonLocked < 5 && correctLetters[firstNonLocked]) {
          firstNonLocked++;
        }
        updated[rowIndex] = Math.min(firstNonLocked, 4);
      } else {
        updated[rowIndex] = index;
      }
      return updated;
    });
  };

  const onHardModeToggle = () => {
    setIsHardMode((prev) => !prev);
    console.log("Modo difícil:", !isHardMode);
  };

  const hasSubmittedWords = () => {
    return rowStatuses.some((status) => status === "completed");
  };

  return (
    <div className="App">
      <DropdownMenu
        isHardMode={isHardMode}
        onHardModeToggle={onHardModeToggle}
        disabled={hasSubmittedWords()}
      />
      <div className="grid-container">
        <h1>ETERMO</h1>
        <div className="palavras" ref={containerRef}>
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
              onRestoreAccents={handleRestoreAccents}
              onRowCompleted={() => handleRowCompleted(rowIndex)}
              isHardMode={isHardMode}
              correctLettersFromPreviousRow={getCorrectLettersFromPreviousRow(
                rowIndex
              )}
              isGameWon={gameStatus === "won"}
            />
          ))}
        </div>
        <div className="keyboard-container">
          <Keyboard onKeyPress={handleKeyPress} />
        </div>
        <GameOverModal
          isOpen={gameStatus !== "playing"}
          isWinner={gameStatus === "won"}
          onClose={startNewGame}
          wordKey={wordKey}
        />
      </div>
    </div>
  );
}

export default App;
