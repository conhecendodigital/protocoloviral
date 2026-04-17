import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function POST(req: NextRequest) {
  try {
    const { blockType, blockText, context, variations } = await req.json()

    if (!blockText || !blockType) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    // ── HOOK with 3 variations ──
    if (blockType === 'GANCHO' && variations) {
      const { text } = await generateText({
        model: anthropic('claude-haiku-4-5-20251001'),
        maxTokens: 600,
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

      const raw = text.trim()
      try {
        const parsed = JSON.parse(raw)
        return NextResponse.json({ variations: parsed.variations })
      } catch {
        // Fallback: extract non-empty lines
        const lines = raw.split('\n').filter(l => l.trim().length > 5).slice(0, 3)
        return NextResponse.json({ variations: lines })
      }
    }

    // ── Single block improvement ──
    const typeInstructions: Record<string, string> = {
      GANCHO: 'O GANCHO deve prender a atenção nos primeiros 2 segundos. Use uma pergunta provocativa, afirmação chocante, ou promessa de valor irresistível. Seja curto, direto e impactante.',
      DESENVOLVIMENTO: 'O DESENVOLVIMENTO deve entregar valor real, contar uma história envolvente, ou apresentar argumentos convincentes. Use linguagem natural e conversacional.',
      PROBLEMA: 'O PROBLEMA deve identificar uma dor real e específica do público. Seja preciso, empático, e faça a pessoa se sentir reconhecida.',
      SOLUCAO: 'A SOLUÇÃO deve ser clara, direta e resolver o problema apresentado. Posicione como o caminho óbvio e natural.',
      CTA: 'O CTA deve ser direto e criar urgência. Diga exatamente o que a pessoa deve fazer agora. Seja amigável, não pressione.',
      OUTROS: 'Melhore a clareza, fluidez e impacto deste trecho de roteiro. Mantenha o mesmo tema e intenção.',
    }

    const instruction = typeInstructions[blockType] || typeInstructions['OUTROS']

    const { text: improved } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      maxTokens: 400,
      prompt: `Você é um expert em roteiros virais para o TikTok e Instagram Reels.

Contexto completo do roteiro:
${context}

---

Melhore APENAS o seguinte bloco do tipo ${blockType}:
"${blockText}"

Regra: ${instruction}

RESPONDA APENAS com o texto melhorado. Sem explicações, sem aspas extras, sem prefixos.`,
    })

    return NextResponse.json({
      improved: improved.replace(/^[""]|[""]$/g, '').trim(),
    })
  } catch (err: any) {
    console.error('[IMPROVE_BLOCK]', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
