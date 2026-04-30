import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    // ✅ SECURITY: getUser() validates the JWT server-side. getSession() only reads the cookie
    // and can be spoofed if the session cookie is tampered with.
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { url } = body

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
    }

    // Tenta extrair o ID único do vídeo para fazer uma busca hiper-robusta (ignora mobile vs web, wwww vs sem www)
    const getCoreId = (u: string) => {
      const ig = u.match(/(?:reel|p|reels)\/([A-Za-z0-9_-]+)/);
      if (ig) return ig[1];
      const tt = u.match(/video\/(\d+)/);
      if (tt) return tt[1];
      const yt = u.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{11})/);
      if (yt) return yt[1];
      return null;
    }

    const videoId = getCoreId(url);
    const normalizedUrl = url.split('?')[0].replace(/\/$/, '')

    // 1. Verificar se este vídeo já foi processado (Deduplicação)
    let query = supabase.from('formatos').select('id, link_original')
    if (videoId) {
      query = query.ilike('link_original', `%${videoId}%`)
    } else {
      query = query.ilike('link_original', `${normalizedUrl}%`)
    }

    const { data: existing } = await query.limit(1).single()

    if (existing) {
      return NextResponse.json({
        success: true,
        exists: true,
        id: existing.id
      })
    }

    // ─── Gatekeeper: limite de análises ─────────────────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_tier, is_admin')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.is_admin === true
    const isPro = (profile?.plan_tier && profile.plan_tier !== 'free') || isAdmin

    // Free: sem acesso a análise de vídeo
    if (!isPro) {
      return NextResponse.json(
        { error: 'A análise de vídeos virais está disponível apenas para assinantes. Faça upgrade para desbloquear.' },
        { status: 403 }
      )
    }

    // Pro: máximo 10 análises por mês calendário
    if (!isAdmin) {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count } = await supabase
        .from('roteiros')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('titulo', 'SYSTEM_ANALYSIS_LOG')
        .gte('created_at', startOfMonth.toISOString())

      if (count !== null && count >= 10) {
        return NextResponse.json(
          { error: 'Você atingiu o limite de 10 análises de vídeos por mês. O contador reinicia no primeiro dia do próximo mês.' },
          { status: 429 }
        )
      }
    }

    // 2. Não existe. Disparar N8N
    const n8nUrl = process.env.N8N_WEBHOOK_URL
    if (!n8nUrl) {
      return NextResponse.json({ error: 'Serviço de análise temporariamente indisponível (Cód: W-MISSING)' }, { status: 500 })
    }

    const n8nRes = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    })

    if (!n8nRes.ok) {
      return NextResponse.json({ error: 'Nosso analisador está sobrecarregado no momento. Tente novamente em alguns minutos.' }, { status: 502 })
    }

    // Grava log de uso para controle do limite mensal (todos os planos exceto admin)
    if (!isAdmin) {
      await supabase.from('roteiros').insert({
        user_id: user.id,
        titulo: 'SYSTEM_ANALYSIS_LOG',
        roteiro: `Análise: ${normalizedUrl}`,
        nicho: 'system'
      })
    }

    // 3. Retornar status pending
    return NextResponse.json({
      success: true,
      exists: false,
      status: 'pending_analysis'
    })

  } catch (error: any) {
    console.error('[ANALYZE_TRIGGER_ERROR]', error)
    // ✅ SECURITY: Never expose internal error details (stack, message) to the client.
    return NextResponse.json({ 
      error: 'Ocorreu um erro interno inesperado. Por favor, tente novamente.',
    }, { status: 500 })
  }
}
