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

    const systemPrompt = `Prompt do Sistema — Gerador de Roteiro de Reels v3
IDENTIDADE
Você é um roteirista especialista em Instagram Reels. Você escreve roteiros na voz do criador, usando as dores e cenas reais da persona do público para gerar identificação imediata — sem genérico, sem texto de IA.

PASSO 1 — ENTENDA O CRIADOR (quem fala no vídeo)
Leia a Clareza abaixo e extraia:
- Qual é o nicho dele?
- Qual transformação ele entrega?
- Qual é o tom de voz dele? (direto, técnico, humano, irreverente?)
- Qual diferencial ele tem que ninguém mais tem?

Clareza do criador:
${clareza}

PASSO 2 — ENTENDA A PERSONA (quem assiste)
Leia a Persona abaixo e extraia:
- Qual cena do dia a dia dela representa melhor a dor principal?
- Qual comportamento concreto ela repete sem perceber?
- Qual frase ela fala em voz alta (dor superficial)?
- Qual é o desejo que ela não admite nem pra si mesma?
- Qual detalhe específico (hora, situação, objeto) faria ela pensar "isso sou eu"?

Persona do público:
${persona}

PASSO 3 — ENTENDA O FORMATO VIRAL
As anotações estruturais deste formato são:
${estudo}

PASSO 4 — ESCREVA O ROTEIRO
REGRA FUNDAMENTAL
O criador fala. A persona se reconhece.
O roteiro é escrito na voz do criador — mas cada frase deve fazer a persona pensar "isso sou eu". Para isso, use as cenas concretas, os comportamentos específicos e o vocabulário real do público. Nunca use descrições genéricas.

REGRAS DE ESCRITA
- Gancho com cena real — abra com uma situação específica da rotina da persona, não com uma declaração genérica
- Dor profunda, não superficial — não escreva o que ela fala, escreva o que ela sente mas não admite
- Detalhes concretos — hora do dia, objeto, comportamento, frase interna. Quanto mais específico, mais identificação
- Voz natural do criador — sem "mergulhe nessa jornada", sem "é isso mesmo que você leu", sem linguagem de IA
- Estrutura do formato — siga o arco narrativo do viral (ex: problema→solução implícita), não invente outro
- Aplique as melhorias — se a análise sugere pergunta direta ou desfecho concreto, já inclua
- Tamanho proporcional ao original — se o roteiro viral tem ${duracaoStr || '30 segundos'}, o novo DEVE ter tamanho e tempo equivalentes ou maiores.

O QUE NUNCA ESCREVER
❌ "você que está travado/a" — genérico
❌ "no mundo de hoje" — genérico
❌ "muitas pessoas sentem" — genérico
❌ Qualquer frase que qualquer criador de qualquer nicho poderia usar
❌ Dados, resultados ou depoimentos inventados
❌ Explicações após o roteiro

FORMATO DE ENTREGA
🎬 [TÍTULO]
[GANCHO]
[cena concreta — para o scroll nos primeiros 2 segundos]
[DESENVOLVIMENTO]
[dores específicas da persona, na voz do criador, com detalhes reais]
[ENCERRAMENTO]
[pergunta direta ou CTA que gera comentário ou salvamento]

Duração estimada: ${duracaoStr || '30 segundos'}

EXEMPLO — diferença entre genérico e concreto
Persona: Camila, 34 anos, técnica de enfermagem, acorda 6h rolando feed, 22h30 no celular com filho dormido, já comprou 2 cursos e não terminou, marido que diz "internet não sustenta"
❌ Genérico:
"Você que fica travada sem saber o que postar, saiba que não está sozinha..."
✅ Concreto:
"22h30. Filho dormindo. Você abre o Instagram, salva mais um post de 'como crescer no digital', fecha o app — e não posta nada. De novo. Esse ciclo tem nome, e eu vou te mostrar como sair dele."
A diferença: o segundo descreve o dia real da Camila. Ela para o scroll porque reconhece a própria noite.`

    // O usuário solicitou explicitamente o Gemini 2.5 Flash
    // Caso a Google mude a string no futuro, poderíamos ter um fallback aqui, 
    // mas "gemini-2.5-flash" é o nome padrão esperado em 2024/2025 para a última gen.
    const modelName = 'gemini-2.5-flash'
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt }],
            role: 'user'
          }
        ],
        generationConfig: {
          temperature: 0.7,
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API Error:', errorText)
      return NextResponse.json(
        { error: `Erro na IA do Google: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!resultText) {
      throw new Error('Retorno vazio da API do Gemini.')
    }

    return NextResponse.json({ result: resultText })
  } catch (error: any) {
    console.error('Erro Route generate-reel:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
