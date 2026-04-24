import { createAdminClient } from '@/lib/supabase/admin'
import { Users, Crown, Activity, Zap } from 'lucide-react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('pv_admin_auth')
  if (authCookie?.value !== 'authenticated') {
    redirect('/admin/login')
  }

  const supabase = createAdminClient()

  // Buscar métricas globais e usuários recentes paralelamente
  const [metricsResponse, recentUsersResponse] = await Promise.all([
    supabase.rpc('get_admin_dashboard_metrics').single(),
    supabase
      .from('profiles')
      .select('id, email, nome_completo, plan_tier, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
  ])

  const metricsData = metricsResponse.data
  const recentUsers = recentUsersResponse.data

  const totalUsers = metricsData?.total_users || 0
  const totalSubscribers = metricsData?.pro_subscribers || 0
  const totalRequests = metricsData?.total_requests || 0
  const custoTotal = metricsData?.total_cost_brl || 0
  const custoMedioPorReq = totalRequests > 0 ? custoTotal / totalRequests : 0

  // Formatamos os usuários recentes (removendo a dependência lenta de auth.admin.listUsers)
  const displayUsers = recentUsers?.map(user => {
    return {
      ...user,
      displayName: user.nome_completo || user.email || 'Usuário sem nome'
    }
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Visão Geral</h2>
          <p className="text-slate-400">Métricas em tempo real do Protocolo Viral.</p>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Usuários */}
        <Link href="/admin/users" className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl relative overflow-hidden group cursor-pointer hover:border-blue-500/30 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none group-hover:from-blue-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">Total de Usuários</h3>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{totalUsers || 0}</span>
            <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-xs gap-1">
              Ver Todos <span className="text-lg leading-none">&rarr;</span>
            </span>
          </div>
        </Link>

        {/* Assinantes PRO */}
        <Link href="/admin/users?filter=pro" className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl relative overflow-hidden group cursor-pointer hover:border-amber-500/30 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none group-hover:from-amber-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400 group-hover:text-amber-400 transition-colors">Assinantes PRO</h3>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 group-hover:scale-110 transition-transform">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {totalSubscribers}
              </span>
              <span className="text-sm text-slate-500">
                {totalUsers ? Math.round((totalSubscribers / totalUsers) * 100) : 0}% conversão
              </span>
            </div>
            <span className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-xs gap-1">
              Ver Assinantes <span className="text-lg leading-none">&rarr;</span>
            </span>
          </div>
        </Link>

        {/* Requisições de IA */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">Requisições de IA</h3>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{totalRequests.toLocaleString()}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Custo médio: R$ {custoMedioPorReq.toFixed(4)} / req
          </p>
        </div>

        {/* Custo Exato da API */}
        <Link href="/admin/apis" className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl relative overflow-hidden group cursor-pointer hover:border-emerald-500/30 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none group-hover:from-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400 group-hover:text-emerald-400 transition-colors">Custo Exato API</h3>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">R$ {custoTotal.toFixed(2)}</span>
            <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-xs gap-1">
              Ver Modelos <span className="text-lg leading-none">&rarr;</span>
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Calculado via tokens do SDK</p>
        </Link>
      </div>

      {/* Tabela de Usuários Recentes */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Usuários Recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 bg-slate-950/50 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Usuário</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Plano</th>
                <th className="px-6 py-4 font-medium">Data de Criação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayUsers?.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.04] transition-colors group">
                  <td className="p-0">
                    <Link href={`/admin/users/${user.id}`} className="block px-6 py-4 w-full h-full">
                      <div className="font-medium text-slate-200 group-hover:text-white transition-colors">
                        {user.displayName}
                      </div>
                    </Link>
                  </td>
                  <td className="p-0 text-slate-400">
                    <Link href={`/admin/users/${user.id}`} className="block px-6 py-4 w-full h-full group-hover:text-slate-300 transition-colors">
                      {user.email}
                    </Link>
                  </td>
                  <td className="p-0">
                    <Link href={`/admin/users/${user.id}`} className="flex items-center px-6 py-4 w-full h-full">
                      {user.plan_tier && user.plan_tier !== 'free' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {user.plan_tier.toUpperCase()}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                          FREE
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="p-0 text-slate-400">
                    <Link href={`/admin/users/${user.id}`} className="block px-6 py-4 w-full h-full group-hover:text-slate-300 transition-colors">
                      {new Date(user.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Link>
                  </td>
                </tr>
              ))}
              {(!displayUsers || displayUsers.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
