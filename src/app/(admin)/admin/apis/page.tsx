import { createAdminClient } from '@/lib/supabase/admin'
import { Activity, ArrowLeft, ChevronRight, Server } from 'lucide-react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function AdminApisPage() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('pv_admin_auth')
  if (authCookie?.value !== 'authenticated') {
    redirect('/admin/login')
  }

  const supabase = createAdminClient()

  // Buscar as estatísticas pré-calculadas direto do banco de dados (RPC)
  const { data: rpcStats } = await supabase.rpc('get_admin_api_stats')

  // Lista base de modelos conhecidos que o app utiliza
  const KNOWN_MODELS = [
    'gpt-4o',
    'gpt-4o-mini',
    'gemini-2.0-flash',
    'claude-haiku-4-5-20251001',
    'claude-3-5-sonnet-latest'
  ]

  // Iniciar o acumulador com os modelos conhecidos zerados
  const apiStatsMap: Record<string, { count: number, cost: number }> = {}
  KNOWN_MODELS.forEach(model => {
    apiStatsMap[model] = { count: 0, cost: 0 }
  })

  // Mesclar com os dados reais do banco
  rpcStats?.forEach(stat => {
    const model = stat.model_used || 'desconhecido'
    apiStatsMap[model] = {
      count: Number(stat.request_count) || 0,
      cost: Number(stat.total_cost_brl) || 0
    }
  })

  // Converter o objeto agrupado em um array e ordenar do mais caro pro mais barato
  const sortedApis = Object.entries(apiStatsMap)
    .map(([model, stats]) => ({
      model,
      count: stats.count,
      cost: stats.cost
    }))
    .sort((a, b) => b.cost - a.cost) // Ordenação descendente por custo

  const totalGeral = sortedApis.reduce((sum, api) => sum + api.cost, 0)

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
            <Server className="w-6 h-6 text-emerald-400" />
            Consumo por API (Modelos de IA)
          </h2>
          <p className="text-slate-400">
            Acompanhe o custo exato gerado por cada motor de Inteligência Artificial.
          </p>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-white">Ranking de Custos</h3>
          <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-950/50 py-2 px-4 rounded-full border border-white/5">
            <span>Custo Total Mapeado:</span>
            <span className="font-bold text-emerald-400">R$ {totalGeral.toFixed(2)}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 bg-slate-950/50 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Motor de IA (Model)</th>
                <th className="px-6 py-4 font-medium">Roteiros Gerados</th>
                <th className="px-6 py-4 font-medium text-right">Custo Total (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedApis.map((api) => (
                <tr key={api.model} className="hover:bg-white/[0.04] transition-colors group">
                  <td className="p-0">
                    <Link href={`/admin/apis/${api.model}`} className="flex items-center gap-3 px-6 py-4 w-full h-full">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                        <Activity className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-slate-200 group-hover:text-white transition-colors">
                        {api.model}
                      </span>
                    </Link>
                  </td>
                  <td className="p-0">
                    <Link href={`/admin/apis/${api.model}`} className="block px-6 py-4 w-full h-full text-slate-400 group-hover:text-slate-300 transition-colors">
                      {api.count.toLocaleString()} requisições
                    </Link>
                  </td>
                  <td className="p-0">
                    <Link href={`/admin/apis/${api.model}`} className="flex items-center justify-end gap-3 px-6 py-4 w-full h-full text-right">
                      <span className="text-lg font-bold text-white">
                        R$ {api.cost.toFixed(2)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                    </Link>
                  </td>
                </tr>
              ))}
              
              {sortedApis.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    Nenhum dado de modelo encontrado. Verifique se a coluna model_used foi atualizada.
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
