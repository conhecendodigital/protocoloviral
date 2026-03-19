import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      // No API key — return original answer unchanged
      const { answer } = await req.json()
      return NextResponse.json({ enhanced: answer, used_ai: false })
    }

    const { answer, fieldLabel } = await req.json()

    if (!answer || answer.trim().length < 5) {
      return NextResponse.json({ enhanced: answer, used_ai: false })
    }

    const prompt = `Você é um assistente que ajuda criadores de conteúdo a organizarem melhor suas respostas de perfil.

A pessoa respondeu a seguinte pergunta do perfil: "${fieldLabel}"
Resposta dela: "${answer}"

Sua tarefa:
- Organize e melhore a resposta mantendo 100% a voz e o tom da pessoa
- NÃO adicione informação inventada, apenas reorganize o que já está ali
- Se a pessoa escreveu pouco, complemente DE FORMA NATURAL com base no contexto
- O resultado deve parecer que a PRÓPRIA PESSOA escreveu, nunca robótico
- Mantenha o mesmo nível de linguagem (formal/informal)
- NÃO use bullet points, emojis ou formatação especial
- Retorne APENAS o texto melhorado, sem explicações

Resposta melhorada:`

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 300,
        },
      }),
    })

    if (!response.ok) {
      // API error — return original
      return NextResponse.json({ enhanced: answer, used_ai: false })
    }

    const data = await response.json()
    const enhanced = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!enhanced || enhanced.length < 3) {
      return NextResponse.json({ enhanced: answer, used_ai: false })
    }

    return NextResponse.json({ enhanced, used_ai: true })
  } catch {
    // Any error — graceful fallback to original answer
    const body = await req.json().catch(() => ({}))
    return NextResponse.json({ enhanced: body.answer || '', used_ai: false })
  }
}
