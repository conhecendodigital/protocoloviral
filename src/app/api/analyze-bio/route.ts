import { createServerSupabase } from '@/lib/supabase/server'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { bio } = await req.json()

    if (!bio || typeof bio !== 'string' || bio.trim().length < 3) {
      return Response.json({ error: 'Bio muito curta para análise.' }, { status: 400 })
    }

    // Buscar o perfil do usuário para personalizar a análise
    const { data: profile } = await supabase
      .from('profiles')
      .select('publico, dor, diferencial, proposito, produto_venda, naoquer')
      .eq('id', user.id)
      .single()

    const dnaContext = profile ? `
CONTEXTO DO CRIADOR (use para personalizar a sugestão):
- Público-alvo: ${profile.publico || 'não definido'}
- Dor principal do público: ${profile.dor || 'não definido'}
- Diferencial: ${profile.diferencial || 'não definido'}
- Propósito: ${profile.proposito || 'não definido'}
- Produto: ${profile.produto_venda || 'não definido'}
` : ''

    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const { text, usage } = await generateText({
      model: openai('gpt-4o-mini'),
      system: `Você é um especialista em copywriting para Instagram com 10 anos de experiência otimizando bios de perfis que convertem seguidores em clientes.

Sua tarefa é analisar a bio do usuário e retornar um JSON PURO (sem markdown, sem backticks, sem explicação — APENAS o JSON).

${dnaContext}

REGRAS DA ANÁLISE:
1. Score de 0 a 100 baseado em critérios reais de conversão
2. Cada critério tem status: "good", "warning" ou "error"
3. A bio sugerida DEVE ser personalizada para o nicho e público do criador
4. A bio sugerida não pode ultrapassar 150 caracteres
5. Use emojis estratégicos (não decorativos)
6. Inclua CTA claro
7. NÃO use jargões genéricos como "Descubra", "Revolucione", "Transforme sua vida"

FORMATO DO JSON DE RESPOSTA:
{
  "score": 75,
  "items": [
    { "label": "Nome do Critério", "status": "good|warning|error", "detail": "Explicação curta e prática" }
  ],
  "sugestao": "Bio completa sugerida aqui com emojis e CTA",
  "explicacao": "Por que essa bio funciona (1-2 frases)"
}

CRITÉRIOS OBRIGATÓRIOS (analise todos):
1. Tamanho Ideal (80-150 caracteres é perfeito)
2. Clareza de Posicionamento (o visitante entende o que você faz em 2 segundos?)
3. Prova Social (números, resultados, autoridade)
4. Chamada para Ação (CTA claro: link, comando, direcionamento)
5. Uso de Emojis (estratégicos, não poluição visual)
6. Proposta de Valor Única (por que seguir VOCÊ e não outro?)
7. Linguagem do Público (fala a língua de quem você quer atrair?)`,
      prompt: `Analise esta bio do Instagram e retorne o JSON:\n\n"${bio}"`,
      temperature: 0.4,
      maxTokens: 800,
    })

    if (usage) {
      try {
        const { logApiUsage } = await import('@/lib/billing')
        await logApiUsage({
          userId: user.id,
          feature: 'analyze_bio',
          modelUsed: 'gpt-4o-mini',
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens
        })
      } catch (err) {
        console.error('[BILLING_ERROR]', err)
      }
    }

    // Tentar parsear o JSON da resposta
    let result
    try {
      // Limpar possíveis artefatos de markdown
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      result = JSON.parse(cleanText)
    } catch {
      console.error('[BIO_PARSE_ERROR] Raw AI output:', text)
      return Response.json({ 
        error: 'Erro ao processar análise. Tente novamente.' 
      }, { status: 500 })
    }

    return Response.json(result)

  } catch (err: any) {
    console.error('[BIO_ANALYZER_ERROR]', err)
    return new Response(err.message || 'Internal error', { status: 500 })
  }
}
