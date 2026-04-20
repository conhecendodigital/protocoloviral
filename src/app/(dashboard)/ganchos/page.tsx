'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BANCO_DE_GANCHOS, CATEGORIAS_GANCHOS, type Gancho } from '@/lib/ganchos'
import Link from 'next/link'
import { ArrowLeft, Check, ChevronDown, ChevronUp, Copy, Search } from 'lucide-react'

const CATEGORIA_ICONS: Record<string, string> = {
  'Número + Segredo': '🔢',
  'Erro / Armadilha': '⚠️',
  'Verdade Chocante': '💥',
  'Antes e Depois': '⚡',
  'Pergunta Provocativa': '❓',
  'Promessa Direta': '🎯',
}

const CATEGORIA_COLORS: Record<string, string> = {
  'Número + Segredo':     'bg-violet-500/10 text-violet-300 border-violet-500/20',
  'Erro / Armadilha':     'bg-red-500/10 text-red-300 border-red-500/20',
  'Verdade Chocante':     'bg-orange-500/10 text-orange-300 border-orange-500/20',
  'Antes e Depois':       'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  'Pergunta Provocativa': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  'Promessa Direta':      'bg-amber-500/10 text-amber-300 border-amber-500/20',
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
    <div className="min-h-screen bg-[#0B0F19]">

      {/* ── HEADER ── */}
      <div className="bg-[#0B0F19] border-b border-white/5 px-4 pt-10 pb-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/roteirista"
            className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            Voltar
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
                🪝 Banco de Ganchos
              </h1>
              <p className="text-white/40 text-sm sm:text-base max-w-lg">
                100 templates virais prontos para usar. Adapte as{' '}
                <span className="text-blue-400 font-mono text-xs">[VARIÁVEIS]</span>{' '}
                para o seu nicho e copie direto pro roteiro.
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
              <span className="text-5xl font-black text-white/5">100</span>
              <span className="text-xs text-white/20 uppercase tracking-widest">ganchos</span>
            </div>
          </div>

          {/* Category quick stats */}
          <div className="flex gap-5 mt-6">
            {CATEGORIAS_GANCHOS.map(cat => (
              <div key={cat} className="hidden sm:flex flex-col items-center">
                <span className="text-lg">{CATEGORIA_ICONS[cat]}</span>
                <span className="text-white/20 mt-0.5" style={{ fontSize: '10px' }}>
                  {BANCO_DE_GANCHOS.filter(g => g.categoria === cat).length}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SEARCH + FILTERS ── */}
      <div className="sticky top-0 z-10 bg-[#0B0F19]/90 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Buscar ganchos, gatilhos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/25 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20 hover:text-white/60'
                }`}
              >
                {cat === 'Todos' ? '✨ Todos' : `${CATEGORIA_ICONS[cat]} ${cat}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── GRID ── */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-xs text-white/20 mb-4 font-medium">
          {filtered.length} de {BANCO_DE_GANCHOS.length} ganchos
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence>
            {filtered.map((gancho) => (
              <motion.div
                key={gancho.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="bg-white/5 rounded-2xl border border-white/8 hover:border-white/15 hover:bg-white/[0.07] transition-all group overflow-hidden"
              >
                <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${CATEGORIA_COLORS[gancho.categoria]}`}>
                    {CATEGORIA_ICONS[gancho.categoria]} {gancho.categoria}
                  </span>
                  <span className="text-xs text-white/15 font-mono font-bold shrink-0 mt-0.5">#{gancho.id}</span>
                </div>

                <div
                  className="px-4 pb-3 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === gancho.id ? null : gancho.id)}
                >
                  <p className="text-white font-semibold text-sm leading-snug group-hover:text-white/90 transition-colors">
                    {gancho.template}
                  </p>
                </div>

                <AnimatePresence>
                  {expandedId === gancho.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 space-y-2 border-t border-white/5 pt-3">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-bold text-white/20 uppercase tracking-wider w-16 shrink-0 pt-0.5">Gatilho</span>
                          <span className="text-xs text-white/50">{gancho.gatilho}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-bold text-white/20 uppercase tracking-wider w-16 shrink-0 pt-0.5">Visual</span>
                          <span className="text-xs text-white/50">{gancho.visual}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="px-4 pb-4 flex items-center gap-2">
                  <button
                    onClick={() => setExpandedId(expandedId === gancho.id ? null : gancho.id)}
                    className="text-xs text-white/25 hover:text-white/50 transition-colors flex items-center gap-1"
                  >
                    {expandedId === gancho.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {expandedId === gancho.id ? 'Ocultar' : 'Ver detalhes'}
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => handleCopy(gancho)}
                    className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                      copiedId === gancho.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/10 hover:bg-white/15 text-white/70 hover:text-white border border-white/10'
                    }`}
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
          <div className="text-center py-16">
            <span className="text-4xl mb-3 block">🔍</span>
            <p className="text-white/30 text-sm">Nenhum gancho encontrado.</p>
          </div>
        )}
      </div>
    </div>
  )
}
