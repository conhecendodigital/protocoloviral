import { createAdminClient } from '@/lib/supabase/admin'
import { Crown, Users, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filter?: string }>
}) {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('pv_admin_auth')
  if (authCookie?.value !== 'authenticated') {
    redirect('/admin/login')
  }

  const { page, filter } = await searchParams
  const currentPage = parseInt(page || '1', 10)
  const pageSize = 100
  const offset = (currentPage - 1) * pageSize

  const supabase = createAdminClient()

  // Buscar usuários paginados, com consumo e custos reais via RPC do banco de dados
  const { data: rpcUsers } = await supabase.rpc('get_admin_users_ranked', {
    filter_pro: filter === 'pro',
    limit_val: pageSize,
    offset_val: offset
  })

  // O total global de usuários vem acoplado em cada linha (Window Function)
  const totalUsers = rpcUsers?.[0]?.total_count || 0

  // Mapear para o formato do componente
  const usersWithConsumption = rpcUsers?.map(user => ({
    id: user.user_id,
    displayName: user.display_name,
    email: user.email,
    plan_tier: user.plan_tier,
    created_at: user.created_at,
    creditsUsed: user.credits_used,
    creditsTotal: user.credits_total,
    cost: user.total_cost_brl
  })) || []

  const totalPages = Math.ceil((totalUsers || 0) / pageSize)

  // URL base para os botões de paginação
  const basePath = filter ? `/admin/users?filter=${filter}&` : `/admin/users?`

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin" 
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            {filter === 'pro' ? 'Assinantes PRO' : 'Base de Usuários'}
          </h2>
          <p className="text-slate-400">
            {filter === 'pro' 
              ? 'Listagem de todos os clientes com plano pago ativo.'
              : 'Visão completa de todos os usuários cadastrados na plataforma.'}
          </p>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Usuários ({totalUsers})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 bg-slate-950/50 uppercase border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Usuário</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Plano</th>
                <th className="px-6 py-4 font-medium text-center">Consumo (Créditos)</th>
                <th className="px-6 py-4 font-medium text-center">Custo API (R$)</th>
                <th className="px-6 py-4 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {usersWithConsumption.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-200">
                      {user.displayName}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    {user.plan_tier && user.plan_tier !== 'free' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Crown className="w-3 h-3 mr-1" />
                        {user.plan_tier.toUpperCase()}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                        FREE
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-medium text-white">{user.creditsUsed}</span>
                      <span className="text-slate-500 text-xs">/ {user.creditsTotal}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-medium text-emerald-400">
                      R$ {user.cost.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link 
                      href={`/admin/users/${user.id}`}
                      className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 rounded-lg transition-colors"
                    >
                      Ver Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
              {usersWithConsumption.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Nenhum usuário encontrado na base.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação Dinâmica */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Mostrando <span className="text-white">{offset + 1}</span> a <span className="text-white">{Math.min(offset + pageSize, totalUsers || 0)}</span> de <span className="text-white">{totalUsers}</span>
            </div>
            <div className="flex items-center gap-2">
              {currentPage > 1 ? (
                <Link 
                  href={`${basePath}page=${currentPage - 1}`}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </Link>
              ) : (
                <div className="px-4 py-2 bg-slate-800/50 text-slate-500 rounded-lg flex items-center gap-2 text-sm font-medium cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </div>
              )}

              <div className="text-sm font-medium text-slate-400">
                Página <span className="text-white">{currentPage}</span> de <span className="text-white">{totalPages || 1}</span>
              </div>

              {currentPage < totalPages ? (
                <Link 
                  href={`${basePath}page=${currentPage + 1}`}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  Próxima <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="px-4 py-2 bg-slate-800/50 text-slate-500 rounded-lg flex items-center gap-2 text-sm font-medium cursor-not-allowed">
                  Próxima <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
