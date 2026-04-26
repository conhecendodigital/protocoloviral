import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { createServerSupabase } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Verificar plano e aplicar rate limit ────────────────────────
    const { data: planProfile } = await supabase
      .from('profiles')
      .select('plan_tier, is_admin')
      .eq('id', user.id)
      .single()

    const isPro = (planProfile?.plan_tier && planProfile.plan_tier !== 'free') || planProfile?.is_admin === true
    const maxReqs = isPro ? 30 : 10

    const rl = checkRateLimit(`improve-block:${user.id}`, maxReqs, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: isPro ? 'Muitas requisições. Aguarde 1 minuto.' : 'Você atingiu o limite do plano gratuito. Faça upgrade para Pro.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      )
    }
    // ────────────────────────────────────────────────────────────────

    const { blockType, blockText, context, variations, mode, instruction } = await req.json()

    if (!blockText || !blockType) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    // ── HOOK with 3 variations ──
    if (blockType === 'GANCHO' && variations) {
      const { text, usage } = await generateText({
        model: anthropic('claude-haiku-4-5-20251001'),
        maxOutputTokens: 600,
        prompt: `Você é um expert em ganchos virais para TikTok e Instagram Reels.

Contexto do roteiro:
${context}

Gancho atual: "${blockText}"

Gere EXATAMENTE 3 versões alternativas do gancho, cada uma usando um gatilho psicológico diferente:
1. VERDADE CHOCANTE — revela algo que as pessoas não sabem / contradiz uma crença
2. PERGUNTA PROVOCATIVA — faz a pessoa se identificar ou sentir medo de estar errando
3. ANTES E DEPOIS — conta de forma rápida uma transformação de resultado

RESPONDA APENAS neste formato JSON (sem markdown, sem explicações):
{"variations":["gancho 1 aqui","gancho 2 aqui","gancho 3 aqui"]}

Cada gancho deve ter NO MÁXIMO 12 palavras. Sem aspas internas. Sem introduções.`,
      })

      if (usage) {
        try {
          const { logApiUsage } = await import('@/lib/billing')
          await logApiUsage({
            userId: user.id,
            feature: 'improve_block_gancho',
            modelUsed: 'claude-haiku-4-5-20251001',
            promptTokens: usage.inputTokens,
            completionTokens: usage.outputTokens
          })
        } catch (err) {
          console.error('[BILLING_ERROR]', err)
        }
      }

      const raw = text.trim()

      // Strip markdown code fences if model wrapped the JSON (```json ... ```)
      const stripped = raw
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim()

      try {
        const parsed = JSON.parse(stripped)
        if (Array.isArray(parsed.variations) && parsed.variations.length > 0) {
          return NextResponse.json({ variations: parsed.variations.slice(0, 3) })
        }
        throw new Error('bad shape')
      } catch {
        // Regex fallback: extract all "quoted strings" from the raw response
        const matches = [...stripped.matchAll(/"([^"]{10,})"/g)]
          .map(m => m[1].trim())
          .filter(s => !s.startsWith('{') && !s.includes('variations') && s.length > 5)
          .slice(0, 3)

        if (matches.length > 0) {
          return NextResponse.json({ variations: matches })
        }

        // Last resort: numbered lines (1. text or - text)
        const fallback = stripped
          .split('\n')
          .map((l: string) => l.replace(/^[\d]+[.)]\s*/, '').replace(/^[-•]\s*/, '').replace(/^[""]|[""]$/g, '').trim())
          .filter((l: string) => l.length > 10 && !l.startsWith('{') && !l.startsWith('"variations'))
          .slice(0, 3)

        return NextResponse.json({ variations: fallback })
      }
    }

    // ── REGENERATE — reescreve do zero ──
    if (mode === 'regenerate') {
      const typeGoals: Record<string, string> = {
        GANCHO: 'Crie um novo GANCHO poderoso que prenda atenção nos primeiros 2 segundos. Use pergunta provocativa, afirmação chocante ou promessa irresistível. Máximo 15 palavras.',
        DESENVOLVIMENTO: 'Escreva um novo DESENVOLVIMENTO que entregue valor real e seja envolvente. Use linguagem conversacional e natural. Expanda com clareza.',
        PROBLEMA: 'Escreva um PROBLEMA que identifique uma dor específica do público. Seja empático e preciso. Máximo 3 frases.',
        SOLUCAO: 'Escreva uma SOLUÇÃO clara e direta para o problema apresentado. Seja objetivo e mostre o caminho natural. Máximo 3 frases.',
        CTA: 'Escreva um CTA direto e amigável que gere urgência. Diga exatamente o que fazer agora. Máximo 2 frases.',
        OUTROS: 'Escreva um trecho novo, fluido e impactante que se encaixe no roteiro. Mantenha o mesmo tema.',
      }

      const goal = typeGoals[blockType] || typeGoals['OUTROS']
      const instructionLine = instruction ? `\n\nInstrução adicional do criador: "${instruction}"` : ''

      const { text: improved, usage } = await generateText({
        model: anthropic('claude-haiku-4-5-20251001'),
        maxOutputTokens: 500,
        prompt: `Você é um expert em roteiros virais para TikTok e Instagram Reels.

Contexto completo do roteiro:
${context}

---

TAREFA: Reescreva completamente o bloco do tipo ${blockType} do zero (ignore o texto atual).
${goal}${instructionLine}

RESPONDA APENAS com o novo texto. Sem explicações, sem aspas, sem prefixos.`,
      })

      if (usage) {
        try {
          const { logApiUsage } = await import('@/lib/billing')
          await logApiUsage({
            userId: user.id,
            feature: 'improve_block_regenerate',
            modelUsed: 'claude-haiku-4-5-20251001',
            promptTokens: usage.inputTokens,
            completionTokens: usage.outputTokens
          })
        } catch (err) {
          console.error('[BILLING_ERROR]', err)
        }
      }

      return NextResponse.json({
        improved: improved.replace(/^["""„‟]|["""„‟]$/g, '').trim(),
      })
    }

    // ── IMPROVE — refina o bloco existente ──
    const typeInstructions: Record<string, string> = {
      GANCHO: 'O GANCHO deve prender a atenção nos primeiros 2 segundos. Use uma pergunta provocativa, afirmação chocante, ou promessa de valor irresistível. Seja curto, direto e impactante.',
      DESENVOLVIMENTO: 'O DESENVOLVIMENTO deve entregar valor real, contar uma história envolvente, ou apresentar argumentos convincentes. Use linguagem natural e conversacional.',
      PROBLEMA: 'O PROBLEMA deve identificar uma dor real e específica do público. Seja preciso, empático, e faça a pessoa se sentir reconhecida.',
      SOLUCAO: 'A SOLUÇÃO deve ser clara, direta e resolver o problema apresentado. Posicione como o caminho óbvio e natural.',
      CTA: 'O CTA deve ser direto e criar urgência. Diga exatamente o que a pessoa deve fazer agora. Seja amigável, não pressione.',
      OUTROS: 'Melhore a clareza, fluidez e impacto deste trecho de roteiro. Mantenha o mesmo tema e intenção.',
    }

    const blockInstruction = typeInstructions[blockType] || typeInstructions['OUTROS']

    const { text: improved, usage } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      maxOutputTokens: 400,
      prompt: `Você é um expert em roteiros virais para o TikTok e Instagram Reels.

Contexto completo do roteiro:
${context}

---

Melhore APENAS o seguinte bloco do tipo ${blockType}:
"${blockText}"

Regra: ${blockInstruction}

RESPONDA APENAS com o texto melhorado. Sem explicações, sem aspas extras, sem prefixos.`,
    })

    if (usage) {
      try {
        const { logApiUsage } = await import('@/lib/billing')
        await logApiUsage({
          userId: user.id,
          feature: 'improve_block_refine',
          modelUsed: 'claude-haiku-4-5-20251001',
          promptTokens: usage.inputTokens,
          completionTokens: usage.outputTokens
        })
      } catch (err) {
        console.error('[BILLING_ERROR]', err)
      }
    }

    return NextResponse.json({
      improved: improved.replace(/^["""„‟]|["""„‟]$/g, '').trim(),
    })
  } catch (err: any) {
    console.error('[IMPROVE_BLOCK]', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
