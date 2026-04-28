import { createAdminClient } from '@/lib/supabase/admin'
import { ArrowLeft, User, Mail, Calendar, Crown, Zap, Activity, BookOpen, Clock } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export default async function AdminUserDashboard({
  params
}: {
  params: Promise<{ id: string }>
}) {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login')
  }

  const { id: userId } = await params
  const supabase = createAdminClient()

  // Buscar dados em paralelo para máxima performance
  const [profileResponse, logsResponse] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase
      .from('api_usage_logs')
      .select('id, feature, model_used, created_at, cost_brl')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
  ])

  const profile = profileResponse.data

  if (!profile) {
    redirect('/admin/users')
  }

  const displayName = profile.nome_completo || profile.email || 'Sem Nome'
  const email = profile.email

  // Histórico completo de TODAS as ações de IA (não apenas roteiros)
  const apiLogs = logsResponse.data || []

  // Custo real consolidado: soma de TODAS as interações com IA deste usuário
  const cost = apiLogs.reduce((sum, log) => sum + (log.cost_brl || 0), 0)
  const totalActions = apiLogs.length
  const custoMedio = totalActions > 0 ? cost / totalActions : 0

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
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-slate-400">Requisições de IA</h3>
              <div className="text-3xl font-bold text-white mt-1">
                {totalActions}
              </div>
              <p className="text-xs text-slate-500 mt-2">Total de chamadas à IA</p>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
          </div>
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
              <h3 className="text-sm font-medium text-slate-400">Ações de IA</h3>
              <div className="text-3xl font-bold text-white mt-1">
                {totalActions}
              </div>
              <p className="text-xs text-slate-500 mt-2">Requisições registradas</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* HISTÓRICO COMPLETO DE IA */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-bold text-white">Histórico de Consumo de IA</h3>
          <p className="text-sm text-slate-400">Todas as ações de IA realizadas por este usuário.</p>
        </div>
        
        {apiLogs.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-300">Nenhuma ação registrada</h4>
            <p className="text-slate-500 text-sm mt-1">O usuário ainda não utilizou nenhuma funcionalidade de IA.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {apiLogs.map(log => (
              <div key={log.id} className="p-6 hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1 line-clamp-1">{log.feature}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded uppercase tracking-wider">{log.model_used}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-emerald-400 font-medium text-sm whitespace-nowrap">
                  R$ {(log.cost_brl || 0).toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
