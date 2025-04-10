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

// Função para normalizar uma palavra (remover acentos)
const normalizeWord = (word: string): string =>
  word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
    .toLowerCase();

// Função para restaurar o acento na palavra, com base na palavra chave
const restoreAccents = (typedWord: string, keyWord: string): string => {
  let result = "";
  for (let i = 0; i < typedWord.length; i++) {
    const typedChar = typedWord[i];
    const keyChar = keyWord[i];

    // Verifica se a letra digitada corresponde à letra da chave sem acento
    if (normalizeWord(typedChar) === normalizeWord(keyChar)) {
      result += keyChar; // Adiciona a letra com o acento (caso haja)
    } else {
      result += typedChar; // Se não corresponder, mantém a letra digitada
    }
  }
  return result;
};

// Função para comparar as palavras e retornar as cores
const compareWords = (typedWord: string, keyWord: string): string[] => {
  const normalizedTypedWord = normalizeWord(typedWord); // Normaliza a palavra digitada
  const normalizedKeyWord = normalizeWord(keyWord); // Normaliza a palavra chave

  const colors = Array(normalizedTypedWord.length).fill("gray"); // Inicializa todas as cores como "gray"
  const letterCount: Record<string, number> = {};

  // Conta as ocorrências de cada letra na palavra correta (normalizada)
  for (const letter of normalizedKeyWord) {
    letterCount[letter] = (letterCount[letter] || 0) + 1;
  }

  // Primeira passagem: verificar as letras verdes
  for (let i = 0; i < normalizedTypedWord.length; i++) {
    if (normalizedTypedWord[i] === normalizedKeyWord[i]) {
      colors[i] = "green"; // Marca como verde se for correta
      letterCount[normalizedTypedWord[i]]--; // Diminui o contador para não marcar mais de uma vez
    }
  }

  // Segunda passagem: verificar as letras amarelas
  for (let i = 0; i < normalizedTypedWord.length; i++) {
    if (colors[i] === "gray" && normalizedKeyWord.includes(normalizedTypedWord[i]) && letterCount[normalizedTypedWord[i]] > 0) {
      colors[i] = "yellow"; // Marca como amarelo se estiver na palavra, mas em posição errada
      letterCount[normalizedTypedWord[i]]--;
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
  const inputsRef = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (status === "active") {
      const firstInput = inputsRef.current[0];
      firstInput?.focus();
    }
  }, [status]);

  const handleKeyDown = (
    colIndex: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const input = event.target as HTMLInputElement;

    if (
      !/^[a-zA-Z]$/.test(event.key) &&
      event.key !== "Backspace" &&
      event.key !== "Enter"
    ) {
      event.preventDefault();
      return;
    }

    // Lógica para Backspace
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

    // Lógica para Enter
    if (event.key === "Enter") {
      const word = values[rowIndex].join("").toLowerCase();
      if (values[rowIndex].every((char) => char !== "")) {
        const normalizedWord = normalizeWord(word); // Normaliza a palavra digitada

        // Verifica se a palavra digitada (normalizada) está na lista de palavras
        const normalizedWords = words.map(normalizeWord); // Normaliza todas as palavras da lista
        if (!normalizedWords.includes(normalizedWord)) {
          inputsRef.current.forEach((input) => {
            input?.classList.add("shake");
            input?.addEventListener("animationend", () => {
              input.classList.remove("shake");
            }, { once: true });
          });
          return;
        }

        const colors = compareWords(word, wordKey); // Compara a palavra digitada com a palavra correta

        // Aplica as cores nos inputs
        colors.forEach((color, i) => {
          const input = inputsRef.current[i];
          if (input) {
            input.classList.remove("green", "yellow", "gray");
            input.classList.add(color || "gray");
          }
        });

        // Restaura os acentos nas letras digitadas, se necessário
        const wordWithAccents = restoreAccents(word, wordKey);

        // Atualiza os valores da grid com a palavra corrigida (com acentos)
        setValues((prevValues) => {
          const updated = [...prevValues];
          updated[rowIndex] = wordWithAccents.split("");
          return updated;
        });

        // Verifica se o jogador acertou todas as letras
        if (colors.every((color) => color === "green")) {
          setRowStatuses((prev) => {
            const updated = [...prev];
            updated[rowIndex] = "completed";
            return updated;
          });
          onWin();
          return;
        }

        // Verifica se o jogo acabou
        if (rowIndex === values.length - 1) {
          setRowStatuses((prev) => {
            const updated = [...prev];
            updated[rowIndex] = "completed";
            return updated;
          });
          onGameOver();
          return;
        }

        // Atualiza o status da linha atual e ativa a próxima linha
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