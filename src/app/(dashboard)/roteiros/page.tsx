'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/hooks/use-profile'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, RefreshCw, Search, SearchX, Sparkles, Trash2, Video, X } from 'lucide-react'

interface Roteiro {
  id: string
  titulo: string
  roteiro: string
  nicho: string | null
  formato_nome: string | null
  created_at: string
}

// ─── Utility: extract hook text from saved script ────────────
function extractGancho(text: string): string {
  const ganchoMatch = text.match(/\[GANCHO\]\s*([\s\S]*?)(?=\[DESENVOLVIMENTO\]|\[CTA|\n\n\[)/i);
  if (ganchoMatch) {
    return ganchoMatch[1]
      .replace(/🎤\s*.+/g, '')
      .replace(/⏱\s*\d+\s*s/gi, '')
      .replace(/\*\*/g, '')
      .replace(/["""""]/g, '')
      .trim()
      .split('\n')
      .filter(l => l.trim())
      .slice(0, 2)
      .join(' ')
      .substring(0, 150);
  }
  // Fallback: first non-empty meaningful line
  const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('[') && !l.startsWith('TITULO'));
  return (lines[0] || '').replace(/\*\*/g, '').substring(0, 150);
}

// ─── Utility: estimate duration from word count ─────────────
function estimateDuration(text: string): number {
  const timeMatch = text.match(/⏱\s*(\d+)\s*s/gi);
  if (timeMatch && timeMatch.length >= 2) {
    let total = 0;
    timeMatch.forEach(m => {
      const n = m.match(/(\d+)/);
      if (n) total += parseInt(n[1]);
    });
    return total;
  }
  const words = text.split(/\s+/).filter(w => w.length > 0 && !w.startsWith('[') && !w.startsWith('🎤') && !w.startsWith('⏱')).length;
  return Math.round(words / 2.5);
}

// ─── Utility: count sections ─────────────────────────────────
function countSections(text: string): number {
  const brackets = text.match(/\[(GANCHO|DESENVOLVIMENTO|CTA)/gi);
  return brackets ? brackets.length : 3;
}

// ─── Color palette for card accents ──────────────────────────
const CARD_ACCENTS = [
  'from-orange-400 to-amber-500',
  'from-sky-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-emerald-400 to-green-500',
  'from-pink-400 to-rose-500',
  'from-teal-400 to-cyan-500',
  'from-indigo-400 to-blue-600',
  'from-yellow-400 to-orange-500',
];

const CARD_EMOJIS = ['🎬', '🎯', '🔥', '💡', '⚡', '🚀', '✨', '🎤', '🧠', '💎'];

export default function RoteirosPage() {
  const [roteiros, setRoteiros] = useState<Roteiro[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const supabase = useMemo(() => createClient(), [])
  const { profile } = useProfile()
  const isPro = (profile?.plan_tier && profile.plan_tier !== 'free') || profile?.is_admin === true
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRoteiros() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const { data, error } = await supabase
        .from('roteiros')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) setRoteiros(data)
      setLoading(false)
    }
    fetchRoteiros()
  }, [supabase])

  const filteredRoteiros = useMemo(() => {
    if (!searchQuery.trim()) return roteiros;
    const q = searchQuery.toLowerCase();
    return roteiros.filter(r =>
      r.titulo.toLowerCase().includes(q) ||
      r.roteiro.toLowerCase().includes(q) ||
      (r.formato_nome && r.formato_nome.toLowerCase().includes(q))
    );
  }, [roteiros, searchQuery])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={36} className="animate-spin text-[#0ea5e9] text-4xl" />
          <span className="text-sm text-slate-400">Carregando roteiros...</span>
        </div>
      </div>
    )
  }

  return (
    <main className="flex-1 flex flex-col items-center w-full relative z-10 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-24">

        {/* ═══ HEADER ═══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Minha Biblioteca 📚
            </h1>
            <Link href="/roteirista" className="flex items-center gap-1.5 bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-[#0ea5e9]/20">
              <Plus size={14} className="text-sm" />
              Novo Roteiro
            </Link>
          </div>
          <p className="text-sm text-slate-500 dark:text-white/50">
            Roteiros gerados e vídeos de referência
          </p>
        </motion.div>

        {/* ═══ SEARCH BAR ═══ */}
        <div className="mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 text-lg" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar roteiros..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9]/50 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white/70">
                <X size={14} className="text-sm" />
              </button>
            )}
          </div>
        </div>

        {/* ═══ TABS ═══ */}
        <div className="flex items-center gap-1 mb-6">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20">
            <FileEdit size={14} className="text-sm" />
            Roteiros {roteiros.length}
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
            <Video size={14} className="text-sm" />
            Vídeos
          </span>
        </div>

        {/* ═══ EMPTY STATE ═══ */}
        {roteiros.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl p-12 text-center border border-slate-200 dark:border-white/10"
          >
            <span className="text-6xl block mb-4">📝</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhum roteiro ainda</h3>
            <p className="text-slate-500 dark:text-white/50 max-w-md mx-auto mb-6">
              Vá para <strong>Produzir</strong> no menu, escolha um tema e gere seu primeiro roteiro com a IA.
            </p>
            <Link href="/roteirista" className="inline-flex items-center gap-2 bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-[#0ea5e9]/20">
              <Sparkles size={18} className="text-lg" />
              Criar Primeiro Roteiro
            </Link>
          </motion.div>
        )}

        {/* ═══ GRID DE CARDS ═══ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredRoteiros.map((r, i) => {
              const gancho = extractGancho(r.roteiro);
              const duration = estimateDuration(r.roteiro);
              const sections = countSections(r.roteiro);
              const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
              const emoji = CARD_EMOJIS[i % CARD_EMOJIS.length];
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-lg hover:border-slate-300 dark:hover:border-white/15 transition-all cursor-pointer"
                  onClick={() => router.push(`/roteiros/${r.id}`)}
                >
                  {/* Card Illustration Header */}
                  <div className={`h-24 bg-gradient-to-br ${accent} flex items-center justify-center relative overflow-hidden`}>
                    <span className="text-5xl opacity-80 select-none">{emoji}</span>
                    {/* Decorative circles */}
                    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
                    <div className="absolute -bottom-2 -left-2 w-10 h-10 rounded-full bg-white/10" />
                    {/* Delete button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} className="text-[14px]" />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug mb-2 line-clamp-2">
                      {r.titulo}
                    </h3>

                    {gancho && (
                      <p className="text-[13px] text-slate-500 dark:text-white/50 leading-relaxed mb-3 line-clamp-2">
                        {gancho}
                      </p>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {r.formato_nome && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full truncate max-w-[140px]">
                          {r.formato_nome}
                        </span>
                      )}
                    </div>

                    {/* Footer Metadata */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-white/40 font-medium">
                      <span className="flex items-center gap-1">
                        <span className="text-xs">⏱</span>
                        {duration}s
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-xs">📄</span>
                        {sections} seções
                      </span>
                      <span className="ml-auto">{formatDate(r.created_at)}</span>
                    </div>
                  </div>


                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Search no results */}
        {searchQuery && filteredRoteiros.length === 0 && roteiros.length > 0 && (
          <div className="text-center py-12">
            <SearchX size={36} className="text-4xl text-slate-300 dark:text-white/20 mb-3 block" />
            <p className="text-slate-500 dark:text-white/50 text-sm">
              Nenhum roteiro encontrado para &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

      </div>
    </main>
  )
}
