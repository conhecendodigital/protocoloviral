import { createServerSupabase } from '@/lib/supabase/server'

interface ApiUsageParams {
  userId: string
  feature: string // ex: 'roteirista', 'chat', 'generate-reel'
  modelUsed: string // ex: 'gpt-4o', 'claude-3-5-sonnet', 'elevenlabs'
  promptTokens?: number
  completionTokens?: number
  costUsdOverride?: number | null
  metadata?: Record<string, any>
}

/**
 * Função centralizada para registrar o consumo de qualquer API do sistema
 */
export async function logApiUsage({
  userId,
  feature,
  modelUsed,
  promptTokens = 0,
  completionTokens = 0,
  costUsdOverride = null,
  metadata = {}
}: ApiUsageParams) {
  try {
    const supabase = await createServerSupabase()
    let costUsd = costUsdOverride

    // Se não houver override, calculamos baseados nos tokens (para LLMs de texto)
    if (costUsd === null) {
      let costInputPer1M = 0
      let costOutputPer1M = 0

      const model = modelUsed.toLowerCase()

      if (model.includes('sonnet')) {
        costInputPer1M = 3.00
        costOutputPer1M = 15.00
      } else if (model.includes('gpt-4o') && !model.includes('mini')) {
        costInputPer1M = 5.00
        costOutputPer1M = 15.00
      } else if (model.includes('haiku')) {
        costInputPer1M = 0.25
        costOutputPer1M = 1.25
      } else if (model.includes('gpt-4o-mini')) {
        costInputPer1M = 0.15
        costOutputPer1M = 0.60
      } else if (model.includes('gemini') && model.includes('flash')) {
        costInputPer1M = 0.10
        costOutputPer1M = 0.40
      } else if (model.includes('gemini') && model.includes('pro')) {
        costInputPer1M = 1.25
        costOutputPer1M = 5.00
      } else {
        // Fallback default
        costInputPer1M = 1.00
        costOutputPer1M = 2.00
      }

      costUsd = (promptTokens / 1000000) * costInputPer1M + (completionTokens / 1000000) * costOutputPer1M
    }

    // Conversão BRL
    const costBrl = costUsd * 4.99

    await supabase.from('api_usage_logs').insert({
      user_id: userId,
      feature,
      model_used: modelUsed,
      cost_brl: costBrl,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      metadata
    })

    return { success: true, costBrl }
  } catch (error) {
    console.error('[API_USAGE_LOG_ERROR]', error)
    return { success: false, error }
  }
}
