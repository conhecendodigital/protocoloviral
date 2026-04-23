import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'NO_API_KEY' }, { status: 500 })

    const body = await req.json()
    const { profile } = body as {
      profile: {
        nicho?: string; assunto?: string; formacoes?: string; resultado?: string
        diferencial?: string; publico?: string; dor?: string; tentou?: string
        concorrentes?: string; proposito?: string; receio?: string; tempo?: string; naoquer?: string
      }
    }

    if (!profile || !profile.nicho) {
      return NextResponse.json({ error: 'NO_PROFILE' }, { status: 400 })
    }

    const ctx = `
NICHO: ${profile.nicho || '—'}
ASSUNTO ESPECÍFICO: ${profile.assunto || '—'}
FORMAÇÕES/EXPERIÊNCIA: ${profile.formacoes || '—'}
RESULTADO JÁ CONQUISTADO: ${profile.resultado || '—'}
DIFERENCIAL: ${profile.diferencial || '—'}
PÚBLICO-ALVO: ${profile.publico || '—'}
DOR PRINCIPAL DO PÚBLICO: ${profile.dor || '—'}
O QUE O PÚBLICO JÁ TENTOU: ${profile.tentou || '—'}
CONCORRENTES/REFERÊNCIAS: ${profile.concorrentes || '—'}
PROPÓSITO: ${profile.proposito || '—'}
RECEIOS: ${profile.receio || '—'}
TEMPO DISPONÍVEL: ${profile.tempo || '—'}
O QUE NÃO QUER FALAR: ${profile.naoquer || '—'}
`.trim()

    // ── PROMPT 1: CLAREZA ──────────────────────────────────────────
    const clarezaPrompt = `Você é um estrategista de posicionamento digital de elite. Com base no perfil abaixo, gere a "Clareza de Nicho" completa deste criador de conteúdo. Escreva em português brasileiro natural, sem markdown, sem listas com traços.

PERFIL DO CRIADOR:
${ctx}

Gere exatamente no formato abaixo (os rótulos em MAIÚSCULAS seguidos de dois pontos, e o conteúdo logo depois):

MANIFESTO:
[3-4 frases poderosas que capturam a essência do posicionamento deste criador — voz autêntica, verdade que ressoa]

DIFERENCIAL COMPETITIVO:
[O que torna este criador único e irreplicável. Seja específico com base nas formações, história e forma de comunicar dele]

TRANSFORMAÇÃO ENTREGUE:
[Antes e depois claro. O que o público ganha ao seguir e aprender com este criador. Use linguagem emocional e concreta]

FRASE DE POSICIONAMENTO:
[Uma frase de 1 linha que resume quem ele ajuda, como e para quê. Ex: "Ajudo [público] a [resultado] através de [método/abordagem]"]

PILARES DE CONTEÚDO:
[4-5 temas/ângulos que este criador deve explorar consistentemente. Um por linha, com 1 frase de explicação cada]

ARMADILHAS A EVITAR:
[3-4 erros comuns no nicho que este criador deve evitar. Um por linha]

PRÓXIMOS PASSOS:
[3 ações concretas e imediatas que este criador deve tomar para acelerar o crescimento. Numeradas]`

    // ── PROMPT 2: PERSONA ──────────────────────────────────────────
    const personaPrompt = `Você é um especialista em pesquisa de audiência e psicologia do consumidor. Com base no perfil abaixo, crie a persona ideal do público-alvo deste criador. Escreva em português brasileiro natural, sem markdown.

PERFIL DO CRIADOR:
${ctx}

Gere exatamente no formato abaixo (os rótulos em MAIÚSCULAS seguidos de dois pontos):

NOME DA PERSONA:
[Nome fictício + idade + profissão. Ex: "Lucas, 34 anos, analista de marketing"]

PERFIL DEMOGRÁFICO:
[Faixa etária, gênero predominante, localização típica, renda aproximada, escolaridade, profissão]

ROTINA DIGITAL:
[Quais plataformas usa, quantas horas por dia, tipo de conteúdo que consome, horários de pico, como descobre novos criadores]

SONHOS E DESEJOS:
[3-4 desejos profundos desta persona. O que ela realmente quer para a vida. Seja específico ao nicho]

DORES E FRUSTRAÇÕES:
[3-4 dores reais desta persona. O que a paralisa, frustra, tira o sono. Frases como ela própria falaria]

OBJEÇÕES:
[3 razões principais pelas quais esta persona ainda não resolveu seu problema. O que a impede de agir]

COMPORTAMENTO DE COMPRA:
[Como ela decide comprar. O que ela precisa ver/ouvir antes de confiar. Quanto costuma investir em soluções do nicho]

INFLUENCIADORES QUE SEGUE:
[Tipos de referências que esta persona consome. Perfis, canais, perfis de quem já segue no nicho]`

    // Chama Gemini em paralelo para ambos
    const [clarezaRes, personaRes] = await Promise.all([
      fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: clarezaPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
        }),
      }),
      fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: personaPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
        }),
      }),
    ])

    const [clarezaData, personaData] = await Promise.all([
      clarezaRes.json(),
      personaRes.json(),
    ])

    const clareza = clarezaData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
    const persona = personaData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''

    if (!clareza && !persona) {
      return NextResponse.json({ error: 'EMPTY_RESPONSE' }, { status: 500 })
    }

    // Extrair usage metadata de ambos e logar
    try {
      const u1 = clarezaData?.usageMetadata
      const u2 = personaData?.usageMetadata
      const totalPrompt = (u1?.promptTokenCount || 0) + (u2?.promptTokenCount || 0)
      const totalCompletion = (u1?.candidatesTokenCount || 0) + (u2?.candidatesTokenCount || 0)

      if (totalPrompt > 0 || totalCompletion > 0) {
        const { logApiUsage } = await import('@/lib/billing')
        await logApiUsage({
          userId: user.id,
          feature: 'gerar_insights',
          modelUsed: 'gemini-2.0-flash',
          promptTokens: totalPrompt,
          completionTokens: totalCompletion
        })
      }
    } catch (err) {
      console.error('[BILLING_ERROR]', err)
    }

    // Salva resposta1 e resposta2 no perfil do usuário
    const { error: saveError } = await supabase
      .from('profiles')
      .update({
        resposta1: clareza || null,
        resposta2: persona || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (saveError) {
      console.error('[gerar-insights] Supabase save error:', saveError)
    }

    return NextResponse.json({ success: true, clareza, persona })
  } catch (err) {
    console.error('[gerar-insights] Error:', err)
    return NextResponse.json({ error: 'UNEXPECTED_ERROR' }, { status: 500 })
  }
}
