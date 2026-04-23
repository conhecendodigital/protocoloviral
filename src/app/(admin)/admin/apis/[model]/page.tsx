import { createAdminClient } from '@/lib/supabase/admin'
import { Activity, ArrowLeft, Calendar, FileText, User } from 'lucide-react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function AdminApiDetailsPage({ params }: { params: { model: string } }) {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('pv_admin_auth')
  if (authCookie?.value !== 'authenticated') {
    redirect('/admin/login')
  }

  // O model vem URL-encoded (ex: gpt-4o-mini). Precisamos decodificar se tiver espaços.
  const modelName = decodeURIComponent(params.model)

  const supabase = createAdminClient()

  // Buscar logs gerados por este modelo
  // O join com perfis pega nome/email de quem gerou
  const { data: logs } = await supabase
    .from('api_usage_logs')
    .select(`
      id,
      feature,
      created_at,
      cost_brl,
      user_id,
      profiles:user_id (
        nome_completo,
        email
      )
    `)
    .eq('model_used', modelName)
    .order('created_at', { ascending: false })

  const totalCost = logs?.reduce((sum, curr) => sum + (curr.cost_brl || 0), 0) || 0
  const totalGenerations = logs?.length || 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/apis" 
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{modelName}</h2>
          </div>
          <p className="text-slate-400 mt-1">
            Métricas de uso e histórico completo do modelo.
          </p>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
          <h3 className="text-sm font-medium text-slate-400 mb-2">Custo Acumulado</h3>
          <span className="text-4xl font-bold text-white">R$ {totalCost.toFixed(2)}</span>
          <p className="text-emerald-400 text-sm mt-2">Valor faturado nesta IA</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
          <h3 className="text-sm font-medium text-slate-400 mb-2">Gerações Totais</h3>
          <span className="text-4xl font-bold text-white">{totalGenerations.toLocaleString()}</span>
          <p className="text-blue-400 text-sm mt-2">Requisições processadas</p>
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Histórico de Uso</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 bg-slate-950/50 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Recurso Utilizado</th>
                <th className="px-6 py-4 font-medium">Usuário</th>
                <th className="px-6 py-4 font-medium text-right">Custo da Geração</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs?.map((log) => {
                // @ts-expect-error - Supabase join type is complex
                const nomeUsuario = log.profiles?.nome_completo || log.profiles?.email || 'Usuário Deletado'
                
                return (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span className="text-slate-200 line-clamp-1">
                          {log.feature || 'Desconhecido'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/users/${log.user_id}`} className="flex items-center gap-2 group">
                        <User className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <span className="text-slate-400 group-hover:text-blue-400 transition-colors">
                          {nomeUsuario}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-400">
                      R$ {(log.cost_brl || 0).toFixed(4)}
                    </td>
                  </tr>
                )
              })}
              
              {(!logs || logs.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    Nenhum histórico encontrado para este modelo.
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
