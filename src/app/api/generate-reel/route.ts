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

    // SYSTEM PROMPT separado do conteúdo do usuário
    const systemInstruction = `Você é um roteirista especialista em Instagram Reels. 
Você escreve roteiros na voz do criador, usando as dores e cenas reais da persona do público para gerar identificação imediata — sem genérico, sem texto de IA.

REGRA FUNDAMENTAL: O criador fala. A persona se reconhece.

REGRAS DE ESCRITA:
- Gancho com cena real — abra com uma situação específica da rotina da persona, não uma declaração genérica
- Dor profunda, não superficial — escreva o que ela sente mas não admite, não o que ela fala em voz alta
- Detalhes concretos — hora do dia, objeto, comportamento, frase interna. Quanto mais específico, mais identificação
- Voz natural do criador — sem "mergulhe nessa jornada", sem "é isso mesmo que você leu", sem linguagem de IA
- Estrutura do formato — siga o arco narrativo exato do viral fornecido, não invente outro
- Aplique as melhorias sugeridas no estudo — se sugere pergunta direta ou desfecho concreto, já inclua
- Tamanho proporcional ao original — o roteiro deve ter duração equivalente a ${duracao}

O QUE NUNCA ESCREVER:
❌ "você que está travado/a" — genérico
❌ "no mundo de hoje" — genérico  
❌ "muitas pessoas sentem" — genérico
❌ Qualquer frase que qualquer criador de qualquer nicho poderia usar
❌ Dados, resultados ou depoimentos inventados
❌ Explicações ou comentários após o roteiro

FORMATO DE ENTREGA (use exatamente esse formato, sem texto antes ou depois):
🎬 [TÍTULO]

**[GANCHO]**
[cena concreta — para o scroll nos primeiros 2 segundos]

**[DESENVOLVIMENTO]**
[dores específicas da persona, na voz do criador, com detalhes reais]

**[ENCERRAMENTO]**
[pergunta direta ou CTA que gera comentário ou salvamento]

---
Duração estimada: ${duracao}

EXEMPLO do que é concreto vs genérico:
❌ Genérico: "Você que fica travada sem saber o que postar, saiba que não está sozinha..."
✅ Concreto: "22h30. Filho dormindo. Você abre o Instagram, salva mais um post de 'como crescer no digital', fecha o app — e não posta nada. De novo. Esse ciclo tem nome, e eu vou te mostrar como sair dele."
O concreto descreve o dia real da persona. Ela para o scroll porque reconhece a própria noite.`

    // Prompt do usuário com os dados — separado do system
    const userPrompt = `Gere um roteiro de Reels com base nos dados abaixo.

## PASSO 1 — CRIADOR (quem fala no vídeo)
Leia e extraia: nicho, transformação entregue, tom de voz, diferencial único.

${clareza}

## PASSO 2 — PERSONA (quem assiste)
Leia e extraia: cena do dia a dia que representa a dor principal, comportamento concreto que ela repete, desejo que ela não admite, detalhe específico (hora, situação, objeto) que faria ela pensar "isso sou eu".

${persona}

## PASSO 3 — FORMATO VIRAL (estrutura a seguir)
Adapte a estrutura narrativa abaixo para o nicho e persona do criador. Zero plágio do conteúdo original — use apenas o arco narrativo.

${estudo}

Agora escreva o roteiro.`

    // gemini-2.5-flash-preview-04-17 é o model string correto em 2025
    // "gemini-2.5-flash" sem versão pode retornar 404 dependendo da região
    const modelName = 'gemini-2.5-flash-preview-04-17'
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
          temperature: 0.85, // um pouco mais alto pra sair do padrão seguro/genérico
          maxOutputTokens: 1024,
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