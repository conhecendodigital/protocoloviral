import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    const body = await req.json()
    const { fields } = body as { fields: { id: string; label: string; value: string }[] }

    if (!apiKey || !fields || fields.length === 0) {
      const result: Record<string, string> = {}
      if (fields) fields.forEach((f: { id: string; value: string }) => { result[f.id] = f.value })
      return NextResponse.json({ enhanced: result, used_ai: false, error: !apiKey ? 'NO_API_KEY' : 'NO_FIELDS' })
    }

    const fieldsText = fields
      .map((f, i) => `${i + 1}. [CAMPO: ${f.id}] Pergunta: "${f.label}"\nResposta: "${f.value}"`)
      .join('\n\n')

    const fieldIds = fields.map(f => `"${f.id}": "resposta melhorada aqui"`).join(',\n  ')

    const prompt = `Você é um assistente especializado em ajudar criadores de conteúdo a preencher perfis de forma estratégica.

Este perfil é usado por um sistema de IA que gera:
- Prompts de posicionamento e clareza de nicho
- Definição de persona e público-alvo
- Ideias de conteúdo para Instagram
- Roteiros completos para Reels
- Estratégias de vendas

As respostas do perfil alimentam diretamente esses geradores como contexto. Quanto mais completas e bem escritas, melhores serão os prompts gerados.

Aqui estão as respostas atuais da pessoa:

${fieldsText}

REGRAS OBRIGATÓRIAS:
1. Mantenha 100% a VOZ e o TOM da pessoa
2. NÃO invente informações que a pessoa não mencionou
3. Apenas ORGANIZE melhor, COMPLETE frases incompletas e ENRIQUEÇA com base no que ela já escreveu
4. Se uma resposta já estiver boa, mantenha como está
5. O resultado deve parecer que a PRÓPRIA PESSOA escreveu com mais calma
6. NÃO use bullet points, emojis, hashtags ou formatação especial
7. Mantenha respostas curtas se o campo era curto

Retorne EXATAMENTE neste formato JSON, sem nenhum texto extra, sem markdown:
{
  ${fieldIds}
}`

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2000,
        },
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error')
      console.error('[enhance-answer] Gemini API error:', response.status, errText)
      const result: Record<string, string> = {}
      fields.forEach((f) => { result[f.id] = f.value })
      return NextResponse.json({ enhanced: result, used_ai: false, error: `API_ERROR_${response.status}` })
    }

    const data = await response.json()
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!rawText) {
      console.error('[enhance-answer] Empty response from Gemini')
      const result: Record<string, string> = {}
      fields.forEach((f) => { result[f.id] = f.value })
      return NextResponse.json({ enhanced: result, used_ai: false, error: 'EMPTY_RESPONSE' })
    }

    // Extract JSON from response - handle markdown code blocks and extra text
    let jsonStr = rawText
    // Remove markdown code fences
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
    // Try to extract JSON object if there's extra text
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonStr = jsonMatch[0]
    }

    try {
      const enhanced = JSON.parse(jsonStr)
      return NextResponse.json({ enhanced, used_ai: true })
    } catch (parseErr) {
      console.error('[enhance-answer] JSON parse failed:', parseErr, 'Raw:', rawText.substring(0, 200))
      const result: Record<string, string> = {}
      fields.forEach((f) => { result[f.id] = f.value })
      return NextResponse.json({ enhanced: result, used_ai: false, error: 'PARSE_ERROR' })
    }
  } catch (err) {
    console.error('[enhance-answer] Unexpected error:', err)
    return NextResponse.json({ enhanced: {}, used_ai: false, error: 'UNEXPECTED_ERROR' })
  }
}
