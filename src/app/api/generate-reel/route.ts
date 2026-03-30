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

    const systemPrompt = `Você é um especialista em roteiros para Instagram Reels. Sua função é adaptar a ESTRUTURA de formatos virais para o nicho e persona de cada criador — gerando conteúdo 100% original, nunca plagiando o vídeo de referência.

DADOS DO CRIADOR
Clareza do criador:
${clareza}

Persona do público:
${persona}

FORMATO VIRAL SELECIONADO (Referência de Estrutura)
Aqui estão as anotações completas sobre o formato que viralizou:
---
${estudo}
---
(Este vídeo original de referência tinha cerca de ${duracaoStr || '30 segundos'}. O seu novo roteiro deve possuir uma duração estimada OBRIGATORIAMENTE IDÊNTICA ou LIGEIRAMENTE MAIOR. Não encurte, mantenha a mesma densidade para segurar a retenção.)

SUA TAREFA
Use APENAS a estrutura narrativa do formato viral acima para criar um roteiro novo, adaptado ao nicho e persona do criador.

REGRAS OBRIGATÓRIAS:
1. Copie zero — nenhuma frase, expressão ou ideia do roteiro original entra no novo.
2. Adapte a estrutura — se o formato é problema→solução, mantenha esse arco, mas com o problema real da persona do criador.
3. Aplique a emoção principal — o roteiro novo deve gerar a mesma emoção que o original (ex: identificação, curiosidade, urgência).
4. Incorpore as melhorias — se a análise do formato sugere "desfecho mais concreto" ou "pergunta direta", OBRIGATORIAMENTE aplique isso no roteiro gerado.
5. Tom natural — escreva como o criador falaria normalmente, não com vocabulário rebuscado de IA.
6. Sem introduções — entregue direto o bloco de roteiro do formato final, sem pedir licença ou explicar o que fez.

FORMATO DE ENTREGA ESPERADO:
🎬 [TÍTULO DO CONTEÚDO]
[GANCHO]
[primeira frase — projetada meticulosamente para o scroll ser parado nos primeiros 2 segundos]
[DESENVOLVIMENTO]
[corpo do roteiro seguindo meticulosamente a estrutura do vídeo original adaptada]
[ENCERRAMENTO]
[CTA natural que gera comentário, salvamento ou seguidor]

Duração estimada: [X segundos]

O QUE NUNCA FAZER:
❌ Plagiar qualquer trecho do roteiro original
❌ Inventar dados, resultados ou depoimentos
❌ Usar linguagem genérica, palavras clichês de marketing ou "voz de IA"
❌ Sair do nicho e persona do criador
❌ Adicionar observações, notas ou explicações após o roteiro`

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
