/**
 * Parser client-side para extrair inteligência das respostas do ChatGPT
 * coladas pelo aluno nos campos resposta1 (Clareza) e resposta2 (Persona).
 *
 * Funciona 100% no frontend — sem custo de API.
 */

// ─── Helpers ───────────────────────────────────────────────

/**
 * Extrai um bloco de texto entre dois cabeçalhos numéricos.
 * Simples e à prova de falhas: procura pelo número da seção atual e corta no número da próxima.
 */
function extractSection(text: string, sectionNumber: number): string {
  if (!text) return ''
  
  // Procura algo como "1. " ou "1) " no início de uma linha
  const currentRegex = new RegExp(`(?:^|\\n)\\s*(?:#{1,3}\\s*)?(?:\\*\\*)?\\s*${sectionNumber}[.)]\\s*(?=[A-ZÀ-Ú0-9])`, 'i')
  const currentMatch = text.match(currentRegex)
  if (!currentMatch) return ''
  
  // startIndex é o final da match do "1. ", então o texto vai começar em "MENSAGEM CENTRAL..."
  const startIndex = currentMatch.index! + currentMatch[0].length
  
  // Agora procurar a PRÓXIMA seção. Como sabemos que são seções de 1 a 7, vamos pro próximo número.
  const nextSectionNumber = sectionNumber + 1
  const nextRegex = new RegExp(`(?:^|\\n)\\s*(?:#{1,3}\\s*)?(?:\\*\\*)?\\s*${nextSectionNumber}[.)]\\s*(?=[A-ZÀ-Ú0-9])`, 'i')
  
  const nextMatch = text.substring(startIndex).match(nextRegex)
  
  let result = ''
  if (nextMatch) {
    result = text.substring(startIndex, startIndex + nextMatch.index!).trim()
  } else {
    // Verificação de fallback de segurança para a última seção (remove # RESTRICOES se houver)
    const restricoesMatch = text.substring(startIndex).match(/(?:^|\n)\s*#\s*RESTR/i)
    if (restricoesMatch) {
      result = text.substring(startIndex, startIndex + restricoesMatch.index!).trim()
    } else {
      result = text.substring(startIndex).trim()
    }
  }

  // Remove a primeira linha inteira, pois é o título repetido (ex: "MENSAGEM CENTRAL (MANIFESTO)")
  const firstNewlineIndex = result.indexOf('\n')
  if (firstNewlineIndex !== -1) {
    result = result.substring(firstNewlineIndex + 1).trim()
  }
  
  return result
}

/**
 * Extrai uma sub-seção (3.1, 4.2, etc.)
 * Simples e à prova de falhas: procura pelo número da sub-seção atual e corta no número da próxima sub-seção ou seção maior.
 */
function extractSubSection(text: string, sectionId: string): string {
  if (!text) return ''
  const escaped = sectionId.replace('.', '\\.')
  
  // Encontrar o inicio de "3.1"
  const currentRegex = new RegExp(`(?:^|\\n)\\s*(?:#{1,4}\\s*)?(?:\\*\\*)?\\s*${escaped}[\\s.\\)]*(?=[A-ZÀ-Ú0-9])`, 'i')
  const currentMatch = text.match(currentRegex)
  if (!currentMatch) return ''
  
  const startIndex = currentMatch.index! + currentMatch[0].length
  
  // Calcular próximo ID de subseção e da próxima seção pai
  const parts = sectionId.split('.')
  const nextMinor = parseInt(parts[1]) + 1
  const nextMajor = parseInt(parts[0]) + 1
  
  // Expressão regular para achar a PARADA: pode ser "3.2" (próxima subseção), "4." (próxima seção principal)
  const nextRegex = new RegExp(`(?:^|\\n)\\s*(?:#{1,4}\\s*)?(?:\\*\\*)?\\s*(?:${parts[0]}\\.${nextMinor}|${nextMajor}\\.|\\d+\\.\\d+|\\d+[.\\)])\\s*(?=[A-ZÀ-Ú0-9])`, 'i')
  const nextMatch = text.substring(startIndex).match(nextRegex)
  
  let result = ''
  if (nextMatch) {
    result = text.substring(startIndex, startIndex + nextMatch.index!).trim()
  } else {
    // Verificação de fallback
    const restricoesMatch = text.substring(startIndex).match(/(?:^|\n)\s*#\s*RESTR/i)
    if (restricoesMatch) {
      result = text.substring(startIndex, startIndex + restricoesMatch.index!).trim()
    } else {
      result = text.substring(startIndex).trim()
    }
  }

  // Remove a primeira linha se for o título repetido (ex: "DORES SUPERFICIAIS")
  const firstNewlineIndex = result.indexOf('\n')
  if (firstNewlineIndex !== -1) {
    result = result.substring(firstNewlineIndex + 1).trim()
  }

  return result
}

/**
 * Extrai o valor depois de um label.
 * Flexível para múltiplos formatos:
 *   "- Campo: valor"           (dash + same line)
 *   "• **Campo**: valor"       (bullet + bold)
 *   "Campo:\nvalor na próxima" (label na linha, valor abaixo)
 *   "**Campo:** valor"         (bold label)
 */
function extractField(text: string, label: string): string {
  if (!text) return ''

  // Tentativa 1: "- Label: valor" ou "• **Label:** valor" (mesma linha)
  const sameLine = new RegExp(
    `(?:[-•*]\\s*)?\\**(?:${label})\\**\\s*:+\\s*(.+)`,
    'i'
  )
  const m1 = text.match(sameLine)
  if (m1?.[1]) {
    const val = m1[1].replace(/^\(.*?\)\s*/, '').replace(/\*\*/g, '').trim()
    if (val.length > 0 && val !== ':') return val
  }

  // Tentativa 2: Label numa linha, valor na próxima
  const nextLine = new RegExp(
    `(?:[-•*]\\s*)?\\**(?:${label})\\**\\s*:?\\s*\\n\\s*(.+)`,
    'i'
  )
  const m2 = text.match(nextLine)
  if (m2?.[1]) {
    const val = m2[1].replace(/^\(.*?\)\s*/, '').replace(/\*\*/g, '').replace(/^[""]|[""]$/g, '').trim()
    if (val.length > 0) return val
  }

  return ''
}

/** Remove markdown bold/italic markers para texto limpo */
function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^[-•]\s*/gm, '• ')
    .trim()
}

