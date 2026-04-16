import { streamText, embed } from 'ai'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { createServerSupabase } from '@/lib/supabase/server'
import { FORMATOS_VIRAIS_PROMPTS } from '@/lib/prompts/formatos_virais'
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

    if (formatData && formatData.id) {
      if (FORMATOS_VIRAIS_PROMPTS[formatData.id]) {
        formatTitle = formatData.titulo
        formatContext = `
[ESTRUTURA VIRAL REFERÊNCIA]
Baseie a arquitetura do roteiro EXATAMENTE NESTA estrutura comprovada:
Título do Formato: ${formatData.titulo}

${FORMATOS_VIRAIS_PROMPTS[formatData.id]}

[REGRA DE PARIDADE DE BLOCOS — OBRIGATÓRIA]
O roteiro DEVE respeitar rigorosamente a quantidade e os temas dos blocos exigidos na estrutura acima.

NUNCA pule um bloco que consta na [ESTRUTURA OBRIGATÓRIA].
NUNCA adicione blocos extras.
Se a estrutura pedir 3 blocos, seu roteiro terá exatamente 3 blocos. Se pedir 4, terá 4 blocos.
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

    const onboardingContext = `
[PROIBIÇÃO ABSOLUTA DE BATE-PAPO E ONBOARDING LENTO]
NUNCA faça perguntas ao usuário. NUNCA sugira ideias para ele escolher. NUNCA converse.
Sua ÚNICA função é entregar o [ROTEIRO_FINAL] imediatamente com base no tema fornecido, independentemente de quão vaga tenha sido a instrução. Se o usuário der uma ideia vaga, assuma a liderança criativa e invente o resto, mas ENTREGUE O ROTEIRO GERAL NA PRIMEIRA MENSAGEM!

[GATILHO DE ENTREGA FINAL]
VOCÊ DEVE OBRIGATORIAMENTE INICIAR SUA MENSAGEM COM O RACIOCÍNIO SILENCIOSO [THINKING] E LOGO APÓS A EXATA FLAG A SEGUIR:
[ROTEIRO_FINAL]

REGRAS DE FORMATAÇÃO ESTRITAS DO [ROTEIRO_FINAL]:
1. A PRIMEIRA LINHA após a flag [ROTEIRO_FINAL] DEVE OBRIGATORIAMENTE começar com a palavra "TÍTULO:" seguida do título do vídeo. Exemplo: "TÍTULO: Como viralizar rápido".
2. ZERO CONVERSINHA! Nunca escreva "Ótima escolha!", "Aqui está a sugestão:". Após a linha do TÍTULO, inicie IMEDIATAMENTE os blocos do roteiro.
3. FORMATAÇÃO DE TÍTULOS DE BLOCO: A Tag de colchetes de CADA BLOCO deve vir ISOLADA EM UMA LINHA SOZINHA. 
QUEBRA DE LINHA OBRIGATÓRIA: Após fechar o colchete ']', você DEVE apertar ENTER obrigatoriamente. É estritamente PROIBIDO escrever o conteúdo na mesma linha da tag.
NUNCA use "1. **[NOME]:**" ou subtítulos em markdown poluído. Use puramente "[NOME DO BLOCO]". Exemplo OBRIGATÓRIO:

[GANCHO]

(Texto do gancho vai aqui na linha de baixo, nunca colado na tag acima...)
`

    // Builder do System Prompt Master
    const systemPrompt = `
${baseSystemPrompt}

${voiceContext}

${formatContext}

${serperContext}

${memoryContext}

${onboardingContext}

[REGRA DE LINGUAGEM E PROFUNDIDADE — OBRIGATÓRIA]
Escreva como se estivesse explicando para uma pessoa de 12 anos, com frases curtas e palavras do dia a dia.
No entanto, NUNCA entregue um roteiro curto ou superficial! Desenvolva os tópicos com bastante riqueza de detalhes. Se o gancho promete 5 dicas, OBRIGATORIAMENTE entregue todas as 5 dicas profundas. Traga profundidade, ritmo e explicações completas para cada bloco para gerar um roteiro denso e valioso.
Se uma palavra tem um sinônimo mais simples, USE O MAIS SIMPLES.
Exemplo: "otimizar" → "melhorar", "implementar" → "colocar", "estratégia" → "plano", "engajamento" → "atenção".
O público do criador é gente real que usa WhatsApp mais do que Instagram. Fale como gente, não como robô.

[COMANDO DE EXECUÇÃO IMEDIATA - REGRA ABSOLUTA MAIS IMPORTANTE]
É expressamente PROIBIDO cumprimentar o usuário, elogiar a ideia ou fazer introduções amigáveis (como "Ótima ideia", "Demais!", "Vamos estruturar", "Aqui está").
Sua PRIMEIRA palavra absoluta na resposta DEVE ser OBRIGATORIAMENTE a tag [THINKING].
Após fechar a tag [/THINKING], a linha seguinte DEVE ser OBRIGATORIAMENTE a flag [ROTEIRO_FINAL].

[ARQUITETURA DE RESPOSTA OBRIGATÓRIA]
Você DEVE OBRIGATORIAMENTE seguir EXATAMENTE esta estrutura de saída, copiando fielmente as tags entre colchetes. Nunca imprima nada fora desta estrutura:

[THINKING]
* Identidade & Tom: [Reflita sobre o tom do criador]
* Aderência ao Formato: [Estou respeitando os blocos?]
* Simplificação: [Releia cada frase — uma criança entenderia?]
* Censura de Jargões: [Validação interna de palavras banidas]
[/THINKING]
[ROTEIRO_FINAL]
TÍTULO: Seu Título Genial Aqui
[METADADOS hash1="#Palavra" hash2="#Palavra" direcao="💡 Dica"]
[GANCHO]
(Seu texto roteirizado entra aqui embaixo, nunca colado na tag...)
(DEMAIS BLOCOS OBRIGATÓRIOS DO FORMATO ESCOLHIDO)

INSTRUÇÕES FINAIS: Nunca responda fora desta formatação estrita. Nunca converse com o usuário.
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

           // Clean Output: Descartar [THINKING] e remover título do corpo do texto
           const parts = text.split('[ROTEIRO_FINAL]')
           const scriptPart = parts.length > 1 ? parts[parts.length - 1] : text
           const scriptLines = scriptPart.trim().split('\n')
           
           let title = 'Roteiro Gerado'
           let finalScript = scriptPart.trim()
           
           // Acha a primeira linha real de conteúdo
           const firstContentLineIndex = scriptLines.findIndex(line => line.trim() !== '')
           if (firstContentLineIndex !== -1) {
             const firstLine = scriptLines[firstContentLineIndex].trim()
             
             // Se a IA mandou com TÍTULO: ou não tem colchete (não é um bloco), assumimos que é o título
             if (firstLine.toUpperCase().includes('TÍTULO:') || !firstLine.startsWith('[')) {
                title = firstLine.replace(/TÍTULO:/i, '').replace(/\*\*/g, '').replace(/^#+\s*/, '').substring(0, 100).trim() || 'Roteiro Gerado'
                // Remove essa linha pra não poluir os blocos
                scriptLines.splice(0, firstContentLineIndex + 1)
                finalScript = scriptLines.join('\n').trim()
             }
           }
           
           await adminSupabase.from('roteiros').insert({
             user_id: user.id,
             roteiro: finalScript,
             titulo: title,
             nicho: null,
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
