import { embed } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { content, type = 'roteiro', metadata = {} } = await req.json()

    if (!content || typeof content !== 'string') {
      return new Response('Content is required', { status: 400 })
    }

    // Gerar Embedding (Vetor)
    let embeddingVector: number[] = []
    try {
      const { embedding } = await embed({
        model: openai.embedding('text-embedding-3-small'),
        value: content,
      })
      embeddingVector = embedding
    } catch (embErr) {
      console.error('[EMBED_ERROR]', embErr)
      return new Response('Failed to generate embedding', { status: 500 })
    }

    // Salvar no Banco (Supabase pgvector via insert raw array -> DB vai cast)
    // O array numérico do JS mapeia perfeito para o OID vector do psql.
    const { error } = await supabase
      .from('memorias_usuario')
      .insert({
        user_id: user.id,
        content,
        content_type: type,
        metadata,
        embedding: embeddingVector
      })

    if (error) {
       console.error('[DB_INSERT_MEM_ERROR]', error)
       throw error
    }

    return Response.json({ success: true })
  } catch (err: any) {
    console.error('[MEMORIAS_ERROR]', err)
    return new Response(err.message || 'Internal error', { status: 500 })
  }
}
