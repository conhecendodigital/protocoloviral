import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    const body = await req.json()
    const { fields } = body as { fields: { id: string; label: string; value: string }[] }

    if (!apiKey || !fields || fields.length === 0) {
      // No API key or no fields — return originals unchanged
      const result: Record<string, string> = {}
      if (fields) fields.forEach((f: { id: string; value: string }) => { result[f.id] = f.value })
      return NextResponse.json({ enhanced: result, used_ai: false })
    }

    // Build a single prompt that enhances ALL fields at once with app context
    const fieldsText = fields
      .map((f, i) => `${i + 1}. [CAMPO: ${f.id}] Pergunta: "${f.label}"\nResposta: "${f.value}"`)
      .join('\n\n')

    const prompt = `Você é um assistente especializado em ajudar criadores de conteúdo a preencher perfis de forma estratégica.

Este perfil é usado por um sistema de IA que gera:
- Prompts de posicionamento e clareza de nicho
- Definição de persona/público-alvo
- Ideias de conteúdo para Instagram
- Roteiros completos para Reels
- Estratégias de vendas

As respostas do perfil alimentam diretamente esses geradores como contexto. Quanto mais completas e bem escritas, melhores serão os prompts gerados.

Aqui estão as respostas atuais da pessoa:

${fieldsText}

REGRAS OBRIGATÓRIAS:
1. Mantenha 100% a VOZ e o TOM da pessoa — se ela escreve informal, mantenha informal
2. NÃO invente informações que a pessoa não mencionou
3. Apenas ORGANIZE melhor, COMPLETE frases incompletas e ENRIQUEÇA com base no que ela já escreveu
4. Se uma resposta já estiver boa, mantenha como está
5. O resultado deve parecer que a PRÓPRIA PESSOA escreveu com mais calma
6. NÃO use bullet points, emojis, hashtags ou formatação especial
7. Mantenha respostas curtas se o campo era curto, e mais elaboradas se era texto longo

Retorne EXATAMENTE no formato JSON (sem markdown, sem code blocks):
{
  "${fields[0]?.id || 'campo'}": "resposta melhorada",
  ...
}

Retorne APENAS o JSON, nada mais.`

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2000,
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!response.ok) {
      const result: Record<string, string> = {}
      fields.forEach((f: { id: string; value: string }) => { result[f.id] = f.value })
      return NextResponse.json({ enhanced: result, used_ai: false })
    }

    const data = await response.json()
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!rawText) {
      const result: Record<string, string> = {}
      fields.forEach((f: { id: string; value: string }) => { result[f.id] = f.value })
      return NextResponse.json({ enhanced: result, used_ai: false })
    }

    try {
      // Clean potential markdown code blocks
      const cleaned = rawText.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim()
      const enhanced = JSON.parse(cleaned)
      return NextResponse.json({ enhanced, used_ai: true })
    } catch {
      // JSON parse failed — return originals
      const result: Record<string, string> = {}
      fields.forEach((f: { id: string; value: string }) => { result[f.id] = f.value })
      return NextResponse.json({ enhanced: result, used_ai: false })
    }
  } catch {
    return NextResponse.json({ enhanced: {}, used_ai: false })
  }
}
