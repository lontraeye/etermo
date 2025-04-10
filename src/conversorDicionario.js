import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dicFilePath = path.join(__dirname, "pt_BR.dic");

const jsonFilePath = path.join(__dirname, "words.json");

async function convertDicToJson() {
  try {
    const dicContent = fs.readFileSync(dicFilePath, "utf-8");

    const lines = dicContent.split("\n");

    lines.shift();

    const words = [];
    for (const line of lines) {
      const word = line.split("/")[0].trim();

      if (
        /^[a-záéíóúãõâêîôûç]{5}$/i.test(word) &&
        !/^[A-Z][a-záéíóúãõâêîôûç]*$/.test(word)
      ) {
        if (!words.includes(word)) {
          words.push(word);
        }
      }
    }

    fs.writeFileSync(jsonFilePath, JSON.stringify(words, null, 2), "utf-8");

    console.log(`Arquivo JSON gerado com sucesso: ${jsonFilePath}`);
    console.log(`Total de palavras: ${words.length}`);
  } catch (error) {
    console.error("Erro ao converter o arquivo .dic para JSON:", error);
  }
}

convertDicToJson();