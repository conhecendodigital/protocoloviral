'use client'

import { useState, useEffect, useMemo, useCallback, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BANCO_DE_GANCHOS, CATEGORIAS_GANCHOS, type Gancho } from '@/lib/ganchos'
import { ArrowLeft, ArrowLeftRight, BookOpen, Check, Clock, Copy, Mic, Pencil, RefreshCw, Sparkles, Type, X } from 'lucide-react'

const CATEGORIA_ICONS: Record<string, string> = {
  'Número + Segredo': '🔢',
  'Erro / Armadilha': '⚠️',
  'Verdade Chocante': '💥',
  'Antes e Depois': '⚡',
  'Pergunta Provocativa': '❓',
  'Promessa Direta': '🎯',
}


// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────
interface Block {
  type: 'GANCHO' | 'DESENVOLVIMENTO' | 'CTA' | 'PROBLEMA' | 'SOLUCAO' | 'OUTROS'
  label: string
  emoji: string
  color: string
  text: string
  direction: string
  timeSeconds: number
}

interface Roteiro {
  id: string
  titulo: string
  roteiro: string
  formato_nome: string | null
  created_at: string
}

// ────────────────────────────────────────────────────────────
// Parser — extrai blocos com direção e tempo
// ────────────────────────────────────────────────────────────
const BLOCK_DEFS: Record<string, { label: string; emoji: string; color: string }> = {
  GANCHO:       { label: 'Hook',             emoji: '🪝', color: 'bg-blue-500' },
  DESENVOLVIMENTO: { label: 'Development',   emoji: '📝', color: 'bg-blue-500' },
  PROBLEMA:     { label: 'Problema',          emoji: '⚠️', color: 'bg-blue-500' },
  SOLUCAO:      { label: 'Solução',           emoji: '💡', color: 'bg-blue-500' },
  CTA:          { label: 'CTA',              emoji: '📢', color: 'bg-blue-500' },
  OUTROS:       { label: 'Trecho',           emoji: '📄', color: 'bg-blue-500' },
}

