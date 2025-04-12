import { RowStatus } from "./Types";

// Normaliza uma palavra removendo acentos e deixando em minúsculas
export const normalizeWord = (word: string): string =>
  word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// Restaura os acentos na palavra digitada para corresponder à palavra-chave
export const restoreAccents = (typedWord: string, keyWord: string): string => {
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

// Compara as palavras digitada e chave, retornando um array de cores ('green', 'yellow', 'gray')
export const compareWords = (typedWord: string, keyWord: string): string[] => {
  const normalizedTyped = normalizeWord(typedWord);
  const normalizedKey = normalizeWord(keyWord);

  const colors = Array(normalizedTyped.length).fill("gray");
  const letterCount: Record<string, number> = {};

  // Conta as ocorrências de cada letra na palavra-chave
  for (const letter of normalizedKey) {
    letterCount[letter] = (letterCount[letter] || 0) + 1;
  }

  // Marca as letras verdes (correspondem na posição correta)
  for (let i = 0; i < normalizedTyped.length; i++) {
    if (normalizedTyped[i] === normalizedKey[i]) {
      colors[i] = "green";
      letterCount[normalizedTyped[i]]--;
    }
  }

  // Marca as letras amarelas (letra existe, mas não na posição correta)
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

// Embaralha as palavras recebidas e retorna uma nova lista
export const shuffleWords = (words: string[]): string[] => {
  return [...words].sort(() => Math.random() - 0.5);
};

// Inicializa o estado das linhas como "locked", exceto a primeira que é "active"
export const initializeRowStatuses = (): RowStatus[] => {
  return Array(6).fill("locked").map((_, i) => (i === 0 ? "active" : "locked"));
};

// Função para resetar o estado do jogo
export const resetGameState = (words: string[]) => {
  const newShuffledWords = shuffleWords(words);
  const newWordKey = newShuffledWords[0];
  const newValues = Array(6).fill(null).map(() => Array(5).fill(""));
  const newRowStatuses = initializeRowStatuses();
  return { newShuffledWords, newWordKey, newValues, newRowStatuses };
};