'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Users, Crown, Activity, Zap, Clock, BookOpen } from 'lucide-react'
import Link from 'next/link'

// Mapa de nomes amigáveis para features
const FEATURE_LABELS: Record<string, string> = {
  roteirista: 'Roteirista',
  chat_agent: 'Chat com Agente',
  generate_reel: 'Gerador de Reels',
  gerar_insights: 'Insights (Clareza + Persona)',
  enhance_answer: 'Enriquecer Respostas',
  analyze_voice: 'Análise de Voz',
  analyze_bio: 'Análise de Bio',
  enrich_voice: 'Enriquecer Voz',
  improve_block_gancho: 'Editor: Variações de Gancho',
  improve_block_regenerate: 'Editor: Reescrever Bloco',
  improve_block_refine: 'Editor: Refinar Bloco'
}

interface MetricsData {
  total_users: number
  pro_subscribers: number
  total_requests: number
  total_cost_brl: number
}

interface LogEntry {
  id: string
  feature: string
  model_used: string
  cost_brl: number
  total_tokens: number
  created_at: string
  user_id: string
  user_name: string
  user_request_count: number
}

interface DashboardClientProps {
  initialMetrics: MetricsData
  initialLogs: LogEntry[]
}

export default function DashboardClient({ initialMetrics, initialLogs }: DashboardClientProps) {
  const [metrics, setMetrics] = useState<MetricsData>(initialMetrics)
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs)
  const [isLive, setIsLive] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/metrics', { cache: 'no-store' })
      if (!res.ok) return

      const data = await res.json()
      setMetrics(data.metrics)
      setLogs(data.recentLogs)
    } catch {
      // Falha silenciosa — não queremos interromper a experiência
    }
  }, [])

  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(fetchData, 15000) // Poll a cada 15 segundos
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isLive, fetchData])

  const custoMedioPorReq = metrics.total_requests > 0
    ? metrics.total_cost_brl / metrics.total_requests
    : 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Visão Geral</h2>
          <p className="text-slate-400">Métricas em tempo real do Protocolo Viral.</p>
        </div>
        <button
          onClick={() => setIsLive(prev => !prev)}
          className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-300 ${
            isLive
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-white/10 bg-white/5 text-slate-500'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
          {isLive ? 'Ao Vivo' : 'Pausado'}
        </button>
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
            <span className="text-3xl font-bold text-white tabular-nums transition-all duration-500">{metrics.total_users || 0}</span>
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
              <span className="text-3xl font-bold text-white tabular-nums transition-all duration-500">
                {metrics.pro_subscribers}
              </span>
              <span className="text-sm text-slate-500">
                {metrics.total_users ? Math.round((metrics.pro_subscribers / metrics.total_users) * 100) : 0}% conversão
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
            <span className="text-3xl font-bold text-white tabular-nums transition-all duration-500">{metrics.total_requests.toLocaleString()}</span>
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
            <span className="text-3xl font-bold text-white tabular-nums transition-all duration-500">R$ {metrics.total_cost_brl.toFixed(4)}</span>
            <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-xs gap-1">
              Ver Modelos <span className="text-lg leading-none">&rarr;</span>
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Calculado via tokens do SDK</p>
        </Link>
      </div>

      {/* Requisições Recentes */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Requisições Recentes</h3>
            <p className="text-sm text-slate-500 mt-0.5">Últimas chamadas de IA registradas na plataforma.</p>
          </div>

        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-300">Nenhuma requisição registrada</h4>
            <p className="text-slate-500 text-sm mt-1">As chamadas de IA aparecerão aqui conforme forem feitas.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map((log) => (
              <Link
                key={log.id}
                href={`/admin/users/${log.user_id}`}
                className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm font-bold text-slate-400 shrink-0">
                    {log.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors truncate">
                        {log.user_name}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full tabular-nums shrink-0">
                        {log.user_request_count} req{log.user_request_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded font-medium">
                        {FEATURE_LABELS[log.feature] || log.feature}
                      </span>
                      <span className="text-sky-400/60 hidden sm:inline">
                        {log.model_used}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-sm font-medium text-emerald-400 tabular-nums">
                    R$ {(log.cost_brl || 0).toFixed(4)}
                  </span>
                  <span className="text-xs text-slate-600 flex items-center gap-1 hidden md:flex">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(log.created_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Formata uma data como tempo relativo (ex: "há 3 min", "há 2h")
 */
function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'agora'
  if (diffMin < 60) return `há ${diffMin} min`
  if (diffHour < 24) return `há ${diffHour}h`
  if (diffDay === 1) return 'ontem'
  return `há ${diffDay}d`
}