function parseBlocks(text: string): Block[] {
  // Strip METADADOS, THINKING
  const cleaned = text
    .replace(/\[THINKING\][\s\S]*?\[\/THINKING\]/gi, '')
    .replace(/\[METADADOS[^\]]*\]/gi, '')
    .replace(/\[ROTEIRO_FINAL\]/gi, '')
    .replace(/\[ROTEIRO_ID:[^\]]+\]/gi, '')

  // Split on block markers
  const blockRegex = /\[?(GANCHO|DESENVOLVIMENTO|PROBLEMA|SOLUCAO|SOLUÇÃO|CTA E FINAL|CTA|FINAL|OUTROS)\]?/gi
  const segments: { type: string; content: string }[] = []

  let lastIndex = 0
  let lastType = ''
  let match: RegExpExecArray | null

  // reset regex
  const re = new RegExp(blockRegex.source, 'gi')
  while ((match = re.exec(cleaned)) !== null) {
    if (lastType) {
      segments.push({ type: lastType, content: cleaned.slice(lastIndex, match.index) })
    }
    lastType = match[1].toUpperCase()
      .replace('SOLUÇÃO', 'SOLUCAO')
      .replace('CTA E FINAL', 'CTA')
      .replace('FINAL', 'CTA')
    lastIndex = re.lastIndex
  }
  if (lastType && lastIndex < cleaned.length) {
    segments.push({ type: lastType, content: cleaned.slice(lastIndex) })
  }

  // If no block markers found, try to return the raw text as one block
  if (segments.length === 0 && cleaned.trim()) {
    return [{
      type: 'OUTROS',
      ...BLOCK_DEFS['OUTROS'],
      text: cleaned.trim(),
      direction: '',
      timeSeconds: 0,
    }]
  }

  return segments.map(seg => {
    const defKey = Object.keys(BLOCK_DEFS).includes(seg.type) ? seg.type : 'OUTROS'
    const def = BLOCK_DEFS[defKey as keyof typeof BLOCK_DEFS]

    // Extract direction line (🎤 ...)
    const dirMatch = seg.content.match(/🎤\s*(.+)/m)
    const direction = dirMatch ? dirMatch[1].trim() : ''

    // Extract time (⏱ Xs)
    const timeMatch = seg.content.match(/⏱\s*(\d+)\s*s/i)
    const timeSeconds = timeMatch ? parseInt(timeMatch[1]) : 0

    // Strip metadata from display text
    const text = seg.content
      .replace(/🎤\s*.+/gm, '')
      .replace(/⏱\s*\d+\s*s/gi, '')
      .replace(/["""""]/g, (c) => c === '"' || c === '"' || c === '„' || c === '‟' ? '"' : c)
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    return {
      type: defKey as Block['type'],
      ...def,
      text,
      direction,
      timeSeconds,
    }
  }).filter(b => b.text.length > 0)
}

function computeMetrics(blocks: Block[]) {
  const totalTime = blocks.reduce((s, b) => s + b.timeSeconds, 0)
  const wordCount = blocks.reduce((s, b) => s + b.text.split(/\s+/).filter(w => w.length > 0).length, 0)
  const wps = totalTime > 0 ? (wordCount / totalTime).toFixed(1) : '-'
  return { totalTime, wordCount, wps }
}

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────
export default function RoteiroEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [roteiro, setRoteiro] = useState<Roteiro | null>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Editor state
  const [editingBlockIdx, setEditingBlockIdx] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [aiLoading, setAiLoading] = useState<number | null>(null)

  // Hook drawer state
  const [hookDrawerOpen, setHookDrawerOpen] = useState(false)
  const [hookDrawerBlockIdx, setHookDrawerBlockIdx] = useState<number | null>(null)
  const [ganchoSearch, setGanchoSearch] = useState('')
  const [ganchoCategory, setGanchoCategory] = useState('Todos')

  // AI variations for Hook
  const [aiVariations, setAiVariations] = useState<string[] | null>(null)
  const [variationsBlockIdx, setVariationsBlockIdx] = useState<number | null>(null)
  const [variationsLoading, setVariationsLoading] = useState(false)

  // Filtered ganchos for drawer
  const filteredGanchos = useMemo(() => {
    let list = BANCO_DE_GANCHOS
    if (ganchoCategory !== 'Todos') list = list.filter(g => g.categoria === ganchoCategory)
    if (ganchoSearch.trim()) {
      const q = ganchoSearch.toLowerCase()
      list = list.filter(g => g.template.toLowerCase().includes(q) || g.gatilho.toLowerCase().includes(q))
    }
    return list
  }, [ganchoSearch, ganchoCategory])

  // Metrics
  const metrics = useMemo(() => computeMetrics(blocks), [blocks])

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error } = await supabase
      .from('roteiros')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !data) { setNotFound(true); setLoading(false); return }

    setRoteiro(data)
    setBlocks(parseBlocks(data.roteiro))
    setLoading(false)
  }, [id, supabase, router])

  useEffect(() => { load() }, [load])

  // ── Save full roteiro back to Supabase ──
  const saveRoteiro = useCallback(async (updatedBlocks: Block[]) => {
    if (!roteiro) return
    setSaving(true)
    const rebuilt = updatedBlocks.map(b => {
      let blockText = `[${b.type}]\n\n${b.text}`
      if (b.direction) blockText += `\n🎤 ${b.direction}`
      if (b.timeSeconds) blockText += `\n⏱ ${b.timeSeconds}s`
      return blockText
    }).join('\n\n')

    await supabase.from('roteiros').update({ roteiro: rebuilt }).eq('id', roteiro.id)
    setSaving(false)
  }, [roteiro, supabase])

  // ── Edit block ──
  const startEdit = (idx: number) => {
    setEditingBlockIdx(idx)
    setEditText(blocks[idx].text)
  }

  const confirmEdit = async () => {
    if (editingBlockIdx === null) return
    const updated = blocks.map((b, i) => i === editingBlockIdx ? { ...b, text: editText } : b)
    setBlocks(updated)
    setEditingBlockIdx(null)
    await saveRoteiro(updated)
  }

  // ── AI improve block ──
  const improveBlock = async (idx: number) => {
    const block = blocks[idx]
    // For GANCHO: show 3 variations instead of auto-replacing
    if (block.type === 'GANCHO') {
      setVariationsLoading(true)
      setVariationsBlockIdx(idx)
      setAiVariations(null)
      try {
        const res = await fetch('/api/roteirista/improve-block', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blockType: 'GANCHO',
            blockText: block.text,
            context: blocks.map(b => `[${b.type}]\n${b.text}`).join('\n\n'),
            variations: true,
          }),
        })
        if (!res.ok) throw new Error('Falha na IA')
        const data = await res.json()
        setAiVariations(data.variations || [data.improved])
      } catch {
        setAiVariations(null)
        setVariationsBlockIdx(null)
      } finally {
        setVariationsLoading(false)
      }
      return
    }
    // For other blocks: auto-replace
    setAiLoading(idx)
    try {
      const res = await fetch('/api/roteirista/improve-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockType: block.type,
          blockText: block.text,
          context: blocks.map(b => `[${b.type}]\n${b.text}`).join('\n\n'),
        }),
      })
      if (!res.ok) throw new Error('Falha na IA')
      const { improved } = await res.json()
      const updated = blocks.map((b, i) => i === idx ? { ...b, text: improved } : b)
      setBlocks(updated)
      await saveRoteiro(updated)
    } catch {
      // silent fail
    } finally {
      setAiLoading(null)
    }
  }

  // ── Apply a variation ──
  const applyVariation = async (idx: number, text: string) => {
    const updated = blocks.map((b, i) => i === idx ? { ...b, text } : b)
    setBlocks(updated)
    setAiVariations(null)
    setVariationsBlockIdx(null)
    await saveRoteiro(updated)
  }

  // ── Apply a gancho template from drawer ──
  const applyGanchoTemplate = async (idx: number, template: string) => {
    setHookDrawerOpen(false)
    const updated = blocks.map((b, i) => i === idx ? { ...b, text: template } : b)
    setBlocks(updated)
    await saveRoteiro(updated)
  }

  // ── Copy all ──
  const handleCopy = async () => {
    const full = blocks.map(b => b.text).join('\n\n')
    try {
      await navigator.clipboard.writeText(full)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = full
      ta.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Save (bookmark) ──
  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // ────────── Render ──────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F0E8]">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw size={36} className="animate-spin text-[#0ea5e9] text-4xl" />
        <span className="text-sm text-slate-500">Carregando roteiro...</span>
      </div>
    </div>
  )

  if (notFound) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F0E8]">
      <div className="text-center">
        <span className="text-5xl mb-4 block">😕</span>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Roteiro não encontrado</h2>
        <Link href="/roteiros" className="text-[#0ea5e9] underline text-sm">Voltar para biblioteca</Link>
      </div>
    </div>
  )

  return (
    /* PandaBay-style: creme/areia background, fullscreen, no inner padding */
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col relative">

      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-20 bg-[#F5F0E8]/80 backdrop-blur-sm border-b border-black/5 px-4 py-3 flex items-center gap-3">
        <Link href="/roteirista" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={18} className="text-lg" />
          <span className="hidden sm:inline">Voltar</span>
        </Link>
        <div className="flex-1" />
        {saving && (
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <RefreshCw size={14} className="animate-spin text-sm" />
            Salvando...
          </span>
        )}
        <Link href="/roteiros" className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1">
          <BookOpen size={14} className="text-sm" />
          <span className="hidden sm:inline">Biblioteca</span>
        </Link>
      </div>

      {/* ── HERO CARD ── */}
      <div className="flex justify-center px-4 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl bg-slate-900 rounded-3xl p-8 text-center shadow-2xl"
        >
          {/* Illustration placeholder — emoji art */}
          <div className="text-6xl mb-5">🎬</div>

          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4">
            {roteiro?.titulo || 'Roteiro'}
          </h1>

          {/* Format badge */}
          {roteiro?.formato_nome && (
            <span className="inline-block mb-6 text-xs font-bold tracking-wider text-white/50 bg-white/10 rounded-full px-3 py-1 uppercase">
              {roteiro.formato_nome}
            </span>
          )}

          {/* Metrics row */}
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <Clock size={20} className="text-white/50 text-xl block" />
              <span className="text-2xl font-black text-white">{metrics.totalTime > 0 ? `${metrics.totalTime}s` : `${Math.round(metrics.wordCount / 2.5)}s`}</span>
              <span className="text-xs text-white/40 uppercase tracking-wider">Duração</span>
            </div>
            <div className="text-center">
              <Mic size={20} className="text-white/50 text-xl block" />
              <span className="text-2xl font-black text-white">{blocks.length}</span>
              <span className="text-xs text-white/40 uppercase tracking-wider">Seções</span>
            </div>
            <div className="text-center">
              <Type size={20} className="text-white/50 text-xl block" />
              <span className="text-2xl font-black text-white">{metrics.wordCount}</span>
              <span className="text-xs text-white/40 uppercase tracking-wider">Palavras</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── BLOCKS ── */}
      <div className="flex-1 flex flex-col items-center px-4 py-4 pb-32 gap-0">
        <div className="w-full max-w-2xl">
          {blocks.map((block, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              {/* Badge */}
              <div className="z-10 my-5">
                <span className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20">
                  {block.emoji} {block.label}
                </span>
              </div>

              {/* Block content card */}
              <div className="w-full relative group">
                <AnimatePresence mode="wait">
                  {editingBlockIdx === idx ? (
                    /* ── EDIT MODE ── */
                    <motion.div
                      key="edit"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white rounded-2xl border-2 border-blue-400 shadow-xl p-4"
                    >
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        autoFocus
                        className="w-full min-h-[160px] text-lg leading-relaxed text-slate-800 font-medium resize-none outline-none bg-transparent"
                        placeholder="Texto do bloco..."
                      />
                      <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => setEditingBlockIdx(null)}
                          className="px-4 py-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={confirmEdit}
                          className="px-5 py-1.5 text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                        >
                          Salvar bloco
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    /* ── VIEW MODE ── */
                    <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {/* Text */}
                      <div className="text-center px-2">
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                          &ldquo;{block.text.replace(/^[""]|[""]$/g, '')}&rdquo;
                        </p>
                      </div>

                      {/* Direction + time */}
                      {(block.direction || block.timeSeconds > 0) && (
                        <div className="flex flex-col items-center gap-1 mt-4">
                          {block.direction && (
                            <p className="text-sm text-slate-500 italic flex items-center gap-1.5">
                              <span className="text-base">🎙️</span>
                              {block.direction}
                            </p>
                          )}
                          {block.timeSeconds > 0 && (
                            <p className="text-sm text-slate-400 flex items-center gap-1">
                              <Clock size={14} className="text-sm" />
                              {block.timeSeconds}s
                            </p>
                          )}
                        </div>
                      )}

                      {/* Block actions — appear on hover */}
                      <div className="flex justify-center flex-wrap gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(idx)}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                          <Pencil size={14} className="text-sm" />
                          Editar
                        </button>
                        {block.type === 'GANCHO' && (
                          <button
                            onClick={() => { setHookDrawerOpen(true); setHookDrawerBlockIdx(idx) }}
                            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors shadow-sm"
                          >
                            <ArrowLeftRight size={14} className="text-sm" />
                            Trocar Gancho
                          </button>
                        )}
                        <button
                          onClick={() => improveBlock(idx)}
                          disabled={aiLoading === idx || variationsLoading}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shadow-sm disabled:opacity-50"
                        >
                          {(aiLoading === idx || (variationsLoading && variationsBlockIdx === idx)) ? (
                            <RefreshCw size={14} className="animate-spin text-sm" />
                          ) : (
                            <Sparkles size={14} className="text-sm" />
                          )}
                          {block.type === 'GANCHO' ? 'Ver 3 variações' : 'Melhorar com IA'}
                        </button>
                      </div>

                      {/* AI Variations panel (Hook only) */}
                      <AnimatePresence>
                        {variationsBlockIdx === idx && aiVariations && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.3 }}
                            className="mt-5 bg-white rounded-2xl border border-blue-100 shadow-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-slate-600">✨ Escolha uma variação:</span>
                              <button onClick={() => { setAiVariations(null); setVariationsBlockIdx(null) }} className="text-slate-400 hover:text-slate-600">
                                <X size={16} className="text-base" />
                              </button>
                            </div>
                            <div className="space-y-2">
                              {aiVariations.map((v, vi) => (
                                <button
                                  key={vi}
                                  onClick={() => applyVariation(idx, v)}
                                  className="w-full text-left text-sm font-bold text-slate-800 bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-xl px-4 py-3 transition-all leading-snug"
                                >
                                  <span className="text-blue-500 font-mono text-xs mr-2">{vi + 1}.</span>
                                  &ldquo;{v}&rdquo;
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider between blocks */}
              {idx < blocks.length - 1 && (
                <div className="w-px h-10 bg-slate-300 mt-4" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM FIXED FOOTER ── */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-slate-900 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Metrics */}
          <div className="flex items-center gap-3 text-xs text-white/40 font-medium">
            <span className="flex items-center gap-1">
              <Clock size={14} className="text-sm text-white/30" />
              {metrics.totalTime > 0 ? `${metrics.totalTime}s` : `~${Math.round(metrics.wordCount / 2.5)}s`}
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Type size={14} className="text-sm text-white/30" />
              {metrics.wordCount} palavras
            </span>
            {metrics.wps !== '-' && (
              <span className="hidden sm:block text-white/30">{metrics.wps} p/s</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all border border-white/10"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado!' : 'Copiar roteiro'}
            </button>

            <button
              onClick={() => {
                handleSave()
                router.push('/roteirista')
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
            >
              {saved ? <Check size={14} /> : <Pencil size={14} />}
              {saved ? 'Salvo!' : 'Editar roteiro'}
            </button>
          </div>
        </div>
      </div>
      {/* ── HOOK DRAWER ── */}
      <AnimatePresence>
        {hookDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHookDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col"
            >
              {/* Drawer header */}
              <div className="px-4 pt-5 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-black text-slate-900 text-lg">🪝 Trocar Gancho</h2>
                  <button onClick={() => setHookDrawerOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={ganchoSearch}
                  onChange={e => setGanchoSearch(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all mb-3"
                />
                {/* Category filter */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {['Todos', ...CATEGORIAS_GANCHOS].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setGanchoCategory(cat)}
                      className={`shrink-0 px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                        ganchoCategory === cat
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {cat === 'Todos' ? '✨' : CATEGORIA_ICONS[cat]} {cat === 'Todos' ? 'Todos' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drawer list */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                {filteredGanchos.map(gancho => (
                  <button
                    key={gancho.id}
                    onClick={() => hookDrawerBlockIdx !== null && applyGanchoTemplate(hookDrawerBlockIdx, gancho.template)}
                    className="w-full text-left bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-xl px-4 py-3 transition-all group/item"
                  >
                    <p className="text-sm font-bold text-slate-800 leading-snug group-hover/item:text-blue-700">
                      {gancho.template}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{CATEGORIA_ICONS[gancho.categoria]} {gancho.categoria} · {gancho.gatilho}</p>
                  </button>
                ))}
                {filteredGanchos.length === 0 && (
                  <p className="text-center text-sm text-slate-400 py-10">Nenhum gancho encontrado.</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
