'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BANCO_DE_GANCHOS, CATEGORIAS_GANCHOS, type Gancho } from '@/lib/ganchos'
import Link from 'next/link'
import { ArrowLeft, Check, ChevronDown, ChevronUp, Copy, Search, Anchor } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIA_ICONS: Record<string, string> = {
  'Número + Segredo': '🔢',
  'Erro / Armadilha': '⚠️',
  'Verdade Chocante': '💥',
  'Antes e Depois': '⚡',
  'Pergunta Provocativa': '❓',
  'Promessa Direta': '🎯',
}

const CATEGORIA_COLORS: Record<string, string> = {
  'Número + Segredo':     'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  'Erro / Armadilha':     'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  'Verdade Chocante':     'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  'Antes e Depois':       'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  'Pergunta Provocativa': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  'Promessa Direta':      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
}

export default function GanchosPage() {
  const [activeCategory, setActiveCategory] = useState<string>('Todos')
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const categories = ['Todos', ...CATEGORIAS_GANCHOS]

  const filtered = useMemo(() => {
    let list = BANCO_DE_GANCHOS
    if (activeCategory !== 'Todos') list = list.filter(g => g.categoria === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(g =>
        g.template.toLowerCase().includes(q) ||
        g.categoria.toLowerCase().includes(q) ||
        g.gatilho.toLowerCase().includes(q)
      )
    }
    return list
  }, [activeCategory, search])

  const handleCopy = async (gancho: Gancho) => {
    try {
      await navigator.clipboard.writeText(gancho.template)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = gancho.template
      ta.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopiedId(gancho.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <main className="flex-1 flex flex-col items-center w-full relative z-10 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-24">
        
        {/* ── HEADER Limpo e Premium ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/roteirista" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#0ea5e9] transition-colors mb-6 font-bold uppercase tracking-wider">
            <ArrowLeft size={14} />
            Voltar ao Roteirista
          </Link>

          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-[#0ea5e9]/20">
                  <Anchor size={20} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Banco de Ganchos
                </h1>
              </div>
              <p className="text-slate-500 dark:text-white/50 text-sm sm:text-base max-w-lg leading-relaxed">
                100 templates virais prontos para usar. Adapte as{' '}
                <span className="text-[#0ea5e9] font-mono text-xs font-bold bg-[#0ea5e9]/10 px-1.5 py-0.5 rounded-md">[VARIÁVEIS]</span>{' '}
                para o seu nicho e copie direto pro roteiro.
              </p>
            </div>
            
            {/* Stat box elegante */}
            <div className="flex items-center gap-4 bg-white dark:bg-white/5 py-4 px-6 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 shrink-0">
              <div className="flex flex-col items-end">
                <span className="text-3xl font-black text-slate-800 dark:text-white leading-none">100</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Ganchos</span>
              </div>
              <div className="h-10 w-px bg-slate-200 dark:bg-white/10" />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Prontos</span>
                <span className="text-xs text-slate-400">para uso</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── MASTER CARD WRAPPER ── */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }} 
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="glass-card bg-white dark:bg-[#0B0F19]/50 rounded-[2rem] border border-slate-200/60 dark:border-white/10 shadow-xl overflow-hidden flex flex-col"
        >
          {/* SEARCH + FILTERS */}
          <div className="bg-slate-50/50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5 p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col space-y-5">
              
              <div className="relative w-full md:w-[360px]">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar palavras ou gatilhos..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] focus:outline-none transition-all shadow-sm"
                />
              </div>

              {/* Botões de filtro em Flex Wrap (conserta o aperto do overflow) */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "px-4 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-2",
                      activeCategory === cat
                        ? "bg-[#0ea5e9] text-white border-[#0ea5e9] shadow-md shadow-[#0ea5e9]/20"
                        : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-[#0ea5e9]/40 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <span className="text-base leading-none">
                      {cat === 'Todos' ? '✨' : CATEGORIA_ICONS[cat]}
                    </span>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* GRID */}
          <div className="p-5 sm:p-6 lg:p-8 bg-white/30 dark:bg-transparent">
            <div className="flex justify-between items-end mb-6">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                <span className="text-[#0ea5e9]">{filtered.length}</span> resultados filtrados
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((gancho) => (
                  <motion.div
                    key={gancho.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-white/5 rounded-[1.5rem] border border-slate-200 dark:border-white/5 hover:border-[#0ea5e9]/30 hover:shadow-lg dark:hover:shadow-black/50 transition-all group flex flex-col shadow-sm"
                  >
                     <div className="p-5 pb-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <span className={cn("text-[10px] font-black px-3 py-1.5 rounded-full border uppercase flex items-center gap-1.5", CATEGORIA_COLORS[gancho.categoria])}>
                            <span>{CATEGORIA_ICONS[gancho.categoria]}</span> 
                            <span className="mt-0.5">{gancho.categoria}</span>
                          </span>
                          <span className="text-[10px] text-slate-300 dark:text-slate-600 font-mono font-bold shrink-0 mt-1">
                            #{String(gancho.id).padStart(3, '0')}
                          </span>
                        </div>

                        <div className="cursor-pointer" onClick={() => setExpandedId(expandedId === gancho.id ? null : gancho.id)}>
                          <p className="text-slate-800 dark:text-white font-bold text-[15px] leading-relaxed group-hover:text-[#0ea5e9] transition-colors">
                            {gancho.template}
                          </p>
                        </div>
                     </div>

                    <AnimatePresence>
                      {expandedId === gancho.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-100 dark:border-white/5 mx-5 px-0 mt-2">
                            <div>
                              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><Check size={12} className="text-emerald-500"/> Gatilho Mental</span>
                              <span className="text-sm text-slate-600 dark:text-slate-300 font-medium pl-3 border-l-2 border-[#0ea5e9]/20 block">{gancho.gatilho}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><Check size={12} className="text-[#0ea5e9]"/> Sugestão Visual</span>
                              <span className="text-sm text-slate-600 dark:text-slate-300 font-medium pl-3 border-l-2 border-[#0ea5e9]/20 block">{gancho.visual}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="px-5 py-3 mt-auto bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 rounded-b-[1.5rem] flex items-center justify-between">
                      <button
                        onClick={() => setExpandedId(expandedId === gancho.id ? null : gancho.id)}
                        className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        {expandedId === gancho.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {expandedId === gancho.id ? 'Ocultar' : 'Detalhes'}
                      </button>
                      
                      <button
                        onClick={() => handleCopy(gancho)}
                        className={cn(
                          "inline-flex items-center gap-1.5 text-[11px] px-4 py-2 rounded-xl font-bold transition-all",
                          copiedId === gancho.id
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                            : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                        )}
                      >
                        {copiedId === gancho.id ? <Check size={14} /> : <Copy size={14} />}
                        {copiedId === gancho.id ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-24 bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 mt-6 backdrop-blur-sm">
                <span className="text-4xl mb-4 block">🔍</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Nenhum resultado</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">Tente buscar por outras palavras ou ajuste as categorias selecionadas.</p>
              </div>
            )}
            
          </div>
        </motion.div>
        
      </div>
    </main>
  )
}
