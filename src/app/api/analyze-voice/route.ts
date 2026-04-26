import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createServerSupabase } from '@/lib/supabase/server'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // ── Verificar plano e aplicar rate limit ────────────────────────
    const { data: planProfile } = await supabase
      .from('profiles')
      .select('plan_tier, is_admin')
      .eq('id', user.id)
      .single()

    const isPro = (planProfile?.plan_tier && planProfile.plan_tier !== 'free') || planProfile?.is_admin === true
    const maxReqs = isPro ? 20 : 5

    const rl = checkRateLimit(`analyze-voice:${user.id}`, maxReqs, 60_000)
    if (!rl.allowed) {
      return Response.json(
        { error: isPro ? 'Muitas requisições. Aguarde 1 minuto.' : 'Você atingiu o limite do plano gratuito. Faça upgrade para Pro.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      )
    }
    // ────────────────────────────────────────────────────────────────

    const body = await req.json()
    const { sampleTexts } = body

    if (!sampleTexts || !Array.isArray(sampleTexts) || sampleTexts.length === 0) {
      return new Response('Invalid request: sampleTexts array is required', { status: 400 })
    }

    // Prepare system instructions for GPT
    const combinedTexts = sampleTexts.map((t, i) => `TEXTO ${i + 1}:\n${t}`).join('\n\n')

    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        vocabulary: z.array(z.string()).describe('Lista de palavras ou jargões frequentemente usados nos textos.'),
        tone: z.array(z.string()).describe('Lista de adjetivos descrevendo o tom (ex: direto, sarcástico, didático).'),
        formality: z.string().describe('Grau de formalidade dos textos.'),
        emotions: z.array(z.string()).describe('Emoções frequentemente evocadas (ex: urgência, empatia).'),
        formatting: z.string().describe('Como o texto é formatado (ex: uso de emojis, parágrafos curtos, caixa alta).'),
      }),
      prompt: `Analise o estilo de escrita unificado dos textos fornecidos abaixo para entender a "voz" do autor. Extraia o vocabulário típico, o tom, o grau de formalidade, as emoções dominantes e como ele fomata os textos.
      
TEXTOS DE EXEMPLO:
${combinedTexts}`
    })

    if (result.usage) {
      try {
        const { logApiUsage } = await import('@/lib/billing')
        await logApiUsage({
          userId: user.id,
          feature: 'analyze_voice',
          modelUsed: 'gpt-4o-mini',
          promptTokens: result.usage.inputTokens,
          completionTokens: result.usage.outputTokens
        })
      } catch (err) {
        console.error('[BILLING_ERROR]', err)
      }
    }

    return Response.json(result.object)
  } catch (error: any) {
    console.error('[ANALYZE_VOICE_ERROR]', error)
    return new Response(error.message || 'Internal Server Error', { status: 500 })
  }
}
