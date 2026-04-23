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

  // 1. Total de usuários
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // 2. Usuários recentes
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, email, nome_completo, plan_tier, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  // 2.1 Buscar dados do auth para preencher nomes de login social (Google)
  const { data: { users: authUsers } } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  })

  const displayUsers = recentUsers?.map(user => {
    const authUser = authUsers.find(a => a.id === user.id)
    const metaName = authUser?.user_metadata?.full_name || authUser?.user_metadata?.name
    return {
      ...user,
      displayName: user.nome_completo || metaName || 'Sem Nome'
    }
  })

  // 3. Assinantes (Aproximado buscando todos ou usando filtros)
  // Assumindo que quem não tem plan_tier = free é assinante (ou quem tem mp_subscription_id)
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('plan_tier, mp_subscription_id')

  let totalSubscribers = 0
  allProfiles?.forEach(p => {
    if ((p.plan_tier && p.plan_tier !== 'free') || p.mp_subscription_id) {
      totalSubscribers++
    }
  })

  // 4. Consumo de Créditos / API
  const { data: creditos } = await supabase
    .from('creditos_mensais')
    .select('credits_used, credits_total')

  let totalCreditsUsed = 0
  let totalCreditsAvailable = 0

  creditos?.forEach(c => {
    totalCreditsUsed += (c.credits_used || 0)
    totalCreditsAvailable += (c.credits_total || 0)
  })

  // 5. Custo Exato em R$
  const { data: roteirosCost } = await supabase
    .from('roteiros')
    .select('cost_brl')

  let custoAproximado = 0
  roteirosCost?.forEach(r => {
    custoAproximado += (r.cost_brl || 0)
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

        {/* Assinantes Ativos */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-amber-500/20 p-6 rounded-2xl relative overflow-hidden group shadow-[0_0_30px_-15px_rgba(245,158,11,0.3)]">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-amber-400/80">Assinantes PRO</h3>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
              {totalSubscribers}
            </span>
            <span className="text-sm text-amber-500/50">
              {totalUsers ? Math.round((totalSubscribers / totalUsers) * 100) : 0}% conversão
            </span>
          </div>
        </div>

        {/* Consumo IA */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">Créditos de IA Usados</h3>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{totalCreditsUsed.toLocaleString()}</span>
            <span className="text-sm text-slate-500">
              / {totalCreditsAvailable.toLocaleString()}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" 
              style={{ width: `${Math.min(100, totalCreditsAvailable ? (totalCreditsUsed / totalCreditsAvailable) * 100 : 0)}%` }}
            />
          </div>
        </div>

        {/* Custo Estimado */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">Custo Estimado API</h3>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">R$ {custoAproximado.toFixed(2)}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Baseado no volume de gerações</p>
        </div>
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
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-200">
                      {user.displayName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    {user.plan_tier && user.plan_tier !== 'free' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {user.plan_tier.toUpperCase()}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                        FREE
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(user.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
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
