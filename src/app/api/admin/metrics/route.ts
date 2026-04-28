import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminAuthenticated } from '@/lib/admin-auth'

/**
 * Endpoint de polling para o dashboard admin.
 * Retorna métricas globais + últimas requisições de IA com dados do usuário.
 * Protegido pelo mesmo cookie HMAC-assinado de autenticação admin.
 */
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Buscar métricas e últimos logs em paralelo
  const [metricsResponse, logsResponse] = await Promise.all([
    supabase.rpc('get_admin_dashboard_metrics').single(),
    supabase
      .from('api_usage_logs')
      .select('id, user_id, feature, model_used, cost_brl, total_tokens, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
  ])

  const metrics = metricsResponse.data as {
    total_users: number
    pro_subscribers: number
    total_requests: number
    total_cost_brl: number
  } | null
  const recentLogs = logsResponse.data || []

  // Buscar perfis e contagem de requisições por usuário (batch)
  const userIds = [...new Set(recentLogs.map(log => log.user_id))]
  
  let profilesMap: Record<string, { nome_completo: string | null, email: string | null }> = {}
  let requestCountMap: Record<string, number> = {}
  
  if (userIds.length > 0) {
    // Buscar perfis e contagem em paralelo
    const [profilesRes, countsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, nome_completo, email')
        .in('id', userIds),
      // Contar requisições totais por usuário usando os logs
      Promise.all(
        userIds.map(async (uid) => {
          const { count } = await supabase
            .from('api_usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', uid)
          return { uid, count: count || 0 }
        })
      )
    ])

    if (profilesRes.data) {
      profilesRes.data.forEach(p => {
        profilesMap[p.id] = { nome_completo: p.nome_completo, email: p.email }
      })
    }

    countsRes.forEach(({ uid, count }) => {
      requestCountMap[uid] = count
    })
  }

  // Enriquecer os logs com dados do usuário + total de requisições
  const enrichedLogs = recentLogs.map(log => ({
    id: log.id,
    feature: log.feature,
    model_used: log.model_used,
    cost_brl: log.cost_brl,
    total_tokens: log.total_tokens,
    created_at: log.created_at,
    user_id: log.user_id,
    user_name: profilesMap[log.user_id]?.nome_completo || profilesMap[log.user_id]?.email || 'Usuário desconhecido',
    user_request_count: requestCountMap[log.user_id] || 0
  }))

  return NextResponse.json({
    metrics: {
      total_users: metrics?.total_users || 0,
      pro_subscribers: metrics?.pro_subscribers || 0,
      total_requests: metrics?.total_requests || 0,
      total_cost_brl: metrics?.total_cost_brl || 0
    },
    recentLogs: enrichedLogs
  })
}
