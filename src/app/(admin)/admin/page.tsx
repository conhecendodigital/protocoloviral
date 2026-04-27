import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import DashboardClient from './components/DashboardClient'

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('pv_admin_auth')
  if (authCookie?.value !== 'authenticated') {
    redirect('/admin/login')
  }

  const supabase = createAdminClient()

  // Buscar métricas e últimos logs em paralelo (Initial state for the Client Component)
  const [metricsResponse, logsResponse] = await Promise.all([
    supabase.rpc('get_admin_dashboard_metrics').single(),
    supabase
      .from('api_usage_logs')
      .select('id, user_id, feature, model_used, cost_brl, total_tokens, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
  ])

  const metricsData = metricsResponse.data as {
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
    const [profilesRes, countsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, nome_completo, email')
        .in('id', userIds),
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

  const initialMetrics = {
    total_users: metricsData?.total_users || 0,
    pro_subscribers: metricsData?.pro_subscribers || 0,
    total_requests: metricsData?.total_requests || 0,
    total_cost_brl: metricsData?.total_cost_brl || 0
  }

  return (
    <DashboardClient
      initialMetrics={initialMetrics}
      initialLogs={enrichedLogs}
    />
  )
}
