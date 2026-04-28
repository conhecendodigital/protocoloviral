import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export async function POST(req: NextRequest) {
  try {
    // ── Auth Check ──
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ enhanced: {}, used_ai: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }

    // ── Rate Limit: 15 requests/min por usuário ──
    const rateLimit = checkRateLimit(`enhance:${user.id}`, 15, 60_000)
    if (!rateLimit.allowed) {
      return NextResponse.json({ enhanced: {}, used_ai: false, error: 'RATE_LIMITED' }, { status: 429 })
    }

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

    const prompt = `Você é um estrategista de posicionamento digital especialista em criadores de conteúdo. Sua missão é transformar respostas genéricas e curtas em respostas ricas, específicas e estratégicas.

CONTEXTO: Este perfil alimenta 5 geradores de IA que criam:
1. Posicionamento e clareza de nicho
2. Persona detalhada do público-alvo
3. 20 ideias de conteúdo para Instagram
4. Roteiros completos para Reels
5. Estratégias de vendas de 14 dias

Quanto mais detalhadas e específicas as respostas, MELHORES serão os prompts gerados. Respostas genéricas = prompts genéricos.

RESPOSTAS ATUAIS DA PESSOA:

${fieldsText}

SUA TAREFA — ENRIQUEÇA CADA RESPOSTA:

1. **CRUZE as informações**: Use TODOS os campos como contexto. Se a pessoa disse que o nicho é "Finanças" e o público é "20 a 45 anos", ao melhorar a "dor" inclua dores ESPECÍFICAS desse público nesse nicho (ex: "não conseguem juntar dinheiro no fim do mês", "gastam por impulso").

2. **EXPANDA respostas curtas**: Se a pessoa escreveu "Finanças", transforme em algo como "Educação financeira para pessoas comuns que querem sair das dívidas e construir uma reserva de emergência". Adicione contexto que faça sentido com os outros campos.

3. **ESPECIFIQUE o público**: Se escreveu "20 a 45 anos homens e mulheres", expanda com comportamentos, dores e desejos desse público no nicho da pessoa.

4. **DETALHE as dores**: Transforme dores genéricas em frases que a pessoa do público falaria. "Falta de dinheiro" vira "Não consigo pagar as contas no fim do mês, sempre fico no vermelho e não sei por onde começar a organizar minhas finanças."

5. **ENRIQUEÇA resultados**: Se "sai do 0 a 425 seguidores", expanda com o que isso significou: "Saí do zero absoluto e alcancei 425 seguidores orgânicos em X tempo, provando que é possível crescer mesmo começando do nada."

6. **MANTENHA A VOZ**: Escreva como se fosse a pessoa explicando para um amigo. Nada robótico, nada formal demais. Use a linguagem que a pessoa já demonstrou.

7. **NÃO use**: bullet points, emojis, hashtags, markdown. Apenas texto corrido natural.

8. **CADA CAMPO deve ter pelo menos 2-3 frases** (exceto campos naturalmente curtos como "nicho" ou "tempo").

Retorne EXATAMENTE neste formato JSON, sem texto extra:
{
  ${fieldIds}
}`

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 3000,
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

      // Logar consumo da API
      try {
        const usageMetadata = data?.usageMetadata
        if (usageMetadata) {
          const { logApiUsage } = await import('@/lib/billing')
          await logApiUsage({
            userId: user.id,
            feature: 'enhance_answer',
            modelUsed: 'gemini-2.0-flash',
            promptTokens: usageMetadata.promptTokenCount || 0,
            completionTokens: usageMetadata.candidatesTokenCount || 0
          })
        }
      } catch (err) {
        console.error('[BILLING_ERROR]', err)
      }

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
