'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/hooks/use-profile'

export default function AgentesLibraryPage() {
  const { profile } = useProfile()
  const supabase = useMemo(() => createClient(), [])
  const [agentes, setAgentes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  const toggleAgentStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'inativo' ? 'ativo' : 'inativo'
    // Atualização otimista
    setAgentes(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
    await supabase.from('agents').update({ status: newStatus }).eq('id', id)
  }

  const deleteAgent = async (id: string) => {
    if (!confirm('ATENÇÃO: Você tem certeza que deseja EXCLUIR PERMANENTEMENTE este agente? \n\nEsta ação apagará a base de conhecimento e as sessões de chat dele!')) return
    
    // Atualização otimista
    setAgentes(prev => prev.filter(a => a.id !== id))
    await supabase.from('agents').delete().eq('id', id)
  }

  // Filtragem e Divisão
  const activeAgents = agentes.filter(a => a.status !== 'inativo')
  const inactiveAgents = agentes.filter(a => a.status === 'inativo')

  const AgentCard = ({ agente, index }: { agente: any, index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="relative h-full"
    >
      <div className={`group block glass-card rounded-3xl p-6 border ${agente.status === 'inativo' ? 'border-amber-500/20 opacity-80' : 'border-indigo-500/20'} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full ${agente.status === 'inativo' ? 'hover:border-amber-500/40' : 'hover:border-indigo-500/40'} relative overflow-hidden flex flex-col`}>
        
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

          <h3 className="text-xl font-bold text-white tracking-tight mb-1">{agente.name}</h3>
          <p className={`text-xs ${agente.status === 'inativo' ? 'text-amber-400' : 'text-indigo-400'} font-semibold mb-3 uppercase tracking-wider`}>{agente.category || 'Mestre'}</p>
          
          <p className="text-xs text-slate-400 leading-relaxed mb-6 line-clamp-3 flex-1">
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
                  className="flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors w-11 text-slate-400 hover:text-white border border-slate-700"
                  title="Editar Agente"
                >
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )

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
                <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Biblioteca de Agentes</h1>
                <p className="text-indigo-400 font-medium mt-1">Sua equipe especialista com o seu DNA</p>
              </div>
            </div>
            <p className="text-slate-400 max-w-2xl leading-relaxed mt-4">
              Converse com consultores treinados para alavancar os seus resultados. Cada agente adapta as 
              estratégias baseando-se no perfil do seu projeto.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              href="/agentes/historico" 
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-slate-300 text-sm">history</span>
              <span className="text-sm font-bold text-white">Histórico de Sessões</span>
            </Link>

            {isAdmin && (
              <Link 
                href="/agentes/novo" 
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
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
          <div className="text-center py-20 glass-card rounded-3xl border border-white/5">
            <span className="material-symbols-outlined text-4xl text-slate-500 mb-2">sentiment_dissatisfied</span>
            <p className="text-slate-400">Nenhum agente disponível no momento.</p>
          </div>
        ) : (
          <div className="space-y-16">
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
                  <div className="h-px bg-white/10 flex-1"></div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                    Agentes Inativos (Visão Admin)
                  </span>
                  <div className="h-px bg-white/10 flex-1"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inactiveAgents.map((agente, i) => (
                    <AgentCard key={agente.id} agente={agente} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
