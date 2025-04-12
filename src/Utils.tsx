import { RowStatus } from "./Types";

export const normalizeWord = (word: string): string =>
  word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const restoreAccents = (typedWord: string, keyWord: string): string => {
  const result = [];
  const minLength = Math.min(typedWord.length, keyWord.length);
  
  for (let i = 0; i < minLength; i++) {
    const typedChar = typedWord[i];
    const keyChar = keyWord[i];
    
    if (normalizeWord(typedChar) === normalizeWord(keyChar)) {
      result.push(keyChar);
    } else {
      result.push(typedChar);
    }
  }

  if (typedWord.length > minLength) {
    result.push(...typedWord.slice(minLength));
  }
  
  return result.join("");
};

export const compareWords = (typedWord: string, keyWord: string): string[] => {
  const normalizedTyped = normalizeWord(typedWord);
  const normalizedKey = normalizeWord(keyWord);
  const colors = Array(typedWord.length).fill("gray");
  const keyLetterCount: Record<string, number> = {};

  for (const letter of normalizedKey) {
    keyLetterCount[letter] = (keyLetterCount[letter] || 0) + 1;
  }

  for (let i = 0; i < normalizedTyped.length; i++) {
    if (i >= normalizedKey.length) continue;
    
    if (normalizedTyped[i] === normalizedKey[i]) {
      colors[i] = "green";
      keyLetterCount[normalizedTyped[i]]--;
    }
  }

  for (let i = 0; i < normalizedTyped.length; i++) {
    if (i >= normalizedKey.length || colors[i] === "green") continue;
    
    const letter = normalizedTyped[i];
    if (keyLetterCount[letter] > 0) {
      colors[i] = "yellow";
      keyLetterCount[letter]--;
    }
  }

  return colors;
};


export const initializeRowStatuses = (): RowStatus[] => {
  return Array(6).fill("locked").map((_, i) => (i === 0 ? "active" : "locked"));
};