// ─── Clareza Parser ────────────────────────────────────────

export interface ClarezaParsed {
  manifesto: string
  diferencial: string
  transformacao: string
  posicionamento: string
  pilares: string
  armadilhas: string
  proximosPassos: string
  raw: string
}

export function parseClareza(text: string | null | undefined): ClarezaParsed | null {
  console.log('[PARSER DEBUG RAW CLAREZA]:', text)
  if (!text || text.trim().length < 50) return null

  const sec1 = extractSection(text, 1)
  console.log('[PARSER DEBUG SEC1 CAUGHT]:', sec1)
  const sec2 = extractSection(text, 2)
  const sec3 = extractSection(text, 3)
  const sec4 = extractSection(text, 4)
  const sec5 = extractSection(text, 5)
  const sec6 = extractSection(text, 6)
  const sec7 = extractSection(text, 7)

  return {
    manifesto: cleanMarkdown(sec1),
    diferencial: cleanMarkdown(sec2),
    transformacao: cleanMarkdown(sec3),
    posicionamento: cleanMarkdown(sec4),
    pilares: cleanMarkdown(sec5),
    armadilhas: cleanMarkdown(sec6),
    proximosPassos: cleanMarkdown(sec7),
    raw: text,
  }
}

// ─── Persona Parser ────────────────────────────────────────

export interface PersonaParsed {
  demografico: {
    nome: string
    idade: string
    genero: string
    estadoCivil: string
    cidade: string
    profissao: string
    renda: string
    escolaridade: string
  }
  rotina: string
  psicologico: {
    doresSuperficiais: string
    doresProfundas: string
    desejosDeclarados: string
    desejosOcultos: string
  }
  comportamentoDigital: {
    consumo: string
    influenciadores: string
    compra: string
  }
  jornada: {
    nivelConsciencia: string
    solucoesTentadas: string
  }
  objecoes: string
  gatilhos: string
  mapaEmpatia: string
  raw: string
}

export function parsePersona(text: string | null | undefined): PersonaParsed | null {
  if (!text || text.trim().length < 50) return null

  const sec1 = extractSection(text, 1)
  const sec2 = extractSection(text, 2)
  const sec6 = extractSection(text, 6)
  const sec7 = extractSection(text, 7)
  const sec8 = extractSection(text, 8)

  return {
    demografico: {
      nome: extractField(sec1, 'Nome completo fict[íi]cio|Nome'),
      idade: extractField(sec1, 'Idade exata|Idade'),
      genero: extractField(sec1, 'G[êe]nero'),
      estadoCivil: extractField(sec1, 'Estado civil'),
      cidade: extractField(sec1, 'Cidade|Regi[ãa]o'),
      profissao: extractField(sec1, 'Profiss[ãa]o atual|Profiss[ãa]o'),
      renda: extractField(sec1, 'Faixa de renda|Renda'),
      escolaridade: extractField(sec1, 'N[íi]vel de escolaridade|Escolaridade'),
    },
    rotina: cleanMarkdown(sec2),
    psicologico: {
      doresSuperficiais: cleanMarkdown(extractSubSection(text, '3.1')),
      doresProfundas: cleanMarkdown(extractSubSection(text, '3.2')),
      desejosDeclarados: cleanMarkdown(extractSubSection(text, '3.3')),
      desejosOcultos: cleanMarkdown(extractSubSection(text, '3.4')),
    },
    comportamentoDigital: {
      consumo: cleanMarkdown(extractSubSection(text, '4.1')),
      influenciadores: cleanMarkdown(extractSubSection(text, '4.2')),
      compra: cleanMarkdown(extractSubSection(text, '4.3')),
    },
    jornada: {
      nivelConsciencia: cleanMarkdown(extractSubSection(text, '5.1')),
      solucoesTentadas: cleanMarkdown(extractSubSection(text, '5.2')),
    },
    objecoes: cleanMarkdown(sec6),
    gatilhos: cleanMarkdown(sec7),
    mapaEmpatia: cleanMarkdown(sec8),
    raw: text,
  }
}

