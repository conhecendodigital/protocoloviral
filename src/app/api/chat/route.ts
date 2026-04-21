import { createServerSupabase } from '@/lib/supabase/server'
import { streamText, convertToModelMessages } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { checkRateLimit } from '@/lib/rate-limit'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { messages, agent_id, session_id } = await req.json()
    
    // Auth check
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // ── Rate Limit: 30 messages/min per user ──
    const rateLimit = checkRateLimit(`chat:${user.id}`, 30, 60_000)
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: 'Muitas mensagens. Aguarde um momento.' }), { status: 429 })
    }

    // Load Agent
    const { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agent_id)
      .single()

    if (!agent) {
      return new Response('Agent Not Found', { status: 404 })
    }

    // Load DNA
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    let userTier = profile?.plan_tier || 'free';
    const isAdmin = profile?.is_admin === true;
    const now = new Date();

    // Verificação Mestra de Downgrade Agendado / Falha de Pagamento MP
    if (!isAdmin && profile?.current_period_end) {
      const expirationDate = new Date(profile.current_period_end);
      if (now > expirationDate && userTier !== 'free') {
         userTier = 'free'; // Rebaixa o tier na memoria
         
         // Atualiza no banco removendo a assinatura vencida
         await supabase.from('profiles').update({ 
             plan_tier: 'free',
             mp_subscription_id: null,
             cancel_at_period_end: false 
         }).eq('id', user.id);
      }
    }

    // Check Plan Restriction
    if (!isAdmin) {
      if (agent.required_plan !== 'free' && userTier === 'free') {
        return new Response(JSON.stringify({ error: 'Acesso negado: Este experiente é exclusivo para assinantes. Faça o upgrade do seu plano.', code: 'upgrade_required' }), { status: 403 });
      }
    }

    // Check Tokens Limits
    const getTokenLimit = (tier: string) => {
      if (tier !== 'free') return 600000; // Assinantes tem o limite cheio
      return 5000;
    };

    const tokenLimit = getTokenLimit(userTier);
    let currentTokensUsed = profile?.tokens_used_today || 0;
    
    // lastReset in UTC
    const lastReset = profile?.last_token_reset ? new Date(profile.last_token_reset) : null;

    // Reset if 24 hours have passed or if never set
    if (!lastReset || (now.getTime() - lastReset.getTime()) > 24 * 60 * 60 * 1000) {
      currentTokensUsed = 0;
      await supabase.from('profiles').update({ 
        tokens_used_today: 0, 
        last_token_reset: now.toISOString() 
      }).eq('id', user.id);
    }

    // Prevents request if out of tokens
    if (!isAdmin && currentTokensUsed >= tokenLimit) {
      return new Response(JSON.stringify({ error: `Você atingiu seu limite diário de ${tokenLimit.toLocaleString('pt-BR')} tokens de IA. Retorne amanhã ou faça o upgrade do seu plano.`, code: 'limit_reached' }), { status: 403 });
    }

    // Load RAG Files (Knowledge Base)
    const { data: files } = await supabase
      .from('knowledge_base_files')
      .select('*')
      .eq('agent_id', agent_id)

    let ragContext = '';

    if (files && files.length > 0) {
      console.log(`[RAG] Agent ${agent.name} has ${files.length} attached documents. Loading...`);
      ragContext = `\n\n============ BASE DE CONHECIMENTO DO AGENTE ============\nOrientações: Use as informações abaixo estritamente como conhecimento interno primário para responder ao usuário. Se a informação não estiver nesses textos e você julgar necessária, você pode inferir respostas. Mas priorize o conhecimento contido aqui:\n\n`;

      for (const file of files) {
        if (!file.storage_path) continue;

        try {
          const { data: fileData, error: downloadError } = await supabase
              .storage
              .from('knowledge_base')
              .download(file.storage_path);

          if (downloadError || !fileData) {
            console.error(`[RAG] Error downloading ${file.file_name}:`, downloadError);
            continue;
          }

          let fileExtractedText = '';
          const buffer = Buffer.from(await fileData.arrayBuffer());

          if (file.file_type === 'PDF' || file.file_name.toLowerCase().endsWith('.pdf')) {
             try {
                 const { PDFParse } = await import('pdf-parse');
                 const parser = new (PDFParse as any)({ data: new Uint8Array(buffer) });
                 const textR = await (parser as any).getText();
                 await (parser as any).destroy();
                 fileExtractedText = textR.text;
             } catch (fallbackErr) {
                 console.error(`[RAG] Fallback PDF parse failed:`, fallbackErr);
             }
          } else {
             // Assume TXT or simple text format
             fileExtractedText = new TextDecoder('utf-8').decode(buffer);
          }

          if (fileExtractedText && fileExtractedText.trim().length > 0) {
            ragContext += `--- DOCUMENTO: ${file.file_name} ---\n${fileExtractedText.trim()}\n\n`;
          }

        } catch (err) {
          console.error(`[RAG] General error processing file ${file.file_name}:`, err);
        }
      }
      
      ragContext += `========================================================\n`;
    }

    // Build DNA Context
    let dnaContext = ''
    if (profile) {
      dnaContext = `
============ DNA DO CLIENTE (CONTEXTO OBRIGATÓRIO) ============
Sempre personalize profundamente suas respostas considerando QUEM é o usuário e QUEM é o público dele:

[O PÚBLICO DO USUÁRIO]
- Quem são: ${profile.publico || 'Não informado'}
- Dores principais: ${profile.dor || 'Não informado'}
- O que já tentaram: ${profile.tentou || 'Não informado'}

[SOBRE O USUÁRIO]
- Nome: ${profile.nome_completo || 'Não informado'}
- Nicho de Atuação: ${profile.nicho || 'Não informado'}
- Assunto Principal: ${profile.assunto || 'Não informado'}
- Diferencial Único: ${profile.diferencial || 'Não informado'}
- Propósito/Missão: ${profile.proposito || 'Não informado'}
- O que NUNCA quer falar sobre: ${profile.naoquer || 'Não informado'}

[PRODUTO]
- O que o usuário vende: ${profile.produto_venda || 'Não informado'}
================================================================

INSTRUÇÕES ESPECÍFICAS DESTE AGENTE:
${agent.system_prompt}
`
    } else {
      dnaContext = agent.system_prompt
    }

    // Combine Final System Context
    const finalSystemPrompt = dnaContext + ragContext;

    // Set Provider
    let model;
    if (agent.ai_provider === 'google') {
       const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })
       model = google(agent.ai_model || 'gemini-2.0-flash')
    } else if (agent.ai_provider === 'openai') {
       const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
       model = openai(agent.ai_model || 'gpt-4o')
    } else if (agent.ai_provider === 'anthropic') {
       const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
       model = anthropic(agent.ai_model || 'claude-3-5-sonnet-latest')
    } else {
       const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })
       model = google('gemini-2.0-flash')
    }

    // Format messages for Vercel AI
    const coreMessages = await convertToModelMessages(messages);

    const result = streamText({
      model,
      system: finalSystemPrompt,
      messages: coreMessages,
      async onFinish({ text, usage }) {
        // Ao finalizar, salvamos a resposta do assistente no supabase
        if (session_id) {
            await supabase.from('chat_messages').insert({
              session_id,
              user_id: user.id,
              role: 'assistant',
              content: text
            })
        }

        // Atualizar saldo de tokens consumidos
        if (usage && usage.totalTokens && !isAdmin) {
            const extraTokens = profile?.tokens_used_this_cycle || 0;
            await supabase.from('profiles').update({ 
                tokens_used_today: currentTokensUsed + usage.totalTokens,
                tokens_used_this_cycle: extraTokens + usage.totalTokens
            }).eq('id', user.id);
        }
      }
    })

    return result.toUIMessageStreamResponse()
    
  } catch (error: any) {
    // ✅ SECURITY: Never expose stack traces or internal error details to the client.
    // Log the full error server-side only.
    console.error('Chat Error:', error)
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor. Tente novamente em instantes.',
    }), { status: 500 })
  }
}
