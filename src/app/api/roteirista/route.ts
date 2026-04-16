import { streamText, embed } from 'ai'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { createServerSupabase } from '@/lib/supabase/server'
import { FORMATOS_VIRAIS_PROMPTS } from '@/lib/prompts/formatos_virais'
import { ROTEIRISTA_PRO_SKILL } from './pro-context'
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

    // Ultimo msg do usuario — usado para RAG e Serper
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')
    const topic = lastUserMsg ? lastUserMsg.content : ''

    // ─── 1. GATEKEEPER: limite diario free ───────────────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_tier, is_admin, publico, dor, tentou, diferencial, proposito, naoquer, produto_venda')
      .eq('id', user.id)
      .single()

    const isPro = (profile?.plan_tier && profile.plan_tier !== 'free') || profile?.is_admin === true

    if (!isPro) {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const { count } = await supabase
        .from('roteiros')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfDay.toISOString())

      if (count !== null && count >= 5) {
        return new Response('Limite de 5 roteiros diarios atingido.', { status: 403 })
      }
    }

    // ─── 2. BASE DO SYSTEM PROMPT ────────────────────────────────────────────
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
      let userContext = ''
      if (profile?.publico) {
        userContext = [
          '============ DNA DO CLIENTE (CONTEXTO OBRIGATORIO) ============',
          'Personalize profundamente o roteiro considerando QUEM e o usuario e QUEM e o publico dele:',
          '',
          '[O PUBLICO DO USUARIO]',
          '- Quem sao: ' + profile.publico,
          '- Dores principais: ' + (profile.dor || 'Nao informado'),
          '- O que ja tentaram: ' + (profile.tentou || 'Nao informado'),
          '',
          '[SOBRE O USUARIO]',
          '- Diferencial Unico: ' + (profile.diferencial || 'Nao informado'),
          '- Proposito/Missao: ' + (profile.proposito || 'Nao informado'),
          '- O que NUNCA quer abordar: ' + (profile.naoquer || 'Nao informado'),
          '',
          '[PRODUTO]',
          '- O que o usuario vende: ' + (profile.produto_venda || 'Nao informado'),
          '================================================================',
        ].join('\n')
      }

      baseSystemPrompt = [
        '============ ROTEIRISTA PRO — DIRETRIZES COMPLETAS ============',
        ROTEIRISTA_PRO_SKILL,
        '',
        userContext,
      ].join('\n')
    }

    // ─── 3. TOM DE VOZ ───────────────────────────────────────────────────────
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
        const bordoesArr: any[] = wi?.bordoes || []
        const palPref: string[] = wi?.palavras_preferidas || []
        const palEvit: string[] = wi?.palavras_evitadas || []

        const voiceLines = [
          '[TOM DE VOZ DO CRIADOR — SEGUIR A RISCA]',
          'Mimetize o EXATO estilo de escrita deste criador:',
          '- Relacao com a audiencia: ' + (wi?.relacao || 'Amigavel'),
          '- Energia: ' + (wi?.energia || 'Media'),
          '- Humor: ' + (wi?.humor || 2) + '/5',
          '- Vocabulario (0=formal, 1=casual): ' + (st?.tone_axes?.formal_casual ?? '0.5'),
          '- Estilo de Frases: ' + (st?.sentence_style || 'Variado'),
        ]
        if (palPref.length > 0) voiceLines.push('- Palavras OBRIGATORIAS: ' + palPref.join(', '))
        if (palEvit.length > 0) voiceLines.push('- Palavras PROIBIDAS: ' + palEvit.join(', '))
        if (bordoesArr.length > 0) voiceLines.push('- Bordoes (use organicamente): ' + bordoesArr.map((b: any) => '"' + b.texto + '"').join(', '))
        if (st?.generation_rules) voiceLines.push('- Regras estilisticas: ' + st.generation_rules)

        voiceContext = voiceLines.join('\n')
      }
    }

    // ─── 4. FORMATO VIRAL ────────────────────────────────────────────────────
    let formatContext = ''
    let formatTitle: string | null = null

    if (formatData?.id && FORMATOS_VIRAIS_PROMPTS[formatData.id]) {
      // Formato selecionado: usa duracao do video real — cap 90s
      formatTitle = formatData.titulo
      const duracaoRaw = formatData.duracao ? Math.round(parseFloat(formatData.duracao)) : 50
      const duracaoClamped = Math.min(duracaoRaw, 90)
      const engajamentoRef = formatData.engajamento ? formatData.engajamento + '%' : 'nao informado'

      formatContext = [
        '[ESTRUTURA VIRAL REFERENCIA — SEGUIR EXATAMENTE]',
        'Titulo do Formato: ' + formatData.titulo,
        'DURACAO OBRIGATORIA: ' + duracaoClamped + ' segundos',
        'O roteiro DEVE ter exatamente esse tempo lido em voz alta em ritmo natural.',
        'Nem mais curto (perde valor), nem mais longo (mata retencao).',
        'Engajamento do video original: ' + engajamentoRef,
        '',
        FORMATOS_VIRAIS_PROMPTS[formatData.id],
        '',
        '[REGRA DE PARIDADE DE BLOCOS — ABSOLUTA]',
        'Respeite rigorosamente a quantidade e nomes dos blocos da estrutura acima.',
        'NUNCA pule um bloco. NUNCA adicione blocos extras.',
      ].join('\n')

    } else {
      // Sem formato: duracao automatica baseada no arquetipo
      formatContext = [
        '[DURACAO AUTOMATICA — DADOS REAIS DE VIRAIS]',
        'Escolha o arquetipo mais adequado ao tema e aplique a duracao correspondente.',
        'A duracao nao e sugestao — e especificacao tecnica do formato.',
        'Ritmo de fala natural: 2,5 palavras por segundo. Conte as palavras antes de entregar.',
        '',
        'FAIXA CURTA — 7 a 30 segundos (alcance maximo, topo de funil)',
        'CERTO vs ERRADO visual:   8 a 12s  | Problema > Contraste visual > fim',
        'TUTORIAL ULTRA-RAPIDO:    20 a 28s | Pergunta > 3 passos > CTA',
        'PROBLEMA SOLUCAO direto:  23 a 30s | Erro > Solucao imediata > CTA salvar',
        '',
        'FAIXA MEDIA — 33 a 65 segundos (PADRAO RECOMENDADO)',
        'DM automation, engajamento real, equilibrio alcance e profundidade.',
        'BASTIDORES COMPARACAO:    33 a 35s | Produto A vs B > Diferencial > CTA',
        'MISTERIO SOLUCAO 3x:      34s      | Nao sabe ainda > Acao e Beneficio x3 > CTA',
        'PROBLEMA SOLUCAO lista:   35 a 38s | Promessa > Problema e Solucao x5 > CTA salvar',
        'QUIZ INTERATIVO:          37s      | Pergunta e Resposta e Explicacao x3 > CTA',
        'REACT ANALISE:            40 a 41s | Problema > Hipotese > Experimento > CTA',
        'ANCORAGEM CORPORAL:       52 a 53s | Pergunta chocante > Descredita > Solucao > CTA',
        'TUTORIAL AUTORIDADE:      55 a 65s | Descoberta > Tutorial > CTA seguir',
        'LISTA ERROS:              63 a 65s | X erros > 5 demonstracoes > CTA',
        '',
        'FAIXA LONGA — 69 a 90 segundos (autoridade profunda, storytelling)',
        'LIMITE MAXIMO: 90 segundos. NUNCA ultrapasse.',
        'Acima de 90s exige habilidade excepcional — a plataforma nao garante esse nivel.',
        'TUTORIAL HACK:            69 a 79s | Noticia > Hack > Como fazer > CTA',
        'ANCORAGEM IA TECH:        80 a 90s | Problema chocante > Solucao tech > Casos > CTA',
        'REACT VIRAL:              80 a 90s | Video viral > Explicacao > Impacto > CTA',
        'ANCORAGEM EMOCIONAL:      80 a 90s | Historia de tensao > Resolucao > Licao > CTA',
      ].join('\n')
    }

    // ─── 5. GROUNDING SERPER (mode=search) ───────────────────────────────────
    let serperContext = ''
    if (mode === 'search') {
      const serperKey = process.env.SERPER_API_KEY
      if (serperKey) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 4000)

          const sRes = await Promise.race([
            fetch('https://google.serper.dev/search', {
              method: 'POST',
              headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
              body: JSON.stringify({ q: topic }),
              signal: controller.signal
            }),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3500))
          ])

          const sData = await Promise.race([
            (sRes as Response).json(),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('body timeout')), 2000))
          ]) as any

          clearTimeout(timeoutId)

          if (sData?.organic?.length > 0) {
            const facts = sData.organic
              .slice(0, 4)
              .map((r: any) => '- ' + r.title + ': ' + r.snippet)
              .join('\n')

            serperContext = [
              '[FATOS REAIS — USE PARA EMBASAR O ROTEIRO]',
              'Integre esses dados atuais para dar credibilidade:',
              facts,
            ].join('\n')
          }
        } catch (e) {
          console.error('[SERPER ERROR]', e)
        }
      }
    }

    // ─── 6. MEMORIA RAG (mode=premium) ───────────────────────────────────────
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
          const mTexts = mems
            .map((m: any) => m.content.substring(0, 500))
            .join('\n\n---\n\n')

          memoryContext = [
            '[MEMORIA DE CONTEUDOS PASSADOS]',
            'Use para manter consistencia e evitar repeticao de temas:',
            mTexts,
          ].join('\n')
        }
      } catch (e) {
        console.error('[RAG ERROR]', e)
      }
    }

    // ─── 7. SYSTEM PROMPT MASTER ─────────────────────────────────────────────
    const systemPrompt = [
      baseSystemPrompt,
      voiceContext,
      formatContext,
      serperContext,
      memoryContext,
      '================================================================',
      'REGRAS DE EXECUCAO — ABSOLUTAS E INVIOLAVEIS',
      '================================================================',
      '',
      '[ENTREGA IMEDIATA — REGRA NUMERO 1]',
      'Sua PRIMEIRA palavra na resposta e [THINKING]. Nada antes disso.',
      'Apos [/THINKING], a proxima linha e [ROTEIRO_FINAL]. Nada entre eles.',
      'PROIBIDO: cumprimentar, elogiar, introducao, perguntar, sugerir opcoes.',
      'PROIBIDO: "Otima ideia!", "Aqui esta:", "Vamos criar", "Claro!", qualquer conversa.',
      'Se o tema for vago — assuma, crie, entregue. Nunca peca confirmacao.',
      '',
      '[TAMANHO E DENSIDADE]',
      'Profundidade NAO significa comprimento.',
      'Cada frase deve ser densa, direta e impactante.',
      'O roteiro DEVE ter exatamente o tempo do arquetipo — nem uma linha a mais.',
      'Uma frase certeira vale mais que tres medianas.',
      'Linguagem simples: "melhorar" nao "otimizar", "colocar" nao "implementar".',
      '',
      '[FORMATACAO OBRIGATORIA DE CADA BLOCO]',
      'Tag do bloco em linha propria.',
      'Linha em branco apos cada tag.',
      'UMA frase por linha — ENTER apos cada frase.',
      'Instrucao visual entre parenteses em linha propria.',
      '[PAUSA] e [CORTE] em linhas proprias.',
      'NUNCA texto corrido com 3+ frases sem quebra de linha.',
      'NUNCA tag colada ao conteudo na mesma linha.',
      '',
      '[CTA — MAXIMO 3 LINHAS]',
      'A pessoa ja decidiu agir — nao reexplique o video.',
      'Modelo: acao + o que recebe + como fazer.',
      'Exemplo: "Comenta CLAUDE. Eu mando no direct o passo a passo completo."',
      'NUNCA mais de 3 linhas no CTA.',
      '',
      '[ARQUITETURA DE SAIDA OBRIGATORIA]',
      '',
      '[THINKING]',
      '* Arquetipo: [nome e por que serve ao tema]',
      '* Duracao alvo: [X segundos]',
      '* Emocao ancora: [qual e por que]',
      '* Gancho: [tipo e logica de scroll-stop]',
      '* Tom: [como adaptar ao DNA do criador]',
      '[/THINKING]',
      '[ROTEIRO_FINAL]',
      'TITULO: [titulo com promessa real]',
      '[METADADOS hash1="#Hashtag" hash2="#Hashtag" hash3="#Hashtag" direcao="dica de entrega"]',
      '[GANCHO]',
      '',
      '(texto do gancho — uma frase por linha)',
      '',
      '[NOME DO BLOCO 2]',
      '',
      '(conteudo — uma ideia por linha)',
      '(Visual: instrucao isolada na propria linha)',
      '',
      '[CTA]',
      '',
      '(maximo 3 linhas)',
    ].join('\n')

    // ─── 8. SANITIZACAO DAS MENSAGENS ────────────────────────────────────────
    const sanitizedMessages: typeof messages = []

    for (const msg of messages) {
      if (!msg.content || msg.content.trim() === '') continue

      if (sanitizedMessages.length === 0) {
        if (msg.role === 'user') sanitizedMessages.push(msg)
      } else {
        const last = sanitizedMessages[sanitizedMessages.length - 1]
        if (last.role === msg.role) {
          last.content += '\n\n' + msg.content
        } else {
          sanitizedMessages.push(msg)
        }
      }
    }

    if (sanitizedMessages.length > 0 &&
      sanitizedMessages[sanitizedMessages.length - 1].role === 'assistant') {
      sanitizedMessages.pop()
    }

    if (sanitizedMessages.length === 0) {
      throw new Error('Nao ha mensagens validas para processar.')
    }

    // ─── 9. SELECAO DE MODELOS COM FALLBACK ──────────────────────────────────
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      throw new Error('Nenhuma chave de API de IA configurada no servidor.')
    }

    const fallbackModels: any[] = []

    if (mode === 'premium' || mode === 'search') {
      if (process.env.ANTHROPIC_API_KEY) fallbackModels.push(anthropic('claude-sonnet-4-6-20250514'))
      if (process.env.OPENAI_API_KEY) fallbackModels.push(openai('gpt-4o'))
      if (process.env.GEMINI_API_KEY) fallbackModels.push(google('gemini-2.0-flash'))
      if (process.env.OPENAI_API_KEY) fallbackModels.push(openai('gpt-4o-mini'))
    } else {
      if (process.env.OPENAI_API_KEY) fallbackModels.push(openai('gpt-4o-mini'))
      if (process.env.GEMINI_API_KEY) fallbackModels.push(google('gemini-2.0-flash'))
      if (process.env.ANTHROPIC_API_KEY) fallbackModels.push(anthropic('claude-haiku-4-5-20251001'))
    }

    if (fallbackModels.length === 0) {
      throw new Error('Nenhum provedor de IA configurado no servidor.')
    }

    // ─── 10. STREAM COM FALLBACK AUTOMATICO ──────────────────────────────────
    const customStream = new ReadableStream({
      async start(controller) {
        let success = false
        let lastError: any = null
        let fullGeneratedText = ''

        for (let i = 0; i < fallbackModels.length; i++) {
          const selectedModel = fallbackModels[i]

          try {
            const result = streamText({
              model: selectedModel,
              system: systemPrompt,
              messages: sanitizedMessages,
              maxRetries: 0,
              experimental_providerMetadata: {
                anthropic: { cacheControl: { type: 'ephemeral' } }
              }
            })

            for await (const chunk of result.textStream) {
              fullGeneratedText += chunk
              controller.enqueue(new TextEncoder().encode(chunk))
            }

            if (fullGeneratedText.trim() === '') {
              throw new Error('IA retornou resposta vazia.')
            }

            success = true
            break

          } catch (err: any) {
            console.warn('[AI FALLBACK] Provedor ' + i + ' falhou:', err?.message)
            lastError = err

            if (fullGeneratedText.length > 0) {
              controller.enqueue(
                new TextEncoder().encode('\n\n[ERRO DE CONEXAO]\nA IA desconectou antes de terminar. Tente novamente.')
              )
              success = true
              break
            }
          }
        }

        if (!success) {
          console.error('[TODOS OS PROVEDORES FALHARAM]', lastError)
          controller.enqueue(
            new TextEncoder().encode(
              '[ROTEIRO_FINAL]\nTITULO: Servidores sobrecarregados\n\n[GANCHO]\nAlta demanda agora. Aguarde 1-2 minutos e tente novamente.'
            )
          )
        }

        // ─── 11. POS-GERACAO: credito + salvar ───────────────────────────────
        if (success && fullGeneratedText.includes('[ROTEIRO_FINAL]') && mode !== 'analyze') {
          try {
            const adminSupabase = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!
            )

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

            const parts = fullGeneratedText.split('[ROTEIRO_FINAL]')
            const scriptPart = parts.length > 1 ? parts[parts.length - 1] : fullGeneratedText
            const scriptLines = scriptPart.trim().split('\n')

            let title = 'Roteiro Gerado'
            let finalScript = scriptPart.trim()

            const firstContentIdx = scriptLines.findIndex((line: string) => line.trim() !== '')
            if (firstContentIdx !== -1) {
              const firstLine = scriptLines[firstContentIdx].trim()
              if (firstLine.toUpperCase().includes('TITULO:') || !firstLine.startsWith('[')) {
                title = firstLine
                  .replace(/TÍTULO:/i, '')
                  .replace(/TITULO:/i, '')
                  .replace(/\*\*/g, '')
                  .replace(/^#+\s*/, '')
                  .substring(0, 100)
                  .trim() || 'Roteiro Gerado'
                scriptLines.splice(0, firstContentIdx + 1)
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

          } catch (dbErr) {
            console.error('[SAVE_ERROR]', dbErr)
          }
        }

        controller.close()
      }
    })

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })

  } catch (error: any) {
    console.error('[ROTEIRISTA_CORE_ERROR]', error)
    return new Response(
      error.message || 'Servidor sobrecarregado ou falhando. Tente novamente.',
      { status: 500 }
    )
  }
}