// ─── Roteiro Visual Parser ──────────────────────────────────

export interface RoteiroBlocks {
  titulo: string;
  gancho: string;
  desenvolvimento: string;
  cta: string;
}

/**
 * Lê um texto que contém as marcações de roteiro [GANCHO], [DESENVOLVIMENTO] e [CTA E FINAL]
 * E retorna a divisão ou null caso não esteja formatado corretamente.
 */
export function parseRoteiroBlocks(text: string): RoteiroBlocks | null {
  if (!text) return null;

  // Busca o título - a primeira linha com **
  const lines = text.split('\\n');
  let titulo = '';
  if (lines[0] && lines[0].includes('**')) {
    titulo = lines[0].replace(/\\*\\*/g, '').trim();
  } else {
    // Tenta pegar a primeira linha sem estar vazia
    titulo = lines.find(l => l.trim().length > 0 && !l.includes('[GANCHO]'))?.replace(/\\*\\*/g, '').trim() || 'Roteiro';
  }

  // Regex para achar os blocos (tratando negrito opcional e espaços)
  const regexGancho = /(?:\*\*)?\[GANCHO\](?:\*\*)?[\s\S]*?(?=(?:\*\*)?\[DESENVOLVIMENTO\](?:\*\*)?)/i;
  const regexDev = /(?:\*\*)?\[DESENVOLVIMENTO\](?:\*\*)?[\s\S]*?(?=(?:\*\*)?\[CTA E FINAL\](?:\*\*)?|$)/i;
  const regexCta = /(?:\*\*)?\[CTA E FINAL\](?:\*\*)?[\s\S]*/i;

  const mGancho = text.match(regexGancho);
  const mDev = text.match(regexDev);
  const mCta = text.match(regexCta);

  if (!mGancho && !mDev) {
    // FALLBACK HEURÍSTICO P/ ROTEIRO ORIGINAL SCRAPEADO (Sem Tags)
    let cleanText = text.replace(titulo, '').trim();
    if (!cleanText) cleanText = text.trim();

    const firstPuncResult = cleanText.match(/[.?!]+[\s\n]+/);
    if (!firstPuncResult) return null; // Sem pontuação, sem divisão

    let ganchoEndIndex = firstPuncResult.index! + firstPuncResult[0].length;
    
    // Se o gancho for muito curto e existir próxima frase, pegue a segunda (Ex: "Oi! Tem um segredo...")
    if (ganchoEndIndex < 40) {
      const secondTarget = cleanText.substring(ganchoEndIndex).match(/[.?!]+[\s\n]+/);
      if (secondTarget) {
         ganchoEndIndex += secondTarget.index! + secondTarget[0].length;
      }
    }

    const gancho = cleanText.substring(0, ganchoEndIndex).trim();

    const reversedTokens = cleanText.match(/[^.?!]+[.?!]+(?:[\s\n]|$)/g);
    let cta = '';
    let ctaLength = 0;
    
    // Pegar apenas a última frase pro CTA, se tivermos bastante volume
    if (reversedTokens && reversedTokens.length >= 4) {
       // O match sempre consome pra frente, pegamos o último array item
       cta = reversedTokens[reversedTokens.length - 1].trim();
       ctaLength = reversedTokens[reversedTokens.length - 1].length;
    }

    const devStart = ganchoEndIndex;
    const devEnd = cleanText.length - ctaLength;
    const desenvolvimento = cleanText.substring(devStart, devEnd).trim();

    return {
      titulo,
      gancho,
      desenvolvimento,
      cta
    }
  }

  const pureText = (blockMatch: RegExpMatchArray | null, tagName: RegExp) => 
    blockMatch ? blockMatch[0].replace(tagName, '').replace(/\*\*/g, '').trim() : '';

  return {
    titulo,
    gancho: pureText(mGancho, /(?:\*\*)?\[GANCHO\](?:\*\*)?/i),
    desenvolvimento: pureText(mDev, /(?:\*\*)?\[DESENVOLVIMENTO\](?:\*\*)?/i),
    cta: pureText(mCta, /(?:\*\*)?\[CTA E FINAL\](?:\*\*)?/i),
  };
}
