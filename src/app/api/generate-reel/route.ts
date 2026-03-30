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

REGRA FUNDAMENTAL — LEIA COM ATENÇÃO:
O criador não fala SOBRE a persona. O criador SE TORNA a persona.

O roteiro é escrito em PRIMEIRA PESSOA, como se o criador estivesse vivendo a situação da persona — encarnando a dor dela, o comportamento dela, o pensamento interno dela. Quem assiste pensa "é exatamente isso que eu faço/sinto."

EXEMPLO DO MECANISMO:
O formato viral original faz isso:
"Oi, desculpa não ter te respondido antes. É que eu tava rolando infinitamente o feed das redes sociais, vendo vídeos repetidos de pessoas desconhecidas, com ganchos de dois segundos pra prender minha atenção..."
A criadora não diz "você que fica viciada no feed." Ela VIVE o vício na frente da câmera. O público se reconhece porque a cena é real e específica.

REGRAS DE ESCRITA:
- Primeira pessoa — o criador encarna a situação, não explica ela
- Cena real e específica — hora do dia, objeto, comportamento, pensamento interno concreto da persona
- Dor profunda — o que a persona sente mas não admite, não o que ela fala em voz alta
- Ritmo natural — frases curtas, pausas, acúmulo de detalhes como no original
- Sem "você que..." — nunca saia da primeira pessoa pra apontar o dedo pro público
- Estrutura do formato — siga o arco narrativo exato do viral, não invente outro
- Aplique as melhorias sugeridas — se indica pergunta direta ou desfecho concreto, já inclua
- Tamanho equivalente ao original — ${duracao}

O QUE NUNCA ESCREVER:
❌ "você que está travado/a" — quebra a primeira pessoa
❌ "no mundo de hoje" — genérico
❌ "muitas pessoas sentem" — genérico
❌ Qualquer frase que qualquer criador de qualquer nicho poderia usar
❌ Dados, resultados ou depoimentos inventados
❌ Explicações ou comentários após o roteiro

FORMATO DE ENTREGA (sem texto antes ou depois):
🎬 [TÍTULO]

**[GANCHO]**
[primeira frase em primeira pessoa — cena concreta que para o scroll]

**[DESENVOLVIMENTO]**
[acúmulo de detalhes reais da situação, em primeira pessoa, ritmo do original]

**[ENCERRAMENTO]**
[virada ou pergunta direta que gera comentário]

---
Duração estimada: ${duracao}`

    // Extrai cada campo do estudo via regex para passar estruturado pra IA
    const extrairCampo = (texto: string, label: string): string => {
      const regex = new RegExp(`\\*\\*${label}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\n\\*\\*|$)`, 'i')
      const match = texto.match(regex)
      return match ? match[1].trim() : ''
    }

    const gancho = extrairCampo(estudo, 'Gancho')
    const roteirOriginal = extrairCampo(estudo, 'Roteiro Completo')
    const estrutura = extrairCampo(estudo, 'Estrutura')
    const porQueF = extrairCampo(estudo, 'Por que funcionou')
    const emocao = extrairCampo(estudo, 'Emoção Principal')
    const melhorias = extrairCampo(estudo, 'O que poderia viralizar mais')

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
- Siga a estrutura: ${estrutura}
- Gere a emoção: ${emocao}
- Aplique as melhorias: ${melhorias}
- Use cenas concretas da persona, na voz do criador
- Duração equivalente a: ${duracao}

Agora escreva o roteiro.`

    // O formato gemini-2.5-flash-preview-04-17 vai resultar em 404
    // Manteremos APENAS o gemini-2.5-flash 
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
          maxOutputTokens: 3000,
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