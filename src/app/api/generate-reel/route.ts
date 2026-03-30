import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { clareza, persona, estudo, duracaoStr } = await req.json()

    if (!clareza || !persona || !estudo) {
      return NextResponse.json(
        { error: 'Faltam dados obrigatórios (clareza, persona ou estudo) para gerar o roteiro.' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave da API do Google Gemini (GEMINI_API_KEY) não encontrada no servidor.' },
        { status: 500 }
      )
    }

    const duracao = duracaoStr || '30 segundos'

    const systemInstruction = `Você é um roteirista especialista em Instagram Reels.

Sua função é analisar um formato viral e replicar os mesmos elementos que o fazem funcionar — adaptando o conteúdo para o nicho e persona do criador. Nunca o mesmo conteúdo. Sempre os mesmos elementos.

═══════════════════════════════════
PASSO A — DISSEQUE O FORMATO VIRAL
═══════════════════════════════════
Antes de escrever qualquer coisa, extraia do estudo fornecido:

1. MECANISMO NARRATIVO
   Como a história é contada? Exemplos:
   - Criador encarna a situação na primeira pessoa ("eu tava fazendo X...")
   - Criador fala diretamente pro público na segunda pessoa ("você que faz X...")
   - Criador revela algo inesperado ("o que ninguém te conta sobre X...")
   - Criador lista elementos com ritmo acumulativo ("X, Y, Z, W...")
   - Outro — identifique qual é

2. PESSOA GRAMATICAL
   O roteiro original é escrito em qual pessoa? Primeira? Segunda? Terceira?
   O roteiro novo deve usar a mesma pessoa.

3. RITMO E CONSTRUÇÃO DAS FRASES
   As frases são curtas e cortadas? Longas e acumulativas? Têm pausas dramáticas?
   Replique o mesmo ritmo.

4. TIPO DE GANCHO
   Como o original prende nos primeiros 2 segundos? É uma cena? Uma pergunta? Uma afirmação polêmica? Uma confissão?
   O gancho novo deve usar o mesmo tipo.

5. EMOÇÃO CENTRAL
   Qual emoção o formato ativa? Identificação? Curiosidade? Urgência? Surpresa?
   O roteiro novo deve ativar a mesma emoção — com o conteúdo do nicho do criador.

6. ESTRUTURA DO ARCO
   Qual é o arco narrativo? problema→solução implícita? revelação→impacto? lista→virada? Outro?
   Siga esse arco exato.

7. ENCERRAMENTO
   Como termina? Com pergunta direta? Virada emocional? CTA implícito?
   Replique o tipo de encerramento, aplicando a melhoria sugerida no estudo se houver.

═══════════════════════════════════
PASSO B — ESCREVA O ROTEIRO NOVO
═══════════════════════════════════
Com os elementos extraídos acima, escreva o roteiro novo:

- Use o MESMO mecanismo narrativo
- Use a MESMA pessoa gramatical
- Use o MESMO ritmo de frases
- Use o MESMO tipo de gancho
- Ative a MESMA emoção central
- Siga o MESMO arco narrativo
- Termine com o MESMO tipo de encerramento

Mas substitua TODO o conteúdo:
- O problema/situação vem da PERSONA do criador (vida real, rotina, dores concretas)
- A solução/transformação vem da CLAREZA do criador (o que ele entrega, seu diferencial)
- Os detalhes são específicos do nicho — nunca genéricos

REGRAS INVIOLÁVEIS:
❌ Zero plágio — nenhuma frase do original entra no novo
❌ Zero genérico — nada que qualquer criador de qualquer nicho poderia falar
❌ Zero linguagem de IA — sem "mergulhe", "jornada", "transforme sua vida"
❌ Zero dados inventados — só o que está nos dados do criador
❌ Zero explicações após o roteiro — entregue só o roteiro

FORMATO DE ENTREGA (sem nenhum texto antes ou depois):
🎬 [TÍTULO]

**[GANCHO]**
[replique o tipo de gancho do original, com conteúdo do nicho]

**[DESENVOLVIMENTO]**
[replique o ritmo e mecanismo do original, com situações reais da persona]

**[ENCERRAMENTO]**
[replique o tipo de encerramento do original, com melhoria aplicada]

---
Duração estimada: ${duracao}`

    // Extrai cada campo do estudo via regex para passar estruturado pra IA
    const extrairCampo = (texto: string, label: string): string => {
      const regex = new RegExp(`\\*\\*${label}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\n\\*\\*|$)`, 'i')
      const match = texto.match(regex)
      return match ? match[1].trim() : ''
    }

    const gancho         = extrairCampo(estudo, 'Gancho')
    const roteirOriginal = extrairCampo(estudo, 'Roteiro Completo')
    const estrutura      = extrairCampo(estudo, 'Estrutura')
    const porQueF        = extrairCampo(estudo, 'Por que funcionou')
    const emocao         = extrairCampo(estudo, 'Emoção Principal')
    const melhorias      = extrairCampo(estudo, 'O que poderia viralizar mais')

    const userPrompt = `Gere um roteiro de Reels com base nos dados abaixo.

## PASSO 1 — CRIADOR (quem fala no vídeo)
Extraia: nicho, transformação entregue, tom de voz, diferencial único.
${clareza}

## PASSO 2 — PERSONA (quem assiste)
Extraia: cena do dia a dia que representa a dor principal, comportamento concreto que ela repete sem perceber, desejo que ela não admite, detalhe específico (hora, situação, objeto) que faria ela pensar "isso sou eu".
${persona}

## PASSO 3 — FORMATO VIRAL

**Gancho original:**
${gancho}

**Roteiro original (NÃO copie — use só como referência de ritmo e naturalidade):**
${roteirOriginal}

**Estrutura narrativa a seguir obrigatoriamente:**
${estrutura}

**Por que esse formato funcionou:**
${porQueF}

**Emoção que o roteiro novo deve gerar:**
${emocao}

**Melhorias a aplicar obrigatoriamente no roteiro novo:**
${melhorias}

## PASSO 4 — ESCREVA O ROTEIRO
Adapte esse formato viral obrigatoriamente e faça um roteiro inédito para você mesmo gravar, usando a sua clareza e focando na sua persona.

Duração equivalente a: ${duracao}`

    // IMPORTANTE: Mantendo gemini-2.5-flash para não dar erro 404
    const modelName = 'gemini-2.5-flash'
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 2048,
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API Error:', errorText)
      return NextResponse.json(
        { error: `Erro na IA do Google: ${response.statusText}. Detalhes: ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!resultText) {
      console.error('Retorno vazio. Payload completo:', JSON.stringify(data))
      throw new Error('Retorno vazio da API do Gemini.')
    }

    return NextResponse.json({ result: resultText })

  } catch (error: any) {
    console.error('Erro Route generate-reel:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}