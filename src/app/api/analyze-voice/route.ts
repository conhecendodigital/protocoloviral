import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createServerSupabase } from '@/lib/supabase/server'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

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

    return Response.json(result.object)
  } catch (error: any) {
    console.error('[ANALYZE_VOICE_ERROR]', error)
    return new Response(error.message || 'Internal Server Error', { status: 500 })
  }
}
