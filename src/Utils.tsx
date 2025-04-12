import { RowStatus } from "./Types";

// Normaliza a palavra removendo acentos e convertendo para minúsculas
export const normalizeWord = (word: string): string =>
  word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// Restaura os acentos da palavra digitada com base na palavra-chave
export const restoreAccents = (typedWord: string, keyWord: string): string => {
  const result = [];
  const minLength = Math.min(typedWord.length, keyWord.length);
  
  for (let i = 0; i < minLength; i++) {
    const typedChar = typedWord[i];
    const keyChar = keyWord[i];
    
    // Se os caracteres normalizados forem iguais, usa o caractere da palavra-chave
    if (normalizeWord(typedChar) === normalizeWord(keyChar)) {
      result.push(keyChar);
    } else {
      result.push(typedChar);
    }
  }
  
  // Adiciona caracteres restantes se as palavras tiverem tamanhos diferentes
  if (typedWord.length > minLength) {
    result.push(...typedWord.slice(minLength));
  }
  
  return result.join("");
};

// Compara as palavras e retorna um array com as cores correspondentes
export const compareWords = (typedWord: string, keyWord: string): string[] => {
  const normalizedTyped = normalizeWord(typedWord);
  const normalizedKey = normalizeWord(keyWord);
  const colors = Array(typedWord.length).fill("gray");
  const keyLetterCount: Record<string, number> = {};

  // Conta as ocorrências de cada letra na palavra-chave
  for (const letter of normalizedKey) {
    keyLetterCount[letter] = (keyLetterCount[letter] || 0) + 1;
  }

  // Primeira passada: marca as letras corretas (verde)
  for (let i = 0; i < normalizedTyped.length; i++) {
    if (i >= normalizedKey.length) continue;
    
    if (normalizedTyped[i] === normalizedKey[i]) {
      colors[i] = "green";
      keyLetterCount[normalizedTyped[i]]--;
    }
  }

  // Segunda passada: marca as letras presentes mas em posição errada (amarelo)
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

// Embaralha as palavras
export const shuffleWords = (words: string[]): string[] => {
  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Inicializa o status das linhas
export const initializeRowStatuses = (): RowStatus[] => {
  return Array(6).fill("locked").map((_, i) => (i === 0 ? "active" : "locked"));
};

// Reseta o estado do jogo
export const resetGameState = (words: string[]) => {
  const newShuffledWords = shuffleWords(words);
  const newWordKey = newShuffledWords[0];
  const newValues = Array(6).fill(null).map(() => Array(5).fill(""));
  const newRowStatuses = initializeRowStatuses();
  return { newShuffledWords, newWordKey, newValues, newRowStatuses };
};