import { createAdminClient } from '@/lib/supabase/admin'
import { ArrowLeft, User, Mail, Calendar, Crown, Zap, Activity, BookOpen, Clock } from 'lucide-react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function AdminUserDashboard({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('pv_admin_auth')
  if (authCookie?.value !== 'authenticated') {
    redirect('/admin/login')
  }

  const { id: userId } = await params
  const supabase = createAdminClient()

  // 1. Buscar Dados do Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) {
    // Se não encontrou o perfil, volta para a lista
    redirect('/admin/users')
  }

  // 2. Buscar Dados do Auth (para pegar o nome verdadeiro e email verificado)
  const { data: authData } = await supabase.auth.admin.getUserById(userId)
  const authUser = authData?.user

  const displayName = profile.nome_completo 
    || authUser?.user_metadata?.full_name 
    || authUser?.user_metadata?.name 
    || 'Sem Nome'
  
  const email = profile.email || authUser?.email

  // 3. Buscar Créditos Mensais
  const { data: creditos } = await supabase
    .from('creditos_mensais')
    .select('*')
    .eq('user_id', userId)
    .single()

  const creditsUsed = creditos?.credits_used || 0
  const creditsTotal = creditos?.credits_total || 150
  const percentageUsed = creditsTotal > 0 ? (creditsUsed / creditsTotal) * 100 : 0

  // 4. Buscar Histórico de Roteiros Gerados e Custo Real
  const { data: roteiros } = await supabase
    .from('roteiros')
    .select('id, titulo, formato_nome, created_at, cost_brl')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50) // Pegar mais para ter um custo exato mais próximo do real

  // Calcular custo exato (ao invés do antigo multiplier * 0.05)
  let cost = 0
  roteiros?.forEach(r => {
    cost += (r.cost_brl || 0)
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      {/* HEADER E VOLTAR */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/users" 
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Detalhes do Usuário
          </h2>
          <p className="text-slate-400">Análise profunda de métricas e histórico.</p>
        </div>
      </div>

      {/* PAINEL SUPERIOR: INFOS DO USUÁRIO */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-start md:items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
        
        <div className="w-20 h-20 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-3xl font-bold text-slate-400 shrink-0 shadow-xl">
          {displayName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-black text-white">{displayName}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-400">
            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-500"/> {email}</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500"/> 
              Entrou em {new Date(profile.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          {profile.plan_tier && profile.plan_tier !== 'free' ? (
            <div className="px-6 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center shadow-[0_0_30px_-15px_rgba(245,158,11,0.3)]">
              <Crown className="w-6 h-6 text-amber-400 mx-auto mb-1" />
              <div className="text-xs font-bold uppercase tracking-widest text-amber-400">Assinante</div>
              <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">{profile.plan_tier.toUpperCase()}</div>
            </div>
          ) : (
            <div className="px-6 py-3 rounded-xl bg-slate-800/50 border border-white/5 text-center">
              <User className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Plano Atual</div>
              <div className="text-lg font-black text-slate-300">FREE</div>
            </div>
          )}
        </div>
      </div>

      {/* MÉTRICAS DE IA E FINANCEIRO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-medium text-slate-400">Consumo de IA</h3>
              <div className="text-2xl font-bold text-white mt-1">
                {creditsUsed} <span className="text-base text-slate-500 font-medium">/ {creditsTotal}</span>
              </div>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          
          <div className="mt-4 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000" 
              style={{ width: `${Math.min(100, percentageUsed)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 text-right">{percentageUsed.toFixed(1)}% utilizado</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-slate-400">Custo Gerado (API)</h3>
              <div className="text-3xl font-bold text-white mt-1">
                <span className="text-emerald-400">R$</span> {cost.toFixed(2)}
              </div>
              <p className="text-xs text-slate-500 mt-2">Custo aproximado para a empresa</p>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-slate-400">Roteiros Gerados</h3>
              <div className="text-3xl font-bold text-white mt-1">
                {roteiros?.length || 0}
              </div>
              <p className="text-xs text-slate-500 mt-2">Histórico contabilizado</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* HISTÓRICO DE GERAÇÕES */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-bold text-white">Últimos Roteiros Gerados</h3>
          <p className="text-sm text-slate-400">Histórico detalhado das ações da IA para este usuário.</p>
        </div>
        
        {(!roteiros || roteiros.length === 0) ? (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-300">Nenhuma geração ainda</h4>
            <p className="text-slate-500 text-sm mt-1">O usuário não consumiu créditos gerando roteiros.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {roteiros.map(roteiro => (
              <div key={roteiro.id} className="p-6 hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1 line-clamp-1">{roteiro.titulo}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                      {roteiro.formato_nome && (
                        <span className="text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded uppercase tracking-wider">{roteiro.formato_nome}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(roteiro.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
