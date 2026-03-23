'use client'

import { ESTACOES_JORNADA } from '@/data/jornada-estacoes'
import { FASES } from '@/types/jornada'
import { CopyButton } from '@/components/shared/copy-button'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'jornada-completed'

function loadCompleted(): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return new Set(JSON.parse(raw))
  } catch { /* ignore */ }
  return new Set()
}

function saveCompleted(set: Set<number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
}

export default function JornadaPage() {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [completed, setCompleted] = useState<Set<number>>(new Set())

  useEffect(() => {
    setCompleted(loadCompleted())
  }, [])

  const toggleCompleted = (id: number) => {
    setCompleted(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveCompleted(next)
      return next
    })
  }

  const total = ESTACOES_JORNADA.length
  const done = completed.size
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <>
      <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar">
        <div className="p-6 lg:p-12 max-w-5xl mx-auto w-full space-y-16">
          
          {/* Welcome/Title Banner */}
          <section className="text-center space-y-4 relative z-10">
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase italic">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-[#0ea5e9]">JORNADA DE</span> CONTEÚDO
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Siga o mapa metodológico. Cada estação contém um framework pronto para cópia e aplicação imediata na sua estratégia de conteúdo.
            </motion.p>

            {/* Progress Bar */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="max-w-md mx-auto pt-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#0ea5e9]">Progresso da Jornada</span>
                <span className="text-xs font-medium text-slate-400">{done} / {total} estações</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-sky-400 to-[#0ea5e9] rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(progress, 1)}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5 text-right font-semibold">{progress}%</p>
            </motion.div>
          </section>

          {/* Phase Filters/Indicators */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap items-center justify-center gap-3">
             {FASES.map(f => (
               <div key={f.numero} className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 py-2 px-4 rounded-full border border-white/10 glass-card">
                 <span className="text-sm">{f.icone}</span>
                 <span className="font-bold tracking-widest uppercase">{f.nome}</span>
               </div>
             ))}
          </motion.div>

          {/* Stations Timeline */}
          <section className="relative space-y-6 pb-20">
            {/* Context Line */}
            <div className="absolute left-[39px] top-8 bottom-8 w-px bg-gradient-to-b from-[#0ea5e9]/50 via-[#0ea5e9]/10 to-transparent hidden md:block" />

            {ESTACOES_JORNADA.map((est, i) => {
              const isExpanded = expanded === est.id
              const fase = FASES.find(f => f.numero === est.fase)
              const isDone = completed.has(est.id)

              return (
                <motion.div
                  key={est.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4) }}
                  className="relative group"
                >
                  {/* Connecting Dot */}
                  <div className={`absolute left-[35px] top-10 size-[9px] rounded-full hidden md:block z-10 transition-colors duration-500 ${isDone ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] scale-150' : isExpanded ? 'bg-[#0ea5e9] shadow-[0_0_15px_rgba(14,165,233,0.8)] scale-150' : est.marco ? 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-[#0ea5e9]/30'}`} />

                  <div className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 md:ml-16 relative ${isDone ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : isExpanded ? 'border-[#0ea5e9]/30 bg-white/[0.03]' : est.marco ? 'border-amber-500/20 bg-amber-500/[0.02]' : 'border-white/5 hover:border-white/10'}`}>
                    
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <button
                      onClick={() => setExpanded(isExpanded ? null : est.id)}
                      className="w-full flex items-center md:items-start gap-5 p-6 text-left relative z-10 focus:outline-none"
                    >
                      <div className={`size-14 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-colors shadow-inner ${isDone ? 'bg-gradient-to-br from-emerald-400/20 to-green-500/20 text-emerald-400 border border-emerald-500/30' : est.marco ? 'bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-amber-400 border border-amber-500/30' : 'bg-black/40 text-slate-300 border border-white/10 group-hover:bg-[#0ea5e9]/10 group-hover:text-[#0ea5e9]'}`}>
                        {isDone ? (
                          <span className="material-symbols-outlined text-3xl text-emerald-400">check_circle</span>
                        ) : est.icone}
                      </div>
                      
                      <div className="flex-1 min-w-0 md:pt-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="text-[10px] text-[#0ea5e9] bg-[#0ea5e9]/10 px-2.5 py-1 rounded font-black tracking-widest uppercase">
                            #{est.id.toString().padStart(2, '0')}
                          </span>
                          <h3 className={`font-bold text-xl truncate tracking-tight ${isDone ? 'text-emerald-400 line-through decoration-emerald-400/30' : 'text-white'}`}>{est.nome}</h3>
                          {isDone && (
                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">done</span>
                              Concluída
                            </span>
                          )}
                          {est.marco && !isDone && (
                            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded flex items-center gap-1 shadow-lg shadow-amber-500/20">
                              <span className="material-symbols-outlined text-[12px]">star</span>
                              Marco
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2 md:line-clamp-1 leading-relaxed">{est.descricao}</p>
                      </div>
                      
                      <div className="shrink-0 self-center md:self-start mt-2 md:mt-4">
                        <div className={`size-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-[#0ea5e9] text-white' : 'glass-card text-slate-400 group-hover:text-white'}`}>
                          <span className={`material-symbols-outlined transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                             expand_more
                          </span>
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: 'auto', opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden relative z-10"
                        >
                          <div className="border-t border-white/10 p-6 md:p-8 space-y-6 bg-black/40 backdrop-blur-md">
                            
                            {/* Phase Indicator */}
                            <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 inline-flex px-3 py-1.5 rounded-md border border-white/5">
                              <span className="material-symbols-outlined text-[14px] text-[#0ea5e9]">trip_origin</span>
                              <span className="font-medium uppercase tracking-widest">Fase {est.fase}: <span className="text-white font-bold">{fase?.nome}</span></span>
                            </div>
                            
                            {/* Station Description */}
                            <p className="text-[15px] leading-relaxed text-slate-300">{est.descricao}</p>
                            
                            {/* Terminal Sandbox */}
                            <div className="rounded-xl overflow-hidden border border-white/10 bg-[#000000] shadow-2xl relative group/terminal">
                              <div className="flex items-center px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                                <div className="flex gap-2">
                                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <span className="ml-4 text-xs font-mono text-slate-500">prompt_estacao_{est.id.toString().padStart(2, '0')}.md</span>
                                <div className="ml-auto opacity-0 group-hover/terminal:opacity-100 transition-opacity">
                                  <CopyButton text={est.prompt} />
                                </div>
                              </div>
                              <div className="p-6 overflow-x-auto relative">
                                <pre className="text-[14px] font-mono text-[#0ea5e9] whitespace-pre-wrap leading-relaxed">
                                  {est.prompt}
                                </pre>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                              {est.useGerador && (
                                <Link
                                  href="/prompts"
                                  className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm uppercase tracking-widest bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all active:scale-[0.98]"
                                >
                                  <span className="material-symbols-outlined text-xl">magic_button</span>
                                  <span>Abrir Gerador de Prompts</span>
                                </Link>
                              )}
                              <button
                                onClick={() => toggleCompleted(est.id)}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.98] ${
                                  isDone 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' 
                                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                                }`}
                              >
                                <span className="material-symbols-outlined text-xl">
                                  {isDone ? 'undo' : 'check_circle'}
                                </span>
                                <span>{isDone ? 'Desfazer' : 'Concluída'}</span>
                              </button>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </section>

        </div>
      </main>
    </>
  )
}
