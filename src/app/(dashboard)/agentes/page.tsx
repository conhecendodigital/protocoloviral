'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/hooks/use-profile'

// ─── Paywall Overlay ────────────────────────────────────────────────
function PremiumOverlay({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center top-[15%] p-6 text-center">
      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)] mb-4">
        <span className="material-symbols-outlined text-white text-3xl">lock</span>
      </div>
      <h4 className="text-2xl font-black text-foreground mb-2">{title}</h4>
      <p className="text-sm font-medium text-muted-foreground max-w-sm mb-6 leading-relaxed">{desc}</p>
      <Link href="/assinatura" className="font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl shadow-xl shadow-indigo-500/20 hover:scale-105 transition-transform">
        Desbloquear Especialistas
      </Link>
    </div>
  )
}

export default function AgentesLibraryPage() {
  const { profile } = useProfile()
  const supabase = useMemo(() => createClient(), [])
  const [agentes, setAgentes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const isPro = (profile?.plan_tier && profile.plan_tier !== 'free') || profile?.is_admin === true


  useEffect(() => {
    async function fetchAgentes() {
      // Users will fetch only their allowed agents per RLS (all active, or all if admin)
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setAgentes(data)
      }
      setLoading(false)
    }

    fetchAgentes()
  }, [supabase])

  const isAdmin = profile?.is_admin === true

  // Filtragem e Divisão
  const activeAgents = agentes.filter(a => a.status !== 'inativo')
  const inactiveAgents = agentes.filter(a => a.status === 'inativo')

  const AgentCard = ({ agente, index }: { agente: any, index: number }) => {
    return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="relative h-full"
    >
      <div className={`group block bg-slate-50 dark:bg-white/[0.03] rounded-3xl p-6 border ${agente.status === 'inativo' ? 'border-amber-500/20 dark:border-amber-500/10 opacity-80' : 'border-slate-200 dark:border-white/[0.08]'} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full ${agente.status === 'inativo' ? 'hover:border-amber-500/40' : 'hover:border-indigo-500/40'} relative overflow-hidden flex flex-col`} >
        
        {/* Status do Agente para admins (se estiver inativo) */}
        {isAdmin && agente.status === 'inativo' && (
          <div className="absolute top-4 right-4 z-20">
            <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase ring-1 ring-inset ring-rose-500/30">Inativo</span>
          </div>
        )}

        <div className="relative z-10 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className={`size-12 rounded-xl bg-gradient-to-br ${agente.status === 'inativo' ? 'from-amber-500/20 to-orange-600/20 ring-amber-500/50' : 'from-indigo-500/20 to-purple-600/20 ring-indigo-500/50'} flex items-center justify-center ring-1`}>
              {agente.avatar_url ? (
                <img src={agente.avatar_url} alt={agente.name} className="size-12 rounded-xl object-cover" />
              ) : (
                <span className={`material-symbols-outlined ${agente.status === 'inativo' ? 'text-amber-400' : 'text-indigo-400'} text-2xl`}>robot_2</span>
              )}
            </div>
          </div>

          <h3 className="text-xl font-bold text-foreground tracking-tight mb-1">{agente.name}</h3>
          <p className={`text-xs ${agente.status === 'inativo' ? 'text-amber-400' : 'text-indigo-500 dark:text-indigo-400'} font-semibold mb-3 uppercase tracking-wider`}>{agente.category || 'Mestre'}</p>
          
          <p className="text-xs text-muted-foreground leading-relaxed mb-6 line-clamp-3 flex-1">
            {agente.description}
          </p>

          <div className="flex gap-2 mt-auto">
            {agente.status !== 'inativo' || isAdmin ? (
              <Link 
                href={`/agentes/${agente.id}/chat`}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl ${agente.status === 'inativo' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20' : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20'} transition-colors text-sm font-bold text-white shadow-lg`}
              >
                <span className="material-symbols-outlined text-[18px]">forum</span>
                Conversar
              </Link>
            ) : null}

            {isAdmin && (
                <Link 
                  href={`/agentes/${agente.id}/editar`}
                  className="flex items-center justify-center rounded-xl bg-card hover:bg-accent transition-colors w-11 text-muted-foreground hover:text-foreground border border-border"
                  title="Editar Agente"
                >
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center w-full relative z-10 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-5xl px-6 lg:px-8 py-8 md:py-12 pb-24">
        
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                <span className="material-symbols-outlined text-white text-3xl">smart_toy</span>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tighter uppercase italic"><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-[#0ea5e9] pr-2">BIBLIOTECA <span className="ml-1.5">DE</span></span> AGENTES</h1>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium mt-1">Sua equipe de especialistas</p>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl leading-relaxed mt-4">
              Converse com consultores treinados para alavancar os seus resultados. Cada agente adapta as 
              estratégias baseando-se no perfil do seu projeto.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">

            <Link 
              href="/agentes/historico" 
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border transition-colors w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-muted-foreground text-sm">history</span>
              <span className="text-sm font-bold text-foreground">Histórico</span>
            </Link>

            {isAdmin && (
              <Link 
                href="/agentes/novo" 
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 w-full sm:w-auto"
              >
                <span className="material-symbols-outlined text-white text-sm">add</span>
                <span className="text-sm font-bold text-white">Novo Agente</span>
              </Link>
            )}
          </div>
        </motion.div>


        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : agentes.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-white/[0.03] rounded-3xl border border-slate-200 dark:border-white/[0.08]">
            <span className="material-symbols-outlined text-4xl text-muted-foreground mb-2">sentiment_dissatisfied</span>
            <p className="text-muted-foreground">Nenhum agente disponível no momento.</p>
          </div>
        ) : (
          <div className="relative min-h-[500px]">
            {!isPro && (
              <PremiumOverlay 
                title="Sua Equipe Própria de IAs" 
                desc="Agentes modelados com nossos prompts e frameworks de Retenção, Mapeamento, Criativos e Edição. Assine o plano Premium para destravar toda a equipe." 
              />
            )}
            <div className={`space-y-16 ${!isPro ? 'select-none pointer-events-none opacity-40 blur-md' : ''}`}>
              {/* Grid de Agentes Ativos */}
              {activeAgents.length > 0 && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeAgents.map((agente, i) => (
                      <AgentCard key={agente.id} agente={agente} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Grid de Agentes Inativos (apenas para Admin) */}
              {isAdmin && inactiveAgents.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px bg-border flex-1"></div>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                      Agentes Inativos (Visão Admin)
                    </span>
                    <div className="h-px bg-border flex-1"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inactiveAgents.map((agente, i) => (
                      <AgentCard key={agente.id} agente={agente} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


      </div>
    </main>
  )
}
