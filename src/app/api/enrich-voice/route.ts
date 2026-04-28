import { createServerSupabase } from '@/lib/supabase/server'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { checkRateLimit } from '@/lib/rate-limit'

export const maxDuration = 30

const RELACAO_MAP: Record<string, string> = {
  professor: 'Professor — ensina com paciência, guia passo a passo',
  amigo: 'Amigo — fala de igual, linguagem solta',
  provocador: 'Provocador — desafia, cutuca, questiona crenças',
  mentor: 'Mentor — autoridade com experiência real',
  comediante: 'Comediante — usa humor para ensinar',
  hipeman: 'Hipeman — energia alta, motivacional',
}

const RITMO_MAP: Record<string, string> = {
  rapido: '~200 palavras/min (ritmo acelerado)',
  medio: '~150 palavras/min (conversa natural)',
  pausado: '~100 palavras/min (tom calmo)',
}

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
    const maxReqs = isPro ? 15 : 3

    const rl = checkRateLimit(`enrich-voice:${user.id}`, maxReqs, 60_000)
    if (!rl.allowed) {
      return Response.json(
        { error: isPro ? 'Muitas requisições. Aguarde 1 minuto.' : 'Você atingiu o limite do plano gratuito. Faça upgrade para Pro.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      )
    }
    // ────────────────────────────────────────────────────────────────

    const { profile_id, wizard_inputs } = await req.json()

    if (!wizard_inputs) {
      return Response.json({ error: 'wizard_inputs required' }, { status: 400 })
    }

    const {
      relacao = 'amigo',
      energia = 'media',
      ritmo = 'medio',
      registro = 'coloquial',
      humor = 2,
      bordoes = [],
      palavras_preferidas = [],
      palavras_evitadas = [],
      instrucoes_adicionais = '',
    } = wizard_inputs

    const bordoesText = bordoes.length > 0
      ? bordoes.map((b: any) => `"${b.texto}" (posição: ${b.posicao})`).join(', ')
      : 'Nenhum bordão definido'

    const prompt = `Você é um especialista em análise de comunicação e brand voice.
Receberá as preferências de um criador de conteúdo brasileiro e deve gerar um perfil de voz COMPLETO e DETALHADO em JSON.

═══════════════════════════════
PREFERÊNCIAS DO CRIADOR
═══════════════════════════════
Relação com audiência: ${RELACAO_MAP[relacao] || relacao}
Energia: ${energia}
Ritmo de fala: ${RITMO_MAP[ritmo] || ritmo}
Registro linguístico: ${registro}
Nível de humor: ${humor}/5
Bordões: ${bordoesText}
Palavras preferidas: ${palavras_preferidas.length > 0 ? palavras_preferidas.join(', ') : 'Nenhuma'}
Palavras evitadas: ${palavras_evitadas.length > 0 ? palavras_evitadas.join(', ') : 'Nenhuma'}
Instruções adicionais: ${instrucoes_adicionais || 'Nenhuma'}

═══════════════════════════════
GERE O SEGUINTE JSON (e SOMENTE o JSON, sem markdown, sem texto extra):
═══════════════════════════════

{
  "schema_version": "1.0",
  "tone_axes": {
    "formal_casual": [0.0-1.0, 0.0=formal, 1.0=casual],
    "serious_playful": [0.0-1.0, 0.0=sério, 1.0=brincalhão],
    "expert_accessible": [0.0-1.0, 0.0=técnico, 1.0=acessível],
    "direct_narrative": [0.0-1.0, 0.0=direto, 1.0=storytelling]
  },
  "sentence_style": "short-punchy | medium-varied | long-flowing",
  "vocabulary": "everyday | precise | technical | elevated",
  "opening_patterns": ["5 padrões de abertura (ganchos) deste tom em PT-BR"],
  "structural_patterns": ["3-5 padrões de organização de conteúdo em PT-BR"],
  "taboo_patterns": ["5-8 coisas que este tom NUNCA faria, em PT-BR"],
  "generation_rules": "Texto de ~300 palavras com regras detalhadas de como escrever neste tom. Inclua: tipo de frase, pontuação, uso de gírias, nível de formalidade, como fazer transições, como fechar, ritmo de construção de argumento. Em PT-BR.",
  "sample_outputs": {
    "gancho": "Exemplo de gancho de 2 linhas neste tom exato, em PT-BR",
    "desenvolvimento": "Exemplo de desenvolvimento de 3-4 linhas neste tom, em PT-BR",
    "cta": "Exemplo de CTA de 1-2 linhas neste tom, em PT-BR"
  }
}

IMPORTANTE:
- Os tone_axes devem ser números decimais precisos (ex: 0.72, não 0.5)
- Todos os textos em português brasileiro
- Os sample_outputs devem usar os bordões e palavras preferidas do criador quando definidos
- Retorne SOMENTE o JSON puro, sem \`\`\`json ou markdown`

    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      maxOutputTokens: 1500,
      temperature: 0.7,
    })

    if (result.usage) {
      try {
        const { logApiUsage } = await import('@/lib/billing')
        await logApiUsage({
          userId: user.id,
          feature: 'enrich_voice',
          modelUsed: 'gpt-4o-mini',
          promptTokens: result.usage.inputTokens,
          completionTokens: result.usage.outputTokens
        })
      } catch (err) {
        console.error('[BILLING_ERROR]', err)
      }
    }

    let enrichedProfile: Record<string, any> = {}

    try {
      // Limpar possíveis wrappers de markdown
      let cleanText = result.text.trim()
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }
      enrichedProfile = JSON.parse(cleanText)
      enrichedProfile.enriched_at = new Date().toISOString()
      enrichedProfile.enrichment_model = 'gpt-4o-mini'
    } catch (parseError) {
      console.error('Failed to parse enrichment JSON:', parseError)
      // Fallback: gerar perfil básico sem IA
      enrichedProfile = {
        schema_version: '1.0',
        tone_axes: {
          formal_casual: registro === 'informal' ? 0.9 : registro === 'polido' ? 0.2 : 0.6,
          serious_playful: humor / 5,
          expert_accessible: relacao === 'professor' ? 0.4 : 0.75,
          direct_narrative: energia === 'alta' ? 0.3 : 0.6,
        },
        sentence_style: energia === 'alta' ? 'short-punchy' : energia === 'baixa' ? 'long-flowing' : 'medium-varied',
        vocabulary: registro === 'informal' ? 'everyday' : registro === 'polido' ? 'elevated' : 'precise',
        opening_patterns: [],
        structural_patterns: [],
        taboo_patterns: [],
        generation_rules: `Tom: ${relacao}, Energia: ${energia}, Registro: ${registro}, Humor: ${humor}/5`,
        sample_outputs: { gancho: '', desenvolvimento: '', cta: '' },
        enriched_at: new Date().toISOString(),
        enrichment_model: 'fallback',
      }
    }

    // Salvar no Supabase se profile_id fornecido (filtra por user_id para prevenir IDOR)
    if (profile_id) {
      await supabase
        .from('voice_profiles')
        .update({ enriched_profile: enrichedProfile, updated_at: new Date().toISOString() })
        .eq('id', profile_id)
        .eq('user_id', user.id)
    }

    return Response.json({ enriched_profile: enrichedProfile })
  } catch (error) {
    console.error('Enrich Voice Error:', error)
    return Response.json({ error: 'Erro ao enriquecer perfil de voz' }, { status: 500 })
  }
}
