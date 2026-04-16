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

    // Extrai o último mensaje do usuário para RAG e limites
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')
    const topic = lastUserMsg ? lastUserMsg.content : ''

    // ─── 1. GATEKEEPER: limite diário para free ───────────────────────────────
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
        return new Response('Limite de 5 roteiros diários atingido.', { status: 403 })
      }
    }

    // ─── 2. BASE DO SYSTEM PROMPT (agente customizado ou roteirista padrão) ───
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
      // DNA do criador (contexto do perfil)
      let userContext = ''
      if (profile?.publico) {
        userContext = `
============ DNA DO CLIENTE (CONTEXTO OBRIGATÓRIO) ============
Personalize profundamente o roteiro considerando QUEM é o usuário e QUEM é o público dele:

[O PÚBLICO DO USUÁRIO]
- Quem são: ${profile.publico}
- Dores principais: ${profile.dor || 'Não informado'}
- O que já tentaram: ${profile.tentou || 'Não informado'}

[SOBRE O USUÁRIO]
- Diferencial Único: ${profile.diferencial || 'Não informado'}
- Propósito/Missão: ${profile.proposito || 'Não informado'}
- O que NUNCA quer abordar: ${profile.naoquer || 'Não informado'}

[PRODUTO]
- O que o usuário vende: ${profile.produto_venda || 'Não informado'}
================================================================
`
      }

      baseSystemPrompt = `
============ ROTEIRISTA PRO — DIRETRIZES COMPLETAS ============
${ROTEIRISTA_PRO_SKILL}

${userContext}
`
    }

    // ─── 3. TOM DE VOZ (voice profile) ───────────────────────────────────────
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
        const bordoesArr = wi?.bordoes || []
        const palPref = wi?.palavras_preferidas || []
        const palEvit = wi?.palavras_evitadas || []

        voiceContext = `
[TOM DE VOZ DO CRIADOR — SEGUIR À RISCA]
Mimetize o EXATO estilo de escrita deste criador:
- Relação com a audiência: ${wi?.relacao || 'Amigável'}
- Energia: ${wi?.energia || 'Média'}
- Humor: ${wi?.humor || 2}/5
- Vocabulário (0=formal, 1=casual): ${st?.tone_axes?.formal_casual ?? '0.5'}
- Estilo de Frases: ${st?.sentence_style || 'Variado'}
${palPref.length > 0 ? `- Palavras OBRIGATÓRIAS: ${palPref.join(', ')}` : ''}
${palEvit.length > 0 ? `- Palavras PROIBIDAS: ${palEvit.join(', ')}` : ''}
${bordoesArr.length > 0 ? `- Bordões (use organicamente): ${bordoesArr.map((b: any) => `"${b.texto}"`).join(', ')}` : ''}
${st?.generation_rules ? `- Regras estilísticas: ${st.generation_rules}` : ''}
`
      }
    }

    // ─── 4. FORMATO VIRAL (estrutura + duração real do vídeo original) ────────
    let formatContext = ''
    let formatTitle: string | null = null

    if (formatData?.id && FORMATOS_VIRAIS_PROMPTS[formatData.id]) {
      // ── Formato selecionado: usa duração EXATA do vídeo viral estudado ──
      formatTitle = formatData.titulo

      // Vídeos acima de 90s são exceção — clamp para 90s máximo
      const duracaoRaw = formatData.duracao ? Math.round(parseFloat(formatData.duracao)) : 50
      const duracaoClamped = Math.min(duracaoRaw, 90)
      const duracaoSegundos = `${duracaoClamped} segundos`

      const engajamentoRef = formatData.engajamento
        ? `${formatData.engajamento}%`
        : 'não informado'

      formatContext = `
[ESTRUTURA VIRAL REFERÊNCIA — SEGUIR EXATAMENTE]
Título do Formato: ${formatData.titulo}

⏱ DURAÇÃO OBRIGATÓRIA: ${duracaoSegundos}
O roteiro final DEVE ter exatamente esse tempo quando lido em voz alta em ritmo natural.
Nem mais curto (perde valor), nem mais longo (mata a retenção).
📊 Engajamento do vídeo original: ${engajamentoRef}

${FORMATOS_VIRAIS_PROMPTS[formatData.id]}

[REGRA DE PARIDADE DE BLOCOS — ABSOLUTA]
O roteiro DEVE respeitar rigorosamente a quantidade e os nomes dos blocos da estrutura acima.
NUNCA pule um bloco. NUNCA adicione blocos extras.
Se a estrutura pedir 3 blocos → roteiro terá 3 blocos.
Se pedir 5 → terá 5. Sem exceção.
`
    } else {
      // ── Sem formato selecionado: duração automática baseada no arquétipo ──
      // Dados reais de 25 vídeos virais estudados (engajamento médio 8–18%)
      formatContext = `
[DURAÇÃO AUTOMÁTICA — BASEADA EM DADOS REAIS DE VIRAIS]
Escolha o arquétipo mais adequado ao tema e aplique a duração correspondente.
A duração não é sugestão — é especificação técnica do formato.
Ritmo de fala natural: ~2,5 palavras por segundo. Conte as palavras antes de entregar.

FAIXA CURTA — 7 a 30 segundos (alcance máximo, topo de funil)
→ CERTO vs ERRADO visual:   8–12s  | Problema → Contraste visual → fim
→ TUTORIAL ULTRA-RÁPIDO:    20–28s | Pergunta → 3 passos → CTA
→ PROBLEMA/SOLUÇÃO direto:  23–30s | Erro → Solução imediata → CTA salvar

FAIXA MÉDIA — 33 a 65 segundos ⭐ PADRÃO RECOMENDADO
(DM automation, engajamento real, equilíbrio alcance+profundidade)
→ BASTIDORES/COMPARAÇÃO:    33–35s | Produto A vs B → Diferencial → CTA
→ MISTÉRIO + SOLUÇÃO (3x):  34s    | "Não sabe ainda" → Ação+Benefício ×3 → CTA
→ PROBLEMA/SOLUÇÃO lista:   35–38s | Promessa → Problema+Solução ×5 → CTA salvar
→ QUIZ INTERATIVO:          37s    | Pergunta+Resposta+Explicação ×3 → CTA
→ REACT/ANÁLISE:            40–41s | Problema → Hipótese → Experimento → CTA
→ ANCORAGEM CORPORAL:       52–53s | Pergunta chocante → Descredita → Solução → CTA
→ TUTORIAL + AUTORIDADE:    55–65s | Descoberta → Tutorial → CTA seguir
→ LISTA ERROS:              63–65s | "X erros" → 5 demonstrações → CTA

FAIXA LONGA — 69 a 90 segundos (autoridade profunda, storytelling)
⚠️ LIMITE MÁXIMO: 90 segundos. NUNCA ultrapasse isso. Vídeos acima de 90s
exigem habilidade excepcional de apresentação — a plataforma não garante esse nível.
→ TUTORIAL HACK:            69–79s  | Notícia → Hack → Como fazer → CTA
→ ANCORAGEM + IA/TECH:      80–90s  | Problema chocante → Solução tech → Casos → CTA
→ REACT VIRAL:              80–90s  | Vídeo viral → Explicação → Impacto → CTA
→ ANCORAGEM EMOCIONAL:      80–90s  | História de tensão → Resolução → Lição → CTA
`
    }

    // ─── 5. GROUNDING COM SERPER (mode=search) ────────────────────────────────
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
              headers: {
                'X-API-KEY': serperKey,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ q: topic }),
              signal: controller.signal
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Serper timeout')), 3500)
            )
          ])

          const sData = await Promise.race([
            (sRes as Response).json(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Serper body timeout')), 2000)
            )
          ]) as any

          clearTimeout(timeoutId)

          if (sData?.organic?.length > 0) {
            const facts = sData.organic
              .slice(0, 4)
              .map((r: any) => '- ' + r.title + ': ' + r.snippet)
              .join('\n')

            serperContext = `
[FATOS REAIS DA INTERNET — USE PARA EMBASAR O ROTEIRO]
Integre esses dados atuais no conteúdo para dar credibilidade e evitar invenções:
${facts}
`
          }
        } catch (e) {
          console.error('[SERPER ERROR]', e)
        }
      }
    }

    // ─── 6. MEMÓRIA RAG (mode=premium) ───────────────────────────────────────
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

          memoryContext = `
[MEMÓRIA DE CONTEÚDOS PASSADOS]
Use para manter consistência de estilo e evitar repetição de temas já abordados:
${mTexts}
`
        }
      } catch (e) {
        console.error('[RAG ERROR]', e)
      }
    }

    // ─── 7. SYSTEM PROMPT MASTER ──────────────────────────────────────────────
    const systemPrompt = `
${baseSystemPrompt}

${voiceContext}

${formatContext}

${serperContext}

${memoryContext}

================================================================
REGRAS DE EXECUÇÃO — ABSOLUTAS E INVIOLÁVEIS
================================================================

[TAMANHO E DENSIDADE]
Profundidade NÃO significa comprimento.
Cada frase deve ser densa, direta e impactante.
O roteiro DEVE respeitar o tamanho do arquétipo escolhido — nem uma linha a mais.
Se o formato é de 35 segundos, o roteiro é de 35 segundos. Ponto.
Uma frase certeira vale mais que três medianas.
Linguagem simples: "melhorar" não "otimizar", "colocar" não "implementar", "plano" não "estratégia".

[PROIBIÇÃO DE CONVERSA]
NUNCA faça perguntas ao usuário.
NUNCA sugira opções para ele escolher.
NUNCA cumprimente, elogie ou faça introdução amigável.
Se o tema for vago, assuma a liderança criativa e entregue.
Sua ÚNICA função é entregar o [ROTEIRO_FINAL] imediatamente.

[ARQUITETURA DE SAÍDA — COPIE EXATAMENTE]
Sua PRIMEIRA palavra absoluta deve ser [THINKING].
Após [/THINKING], a próxima linha deve ser [ROTEIRO_FINAL].
Nenhum texto fora dessa estrutura.

[THINKING]
* Arquétipo escolhido: [nome e por quê serve ao tema]
* Duração alvo: [X segundos — respeitando o formato]
* Emoção âncora: [qual e por quê]
* Gancho: [tipo e lógica de scroll-stop]
* Tom do criador: [como vou adaptar ao DNA]
[/THINKING]
[ROTEIRO_FINAL]
TÍTULO: [título com promessa real — sem clickbait vazio]
[METADADOS hash1="#Hashtag" hash2="#Hashtag" hash3="#Hashtag" direcao="💡 dica de entrega"]
[GANCHO]

(texto do gancho — linha por linha, nunca parágrafo)

[NOME DO BLOCO 2]

(conteúdo — UMA ideia por linha, ENTER após cada frase)
(Visual: instrução entre parênteses, isolada na própria linha)

[NOME DO BLOCO 3]

(continua...)

[CTA]

(máximo 3 linhas — ação + o que recebe + como fazer)

[FORMATAÇÃO OBRIGATÓRIA DE CADA BLOCO]
✅ Tag do bloco em linha própria
✅ Linha em branco após a tag
✅ UMA frase por linha
✅ Instrução visual entre parênteses em linha própria
✅ [PAUSA] e [CORTE] em linhas próprias
❌ NUNCA texto corrido ou parágrafo com 3+ frases sem quebra
❌ NUNCA tag colada ao conteúdo na mesma linha
`

    // ─── 8. SANITIZAÇÃO DAS MENSAGENS ─────────────────────────────────────────
    // Anthropic exige: começa com 'user', alterna user/assistant, sem conteúdo vazio
    const sanitizedMessages: typeof messages = []

    for (const msg of messages) {
      if (!msg.content || msg.content.trim() === '') continue

      if (sanitizedMessages.length === 0) {
        if (msg.role === 'user') sanitizedMessages.push(msg)
      } else {
        const last = sanitizedMessages[sanitizedMessages.length - 1]
        if (last.role === msg.role) {
          last.content += '\n\n' + msg.content // merge consecutivos
        } else {
          sanitizedMessages.push(msg)
        }
      }
    }

    // Anthropic não aceita terminar com 'assistant'
    if (sanitizedMessages.length > 0 &&
      sanitizedMessages[sanitizedMessages.length - 1].role === 'assistant') {
      sanitizedMessages.pop()
    }

    if (sanitizedMessages.length === 0) {
      throw new Error('Não há mensagens válidas para processar.')
    }

    // ─── 9. SELEÇÃO DE MODELOS COM FALLBACK ───────────────────────────────────
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      throw new Error('Nenhuma chave de API de IA configurada no servidor.')
    }

    const fallbackModels: any[] = []

    if (mode === 'premium' || mode === 'search') {
      // Premium: Claude primeiro (melhor qualidade de roteiro), depois fallbacks
      if (process.env.ANTHROPIC_API_KEY) fallbackModels.push(anthropic('claude-sonnet-4-6-20250514'))
      if (process.env.OPENAI_API_KEY) fallbackModels.push(openai('gpt-4o'))
      if (process.env.GEMINI_API_KEY) fallbackModels.push(google('gemini-2.0-flash'))
      if (process.env.OPENAI_API_KEY) fallbackModels.push(openai('gpt-4o-mini'))
    } else {
      // Fast/free: modelos rápidos e baratos
      if (process.env.OPENAI_API_KEY) fallbackModels.push(openai('gpt-4o-mini'))
      if (process.env.GEMINI_API_KEY) fallbackModels.push(google('gemini-2.0-flash'))
      if (process.env.ANTHROPIC_API_KEY) fallbackModels.push(anthropic('claude-haiku-4-5-20251001'))
    }

    if (fallbackModels.length === 0) {
      throw new Error('Nenhum provedor de IA configurado no servidor.')
    }

    // ─── 10. STREAM COM FALLBACK AUTOMÁTICO ───────────────────────────────────
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
              // Prompt caching para Anthropic (economiza ~90% no input após 1ª chamada)
              experimental_providerMetadata: {
                anthropic: {
                  cacheControl: { type: 'ephemeral' }
                }
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
            console.warn(`[AI FALLBACK] Falha no provedor ${i} (${selectedModel.modelId ?? 'unknown'}):`, err?.message)
            lastError = err

            // Se falhou no meio do stream, avisa o usuário e para
            if (fullGeneratedText.length > 0) {
              controller.enqueue(
                new TextEncoder().encode(
                  '\n\n[ERRO DE CONEXÃO]\nA IA desconectou antes de terminar. Por favor, tente novamente.'
                )
              )
              success = true
              break
            }
          }
        }

        // Todos os provedores falharam
        if (!success) {
          console.error('[TODOS OS PROVEDORES FALHARAM]', lastError)
          controller.enqueue(
            new TextEncoder().encode(
              '[ROTEIRO_FINAL]\nTÍTULO: Servidores sobrecarregados\n\n[GANCHO]\n❌ Estamos com alta demanda agora. Aguarde 1-2 minutos e tente novamente.'
            )
          )
        }

        // ─── 11. PÓS-GERAÇÃO: débito de crédito + salvar no banco ─────────────
        if (success && fullGeneratedText.includes('[ROTEIRO_FINAL]') && mode !== 'analyze') {
          try {
            const adminSupabase = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!
            )

            // Débito de crédito premium
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

            // Extrai título e corpo do roteiro para salvar limpo
            const parts = fullGeneratedText.split('[ROTEIRO_FINAL]')
            const scriptPart = parts.length > 1 ? parts[parts.length - 1] : fullGeneratedText
            const scriptLines = scriptPart.trim().split('\n')

            let title = 'Roteiro Gerado'
            let finalScript = scriptPart.trim()

            const firstContentIdx = scriptLines.findIndex((line: string) => line.trim() !== '')
            if (firstContentIdx !== -1) {
              const firstLine = scriptLines[firstContentIdx].trim()
              if (firstLine.toUpperCase().includes('TÍTULO:') || !firstLine.startsWith('[')) {
                title = firstLine
                  .replace(/TÍTULO:/i, '')
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
