import { streamText, embed } from 'ai'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { createServerSupabase } from '@/lib/supabase/server'
import { PROMPTS_MATADORES } from './prompts_matadores'
import { ROTEIRISTA_PRO_SKILL, CONTEXTO_CRIADOR } from './pro-context'
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
      .select('plan_tier, is_admin, publico, dor, tentou, diferencial, proposito, naoquer, produto_venda')
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
      // 2. Fetch User Profile for personal context (DNA)
    let userContext = ''
    if (profile && profile.publico) {
      userContext = `
============ DNA DO CLIENTE (CONTEXTO OBRIGATÓRIO) ============
Sempre personalize profundamente suas respostas considerando QUEM é o usuário e QUEM é o público dele:

[O PÚBLICO DO USUÁRIO]
- Quem são: ${profile.publico || 'Não informado'}
- Dores principais: ${profile.dor || 'Não informado'}
- O que já tentaram: ${profile.tentou || 'Não informado'}

[SOBRE O USUÁRIO]
- Diferencial Único: ${profile.diferencial || 'Não informado'}
- Propósito/Missão: ${profile.proposito || 'Não informado'}
- O que NUNCA quer falar sobre: ${profile.naoquer || 'Não informado'}

[PRODUTO]
- O que o usuário vende: ${profile.produto_venda || 'Não informado'}
================================================================
`
    }
      baseSystemPrompt = `
============ DIRETRIZES DA FERRAMENTA (ROTEIRISTA PRO) ============
${ROTEIRISTA_PRO_SKILL}

${userContext}
`
    }

    // 3. Fetch Voice Profile
    // 3. Fetch Voice Profile
    let voiceContext = ''
    if (voiceProfileId) {
      const { data: vp } = await supabase
        .from('voice_profiles')
        .select('enriched_profile, wizard_inputs')
        .eq('id', voiceProfileId)
        .single()
      
      const st = vp?.enriched_profile
      const wi = vp?.wizard_inputs

      if (st || wi) {
        let bordoesArr = wi?.bordoes || []
        let palPref = wi?.palavras_preferidas || []
        let palEvit = wi?.palavras_evitadas || []
        
        voiceContext = `
[INSTRUÇÃO DE TOM DE VOZ / "DNA DO CLIENTE"]
Você DEVE mimetizar o EXATO estilo de escrita deste criador:
- Relação com a audiência: ${wi?.relacao || 'Amigável'}
- Energia: ${wi?.energia || 'Média'}
- Humor: ${wi?.humor || 2}/5
- Vocabulário Formal<>Casual: ${st?.tone_axes?.formal_casual !== undefined ? st.tone_axes.formal_casual : '0.5'} (onde 0=formal e 1=casual)
- Estilo de Frases: ${st?.sentence_style || 'Variado'}
${palPref.length > 0 ? `- Palavras Preferidas (USAR): ${palPref.join(', ')}` : ''}
${palEvit.length > 0 ? `- Palavras Evitadas (NUNCA USAR): ${palEvit.join(', ')}` : ''}
${bordoesArr.length > 0 ? `- Bordões (encaixe de forma orgânica): ${bordoesArr.map((b: any) => `"${b.texto}"`).join(', ')}` : ''}

REGRAS ESTILÍSTICAS DO CRIADOR: ${st?.generation_rules || ''}
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

ADAPTABILIDADE AO USUÁRIO:
1. SE O USUÁRIO FOR VAGO OU NÃO SOUBER O QUE QUER GRAVAR: Assuma a liderança. NÃO faça interrogatórios! Jogue na mesa 3 a 5 ideias criativas e geniais de temas/ganchos e pergunte "Qual dessas você mais gostou?".
2. SE O USUÁRIO DER UMA IDEIA PELA METADE: Valide a ideia, faça no máximo 1 ou 2 perguntas pontuais (bem rápidas) OU preencha os buracos usando seu instinto de copywriter para não deixá-lo pensando muito.
3. SE O USUÁRIO DER A PAUTA COMPLETA E EXIGIR O ROTEIRO: Só escreva a pauta direto.

NUNCA entregue o roteiro final na primeira mensagem a menos que a ideia já venha redondinha. Se você for fazer perguntas, converse de forma natural, seja prestativo, nunca mecânico.

[GATILHO DE ENTREGA FINAL]
QUANDO E SOMENTE QUANDO VOCÊ FOR ENTREGAR O ROTEIRO DEFINITIVO (pronto para ser lido no teleprompter), VOCÊ DEVE OBRIGATORIAMENTE INICIAR SUA MENSAGEM COM A EXATA FLAG A SEGUIR (NA PRIMEIRA LINHA DA RESPOSTA):
[ROTEIRO_FINAL]
Isso sinalizará ao sistema que o script foi gerado e deve ser salvo no banco. Nunca use essa flag se estiver apenas sugerindo ideias, rascunhos ou conversando.
`

    // Builder do System Prompt Master
    const systemPrompt = `
${baseSystemPrompt}

${voiceContext}

${formatContext}

${serperContext}

${memoryContext}

${onboardingContext}

[ARQUITETURA "ANTI-ALUCINAÇÃO" COM CHAIN OF THOUGHT OBRIGATÓRIA]
Você DEVE OBRIGATORIAMENTE estruturar seu processo de pensamento de forma invisível antes de entregar a resposta final. Para isso, use as tags [THINKING] e [/THINKING] da seguinte maneira exata no INÍCIO da sua resposta:

[THINKING]
*   **Identidade & Tom:** [Reflita sobre o tom do criador]
*   **Aderência ao Formato:** [Como os blocos serão aplicados]
*   **Filtro Anti-Alucinação:** [Reflita sobre os dados fornecidos pelo RAG / Pesquisa Web]
*   **Censura de Jargões:** [Lembrete interno: não usarei "Descubra", "Revolucionar", emojis forçados ou jargões rasos de marketing]
[/THINKING]

[ROTEIRO_FINAL]
(Seu Roteiro genial entra aqui embaixo, focado 100% no ser humano)

INSTRUÇÕES FINAIS: Nunca utilize elementos visuais genéricos de banco de imagem (como "Pessoas sorrindo no escritório").
`
    // Selector do Modelo
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Chave OPENAI_API_KEY ausente ou não confirmada na Vercel.")
    }
    
    let selectedModel = openai('gpt-4o-mini')

    if (mode === 'premium' || mode === 'search') {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error("Chave ANTHROPIC_API_KEY ausente na Vercel. Necessário para contas Ouro/Search.")
      }
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

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          controller.close();
        } catch (err: any) {
          console.error('[STREAM ERROR]', err);
          controller.enqueue(
            new TextEncoder().encode(`\n\n❌ Erro Fatal Conectando à IA: ${err.message || String(err)}\n\nA Vercel ou a OpenAI estão rejeitando a requisição.`)
          );
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('[ROTEIRISTA_CORE_ERROR]', error)
    
    // Check developer failures internally
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      console.error('[CRITICAL] Missing AI API Keys in environment.')
    }
    
    // Mostrando o erro real para consertarmos rápido
    return new Response(error.message || 'Nosso servidor de Inteligência Artificial está sobrecarregado ou falhando. Tente gerar novamente.', { status: 500 })
  }
}
