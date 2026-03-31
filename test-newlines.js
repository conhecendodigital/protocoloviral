const fs = require('fs');

const text = `8. MAPA DE EMPATIA (A CABEÇA DA CAMILA)
Dimensão
O que a Camila...
Pensa e sente
"Queria muito conseguir, mas e se não for pra mim?"
Ouve
"Internet não é renda de verdade" (marido), "Você não tem tempo pra isso" (ela mesma)
Vê
Criadores crescendo, vida que parece impossível, conteúdo técnico que a intimida
Fala e faz
Salva conteúdo, assiste tutorial, começa a postar, para na semana 2
Dores
Medo do julgamento, ciclo de começa-e-para, identidade presa ao trabalho CLT
Ganhos
Reconhecimento, renda extra, prova pra si mesma de que consegue`;

const cleanMarkdown = t => t.replace(/\*\*\*/g, '').replace(/\*\*/g, '').replace(/\*/g, '').replace(/^[-•]\s*/gm, '• ').trim();

const extractSection = (txt, num) => {
  const currentRegex = new RegExp(`(?:^|\\n)\\s*(?:#{1,3}\\s*)?(?:\\*\\*)?\\s*${num}[.)]\\s*(?=[A-ZÀ-Ú0-9])`, 'i')
  const currentMatch = txt.match(currentRegex)
  if (!currentMatch) return ''
  
  const startIndex = currentMatch.index + currentMatch[0].length
  const result = txt.substring(startIndex).trim()

  const firstNewlineIndex = result.indexOf('\n')
  return result.substring(firstNewlineIndex + 1).trim()
}

const sec = extractSection(text, 8);
console.log("Extracted:\n", sec);
console.log("Cleaned:\n", cleanMarkdown(sec));
