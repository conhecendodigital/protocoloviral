import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Endpoint de polling para o dashboard admin.
 * Retorna métricas globais + últimas requisições de IA com dados do usuário.
 * Protegido pelo mesmo cookie de autenticação admin.
 */
export async function GET() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('pv_admin_auth')
  if (authCookie?.value !== 'authenticated') {
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

  const metrics = metricsResponse.data
  const recentLogs = logsResponse.data || []

  // Buscar perfis dos usuários que aparecem nos logs (batch)
  const userIds = [...new Set(recentLogs.map(log => log.user_id))]
  
  let profilesMap: Record<string, { nome_completo: string | null, email: string | null }> = {}
  
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, nome_completo, email')
      .in('id', userIds)

    if (profiles) {
      profiles.forEach(p => {
        profilesMap[p.id] = { nome_completo: p.nome_completo, email: p.email }
      })
    }
  }

  // Enriquecer os logs com os dados do usuário
  const enrichedLogs = recentLogs.map(log => ({
    id: log.id,
    feature: log.feature,
    model_used: log.model_used,
    cost_brl: log.cost_brl,
    total_tokens: log.total_tokens,
    created_at: log.created_at,
    user_id: log.user_id,
    user_name: profilesMap[log.user_id]?.nome_completo || profilesMap[log.user_id]?.email || 'Usuário desconhecido'
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
