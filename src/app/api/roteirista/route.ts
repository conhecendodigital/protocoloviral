import { streamText, embed } from 'ai'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { createServerSupabase } from '@/lib/supabase/server'
import { PROMPTS_MATADORES } from './prompts_matadores'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { 
      messages = [], 
      mode = 'fast', 
      agentId, 
      voiceProfileId, 
      formatData 
    } = body

    if (!messages || messages.length === 0) {
      return new Response('Messages are required', { status: 400 })
    }

    // Extrapolate topic from the latest user message for limits check & RAG
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
    const topic = lastUserMsg ? lastUserMsg.content : ''

    // 1. Initial Gatekeeper: Only Block if Daily Free Limit is Exceeded. (Premium Credits will be deducted safely in onFinish)
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_tier, is_admin')
      .eq('id', user.id)
      .single()

    const isPro = (profile?.plan_tier && profile.plan_tier !== 'free') || profile?.is_admin === true

    if (!isPro) {
      const startOfDay = new Date()
      startOfDay.setHours(0,0,0,0)
      
      const { count } = await supabase
        .from('roteiros')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfDay.toISOString())

      if (count !== null && count >= 5) {
        return new Response('Limite de 5 roteiros diários atingido.', { status: 403 })
      }
    }

    // 2. Fetch Agent or load Pro Context
    let baseSystemPrompt = ''
    if (agentId) {
      const { data: agent } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single()

      if (!agent) {
        return new Response('Agent not found', { status: 404 })
      }
      baseSystemPrompt = agent.system_prompt
    } else {
      const { ROTEIRISTA_PRO_SKILL, CONTEXTO_CRIADOR } = await import('./pro-context')
      baseSystemPrompt = `
============ DIRETRIZES DA FERRAMENTA (ROTEIRISTA PRO) ============
${ROTEIRISTA_PRO_SKILL}

============ CONTEXTO DO CRIADOR ============
${CONTEXTO_CRIADOR}
`
    }

    // 3. Fetch Voice Profile
    let voiceContext = ''
    if (voiceProfileId) {
      const { data: vp } = await supabase
        .from('voice_profiles')
        .select('extracted_style')
        .eq('id', voiceProfileId)
        .single()
      
      if (vp && vp.extracted_style) {
        voiceContext = `
[INSTRUÇÃO DE TOM DE VOZ / "DNA DO CLIENTE"]
Você DEVE mimetizar o seguinte estilo de escrita:
- Formalidade: ${vp.extracted_style.formality || 'Neutra'}
- Tom: ${(vp.extracted_style.tone || []).join(', ')}
- Emoções Frequentes: ${(vp.extracted_style.emotions || []).join(', ')}
- Vocabulário e Jargões que o usuário gosta: ${(vp.extracted_style.vocabulary || []).join(', ')}
- Formatação comum: ${vp.extracted_style.formatting || 'Espaçada e limpa'}
`
      }
    }

    // 4. Fetch / Map Format Data
    let formatContext = ''
    let formatTitle = null
    let formatNiche = null

    if (formatData && formatData.id) {
      const { data: dbFormat } = await supabase
        .from('formatos')
        .select('*')
        .eq('id', formatData.id)
        .single()
        
      if (dbFormat) {
        formatTitle = dbFormat.titulo
        formatNiche = dbFormat.nicho
        let killerPrompt = ''
        if (dbFormat.nicho) {
          const nic = dbFormat.nicho.toLowerCase().trim()
          if (PROMPTS_MATADORES[nic]) {
            killerPrompt = `\n${PROMPTS_MATADORES[nic]}\n`
          }
        }

        formatContext = `
[ESTRUTURA VIRAL REFERÊNCIA]
Baseie a arquitetura do roteiro NESTA estrutura comprovada (mas não copie as mesmas palavras, apenas o esqueleto e pacing):
Título/Nicho de Referência: ${dbFormat.titulo} (${dbFormat.nicho})
${killerPrompt}
Passo-a-Passo / Estudo do Formato:
${dbFormat.estudo}
`
      }
    }

    // 5. Grounding: Serper API se for mode="search"
    let serperContext = ''
    if (mode === 'search') {
      const serperKey = process.env.SERPER_API_KEY
      if (serperKey) {
        try {
          const sRes = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
              'X-API-KEY': serperKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ q: topic })
          })
          const sData = await sRes.json()
          if (sData.organic && sData.organic.length > 0) {
            const facts = sData.organic.slice(0, 4).map((r: any) => `- ${r.title}: ${r.snippet}`).join('\n')
            serperContext = `
[INFORMAÇÕES EM TEMPO REAL DA INTERNET MUNDIAL (GROUNDING / ANTI-ALUCINAÇÃO)]
Integre esses fatos REAIS e ATUAIS em sua resposta para manter total precisão:
${facts}
`
          }
        } catch (e) {
          console.error('[SERPER ERROR]', e)
        }
      }
    }

    // 6. RAG Retrieval (Memória) se for mode="premium"
    let memoryContext = ''
    if (mode === 'premium') {
      try {
        const { embedding } = await embed({
          model: openai.embedding('text-embedding-3-small'),
          value: topic,
        })
        const { data: mems } = await supabase.rpc('match_memorias', {
          query_embedding: embedding,
          match_threshold: 0.5,
          match_count: 2,
          filter_user_id: user.id
        })
        if (mems && mems.length > 0) {
          const mTexts = mems.map((m: any) => m.content.substring(0, 500)).join('\n\n---\n\n')
          memoryContext = `
[MEMÓRIA DE PROJETOS PASSADOS (RAG)]
Para manter consistência, aqui estão trechos das suas criações passadas sobre temas semelhantes:
${mTexts}
`
        }
      } catch (e) {
        console.error('[RAG ERROR]', e)
      }
    }

    const onboardingContext = mode === 'analyze' || messages.length > 6 ? '' : `
[DIRETRIZ DE CO-CRIAÇÃO E ONBOARDING]
Você atua como um Consultor Estratégico e Roteirista Profissional em uma sessão interativa.
O usuário enviará o contexto primário. NUNCA ENTREGUE UM ROTEIRO PRONTO NA PRIMEIRA OU SEGUNDA MENSAGEM (a menos que ele já tenha dado absolutamente TODOS os detalhes necessários e exija isso).
Sua primeira resposta deve confirmar o entendimento, fazer alguns elogios e DEVOLVER AO USUÁRIO 1 a 3 perguntas essenciais (exemplo: público-alvo, promessa/gancho, tom, formato ou objeções) para preencher lacunas e enriquecer o roteiro. Converse de forma natural e engajante. Apenas diga coisas como: "Ótima ideia! Para o roteiro sair perfeito, me conta x, y e z...".

[GATILHO DE ENTREGA FINAL]
Apenas quando o usuário já tiver respondido suas dúvidas e você tiver total clareza do pedido, entregue o roteiro completo.
QUANDO E SOMENTE QUANDO VOCÊ FOR ENTREGAR O ROTEIRO DEFINITIVO IMPRESSO NA TELA, VOCÊ DEVE OBRIGATORIAMENTE INICIAR SUA MENSAGEM COM A EXATA FLAG A SEGUIR (NA PRIMEIRA LINHA DA RESPOSTA):
[ROTEIRO_FINAL]
Isso sinalizará ao sistema que o script foi gerado e deve ser registrado.
`

    // Builder do System Prompt Master
    const systemPrompt = `
${baseSystemPrompt}

${voiceContext}

${formatContext}

${serperContext}

${memoryContext}

${onboardingContext}

INSTRUÇÕES FINAIS: Nunca utilize elementos visuais genéricos de banco de imagem (como "Pessoas sorrindo no escritório").
`
    // Selector do Modelo
    let selectedModel = openai('gpt-4o-mini')
    if (mode === 'premium' || mode === 'search') {
      selectedModel = anthropic('claude-3-5-sonnet-20241022') as any
    }

    // Stream out
    const result = streamText({
      model: selectedModel,
      system: systemPrompt,
      messages: messages,
      onFinish: async ({ text }) => {
        // Only save to DB and deduct exact credits if the AI actually generated the final script!
        if (!text.includes('[ROTEIRO_FINAL]') && mode !== 'analyze') {
          return;
        }

        try {
           const adminSupabase = createClient(
             process.env.NEXT_PUBLIC_SUPABASE_URL!,
             process.env.SUPABASE_SERVICE_ROLE_KEY!
           )
           
           // Deduct Premium/Search Credit right at the end!
           if (mode === 'premium' || mode === 'search') {
              const { data: credits, error: creditErr } = await adminSupabase
                .from('creditos_mensais')
                .select('*')
                .eq('user_id', user.id)
                .single()

              if (!creditErr && credits && (credits.credits_total - credits.credits_used) >= 1) {
                await adminSupabase
                  .from('creditos_mensais')
                  .update({ credits_used: credits.credits_used + 1 })
                  .eq('id', credits.id)
              }
           }

           // Clean Output
           const finalScript = text.replace(/\[ROTEIRO_FINAL\]/g, '').trim()
           const lines = finalScript.split('\n')
           const firstLine = lines.find(line => line.trim() !== '') || ''
           const title = firstLine.replace(/\*\*/g, '').replace(/^#+\s*/, '').substring(0, 100).trim() || 'Roteiro Gerado'
           
           await adminSupabase.from('roteiros').insert({
             user_id: user.id,
             roteiro: finalScript,
             titulo: title,
             nicho: formatNiche,
             formato_nome: formatTitle
           })
        } catch (e) {
          console.error('[ON_FINISH_SAVE_ERROR]', e)
        }
      }
    })

    return result.toTextStreamResponse()

  } catch (error: any) {
    console.error('[ROTEIRISTA_CORE_ERROR]', error)
    return new Response(error.message || 'Internal Server Error', { status: 500 })
  }
}
