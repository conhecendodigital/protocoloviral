import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { blockType, blockText, context } = await req.json()

    if (!blockText || !blockType) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const typeInstructions: Record<string, string> = {
      GANCHO: 'O GANCHO deve prender a atenção nos primeiros 2 segundos. Use uma pergunta provocativa, afirmação chocante, ou promessa de valor irresistível. Seja curto, direto e impactante.',
      DESENVOLVIMENTO: 'O DESENVOLVIMENTO deve entregar valor real, contar uma história envolvente, ou apresentar argumentos convincentes. Use linguagem natural e conversacional.',
      PROBLEMA: 'O PROBLEMA deve identificar uma dor real e específica do público. Seja preciso, empático, e faça a pessoa se sentir reconhecida.',
      SOLUCAO: 'A SOLUÇÃO deve ser clara, direta e resolver o problema apresentado. Posicione como o caminho óbvio e natural.',
      CTA: 'O CTA deve ser direto e criar urgência. Diga exatamente o que a pessoa deve fazer agora. Seja amigável, não pressione.',
      OUTROS: 'Melhore a clareza, fluidez e impacto deste trecho de roteiro. Mantenha o mesmo tema e intenção.',
    }

    const instruction = typeInstructions[blockType] || typeInstructions['OUTROS']

    const msg = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Você é um expert em roteiros virais para o TikTok e Instagram Reels.

Contexto completo do roteiro:
${context}

---

Melhore APENAS o seguinte bloco do tipo ${blockType}:
"${blockText}"

Regra: ${instruction}

RESPONDA APENAS com o texto melhorado. Sem explicações, sem aspas extras, sem prefixos.`
      }]
    })

    const improved = (msg.content[0] as { type: string; text: string }).text
      .replace(/^[""]|[""]$/g, '')
      .trim()

    return NextResponse.json({ improved })
  } catch (err: any) {
    console.error('[IMPROVE_BLOCK]', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
