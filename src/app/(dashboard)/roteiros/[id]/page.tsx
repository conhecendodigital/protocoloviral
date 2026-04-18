'use client'

import { useState, useEffect, useMemo, useCallback, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { BANCO_DE_GANCHOS, CATEGORIAS_GANCHOS } from '@/lib/ganchos'
import { ArrowLeft, ArrowLeftRight, BookOpen, Check, CheckCircle2, Clock, Copy, Mic, Pencil, RefreshCw, RotateCcw, Sparkles, Type, WandSparkles, X } from 'lucide-react'

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
  type: string
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
const BLOCK_DEFS: Record<string, { label: string; emoji: string; color: string; guide: string }> = {
  GANCHO:          { label: 'Hook',        emoji: '🪝', color: 'bg-blue-500', guide: 'O objetivo deste bloco é prender a atenção nos primeiros 3s. Edite para ser mais impactante ou gere variações.' },
  DESENVOLVIMENTO: { label: 'Development', emoji: '📝', color: 'bg-blue-500', guide: 'Este é o corpo do conteúdo. Mantenha o ritmo rápido e vá direto ao ponto, cortando palavras desnecessárias.' },
  PROBLEMA:        { label: 'Problema',    emoji: '⚠️', color: 'bg-blue-500', guide: 'Identifique a dor do seu público aqui. Quanto mais específico, maior a identificação.' },
  SOLUCAO:         { label: 'Solução',     emoji: '💡', color: 'bg-blue-500', guide: 'Apresente a sua solução de forma clara. Use demonstrações visuais se possível.' },
  CTA:             { label: 'CTA',         emoji: '📢', color: 'bg-blue-500', guide: 'A chamada para ação deve ser clara e rápida (ex: "Comenta EU QUERO", "Segue para mais").' },
  OUTROS:          { label: 'Trecho',      emoji: '📄', color: 'bg-blue-500', guide: 'Modifique este trecho para adicionar sua própria voz e ajustar o tempo do roteiro.' },
}

function parseBlocks(text: string): Block[] {
  const cleaned = text
    .replace(/\[THINKING\][\s\S]*?\[\/THINKING\]/gi, '')
    .replace(/\[METADADOS[^\]]*\]/gi, '')
    .replace(/\[ROTEIRO_FINAL\]/gi, '')
    .replace(/\[ROTEIRO_ID:[^\]]+\]/gi, '')

  // Identify any bracketed tag on its own line like [TÍTULO] or [DESENVOLVIMENTO]
  const re = /\[([A-ZÀ-Ú0-9\s-]+)\]/gim
  const segments: { type: string; content: string }[] = []
  let lastIndex = 0
  let lastType = ''
  let match: RegExpExecArray | null

  while ((match = re.exec(cleaned)) !== null) {
    if (lastType) {
      segments.push({ type: lastType, content: cleaned.slice(lastIndex, match.index) })
    } else if (match.index > 0) {
      const preContent = cleaned.slice(0, match.index)
      if (preContent.trim()) {
        segments.push({ type: 'CONTEXTO', content: preContent })
      }
    }
    lastType = match[1].toUpperCase()
      .trim()
      .replace('SOLUÇÃO', 'SOLUCAO')
      .replace('CTA E FINAL', 'CTA')
      .replace('FINAL', 'CTA')
    lastIndex = re.lastIndex
  }
  if (lastType && lastIndex < cleaned.length) {
    segments.push({ type: lastType, content: cleaned.slice(lastIndex) })
  }

  if (segments.length === 0 && cleaned.trim()) {
    return [{ type: 'OUTROS', ...BLOCK_DEFS['OUTROS'], text: cleaned.trim(), direction: '', timeSeconds: 0 }]
  }

  return segments.map(seg => {
    // Dynamic mapping for unknown tags
    let label = seg.type
    let def = BLOCK_DEFS[seg.type]
    if (!def) {
      if (seg.type.includes('GANCHO') || seg.type.includes('INÍCIO')) {
        def = BLOCK_DEFS['GANCHO']
      } else if (seg.type.includes('CTA') || seg.type.includes('CHAMADA')) {
        def = BLOCK_DEFS['CTA']
      } else if (seg.type.includes('PROBLEMA')) {
        def = BLOCK_DEFS['PROBLEMA']
      } else if (seg.type.includes('SOLUCAO') || seg.type.includes('SOLUÇÃO')) {
        def = BLOCK_DEFS['SOLUCAO']
      } else {
        def = { label: seg.type, emoji: '✨', color: 'bg-blue-500', guide: 'Modifique este trecho para adicionar sua própria voz e ajustar o tempo do roteiro.' }
      }
      label = seg.type
    } else {
      label = def.label
    }

    const dirMatch = seg.content.match(/🎤\s*(.+)/m)
    const direction = dirMatch ? dirMatch[1].trim() : ''
    const timeMatch = seg.content.match(/⏱\s*(\d+)\s*s/i)
    const timeSeconds = timeMatch ? parseInt(timeMatch[1]) : 0
    const text = seg.content
      .replace(/🎤\s*.+/gm, '')
      .replace(/⏱\s*\d+\s*s/gi, '')
      .replace(/["""„‟]/g, (c) => (c === '"' || c === '"' || c === '„' || c === '‟' ? '"' : c))
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    return { type: seg.type, label, emoji: def.emoji, color: def.color, text, direction, timeSeconds }
  }).filter(b => b.text.length > 0)
}

function computeMetrics(blocks: Block[]) {
  const totalTime = blocks.reduce((s, b) => s + b.timeSeconds, 0)
  const wordCount = blocks.reduce((s, b) => s + b.text.split(/\s+/).filter(w => w.length > 0).length, 0)
  const wps = totalTime > 0 ? (wordCount / totalTime).toFixed(1) : '-'
  return { totalTime, wordCount, wps }
}

// ────────────────────────────────────────────────────────────
// Main wrapper
// ────────────────────────────────────────────────────────────
export default function RoteiroEditorPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#F5F0E8]">
        <RefreshCw size={36} className="animate-spin text-[#0ea5e9]" />
      </div>
    }>
      <RoteiroEditorContent params={params} />
    </Suspense>
  )
}

function RoteiroEditorContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNew = searchParams?.get('new') === 'true'

  const supabase = useMemo(() => createClient(), [])

  const [roteiro, setRoteiro] = useState<Roteiro | null>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Banner "recém gerado"
  const [showBanner, setShowBanner] = useState(isNew)
  useEffect(() => {
    if (isNew) {
      const t = setTimeout(() => setShowBanner(false), 4000)
      return () => clearTimeout(t)
    }
  }, [isNew])

  // Editor state
  const [editingBlockIdx, setEditingBlockIdx] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  // AI state
  const [aiLoading, setAiLoading] = useState<number | null>(null)       // "melhorar" loading
  const [regenIdx, setRegenIdx] = useState<number | null>(null)          // block being regenerated
  const [regenPrompt, setRegenPrompt] = useState('')                     // optional instruction
  const [regenStreaming, setRegenStreaming] = useState('')                // live streamed text
  const [aiVariations, setAiVariations] = useState<string[] | null>(null)
  const [variationsBlockIdx, setVariationsBlockIdx] = useState<number | null>(null)
  const [variationsLoading, setVariationsLoading] = useState(false)

  // Hook drawer
  const [hookDrawerOpen, setHookDrawerOpen] = useState(false)
  const [hookDrawerBlockIdx, setHookDrawerBlockIdx] = useState<number | null>(null)
  const [ganchoSearch, setGanchoSearch] = useState('')
  const [ganchoCategory, setGanchoCategory] = useState('Todos')

  const filteredGanchos = useMemo(() => {
    let list = BANCO_DE_GANCHOS
    if (ganchoCategory !== 'Todos') list = list.filter(g => g.categoria === ganchoCategory)
    if (ganchoSearch.trim()) {
      const q = ganchoSearch.toLowerCase()
      list = list.filter(g => g.template.toLowerCase().includes(q) || g.gatilho.toLowerCase().includes(q))
    }
    return list
  }, [ganchoSearch, ganchoCategory])

  const metrics = useMemo(() => computeMetrics(blocks), [blocks])

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data, error } = await supabase.from('roteiros').select('*').eq('id', id).eq('user_id', user.id).single()
    if (error || !data) { setNotFound(true); setLoading(false); return }
    setRoteiro(data)
    setBlocks(parseBlocks(data.roteiro))
    setLoading(false)
  }, [id, supabase, router])

  useEffect(() => { load() }, [load])

  // ── Save full roteiro to Supabase ──
  const saveRoteiro = useCallback(async (updatedBlocks: Block[]) => {
    if (!roteiro) return
    setSaving(true)
    const rebuilt = updatedBlocks.map(b => {
      let t = `[${b.type}]\n\n${b.text}`
      if (b.direction) t += `\n🎤 ${b.direction}`
      if (b.timeSeconds) t += `\n⏱ ${b.timeSeconds}s`
      return t
    }).join('\n\n')
    await supabase.from('roteiros').update({ roteiro: rebuilt }).eq('id', roteiro.id)
    setSaving(false)
  }, [roteiro, supabase])

  // ── Edit block manually ──
  const startEdit = (idx: number) => {
    setEditingBlockIdx(idx)
    setEditText(blocks[idx].text)
    setRegenIdx(null)
  }

  const confirmEdit = async () => {
    if (editingBlockIdx === null) return
    const updated = blocks.map((b, i) => i === editingBlockIdx ? { ...b, text: editText } : b)
    setBlocks(updated)
    setEditingBlockIdx(null)
    await saveRoteiro(updated)
  }

  // ── Melhorar com IA (refina) ──
  const improveBlock = async (idx: number) => {
    const block = blocks[idx]
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
      } catch { setAiVariations(null); setVariationsBlockIdx(null) }
      finally { setVariationsLoading(false) }
      return
    }
    setAiLoading(idx)
    try {
      const res = await fetch('/api/roteirista/improve-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockType: block.type, blockText: block.text, context: blocks.map(b => `[${b.type}]\n${b.text}`).join('\n\n') }),
      })
      if (!res.ok) throw new Error('Falha na IA')
      const { improved } = await res.json()
      const updated = blocks.map((b, i) => i === idx ? { ...b, text: improved } : b)
      setBlocks(updated)
      await saveRoteiro(updated)
    } catch { /* silent */ }
    finally { setAiLoading(null) }
  }

  // ── Regenerar bloco do zero com IA (com streaming) ──
  const regenerateBlock = async (idx: number) => {
    const block = blocks[idx]
    setRegenStreaming('')
    setRegenIdx(null) // close input panel
    setAiLoading(idx)

    try {
      const res = await fetch('/api/roteirista/improve-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockType: block.type,
          blockText: block.text,
          context: blocks.map(b => `[${b.type}]\n${b.text}`).join('\n\n'),
          instruction: regenPrompt.trim() || undefined,
          mode: 'regenerate',
        }),
      })
      if (!res.ok) throw new Error('Falha na IA')

      // Try streaming first — fallback to JSON
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('text/plain') || contentType.includes('text/event-stream')) {
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''
        let done = false
        while (!done) {
          const { value, done: d } = await reader.read()
          done = d
          accumulated += decoder.decode(value, { stream: true })
          setRegenStreaming(accumulated)
        }
        const updated = blocks.map((b, i) => i === idx ? { ...b, text: accumulated.trim() } : b)
        setBlocks(updated)
        await saveRoteiro(updated)
      } else {
        const { improved } = await res.json()
        const updated = blocks.map((b, i) => i === idx ? { ...b, text: improved } : b)
        setBlocks(updated)
        await saveRoteiro(updated)
      }
    } catch { /* silent */ }
    finally { setAiLoading(null); setRegenStreaming(''); setRegenPrompt('') }
  }

  // ── Apply variation (hook) ──
  const applyVariation = async (idx: number, text: string) => {
    const updated = blocks.map((b, i) => i === idx ? { ...b, text } : b)
    setBlocks(updated)
    setAiVariations(null)
    setVariationsBlockIdx(null)
    await saveRoteiro(updated)
  }

  // ── Apply gancho template ──
  const applyGanchoTemplate = async (idx: number, template: string) => {
    setHookDrawerOpen(false)
    const updated = blocks.map((b, i) => i === idx ? { ...b, text: template } : b)
    setBlocks(updated)
    await saveRoteiro(updated)
  }

  // ── Copy all ──
  const handleCopy = async () => {
    const full = blocks.map(b => b.text).join('\n\n')
    try { await navigator.clipboard.writeText(full) }
    catch {
      const ta = document.createElement('textarea')
      ta.value = full; ta.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ────────── Render ──────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-[80vh] bg-transparent">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw size={36} className="animate-spin text-[#0ea5e9]" />
        <span className="text-sm text-slate-500 dark:text-white/50">Carregando roteiro...</span>
      </div>
    </div>
  )

  if (notFound) return (
    <div className="flex items-center justify-center min-h-[80vh] bg-transparent">
      <div className="text-center">
        <span className="text-5xl mb-4 block">😕</span>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Roteiro não encontrado</h2>
        <Link href="/roteiros" className="text-[#0ea5e9] underline text-sm">Voltar para biblioteca</Link>
      </div>
    </div>
  )

  return (
    <div className="flex-1 w-full relative z-10 overflow-y-auto custom-scrollbar flex flex-col">

      {/* ── BANNER "Roteiro gerado!" ── */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl shadow-emerald-500/30 font-bold text-sm"
          >
            <CheckCircle2 size={18} />
            Roteiro gerado com sucesso! Edite os blocos abaixo.
            <button onClick={() => setShowBanner(false)} className="ml-2 opacity-70 hover:opacity-100">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-20 bg-slate-50/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 px-4 py-3 flex items-center gap-3">
        <Link href="/roteirista" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white transition-colors">
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Voltar</span>
        </Link>
        <div className="flex-1" />
        {saving && (
          <span className="text-xs text-slate-400 dark:text-white/40 flex items-center gap-1">
            <RefreshCw size={14} className="animate-spin" />
            Salvando...
          </span>
        )}
        <Link href="/roteiros" className="text-xs text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white transition-colors flex items-center gap-1">
          <BookOpen size={14} />
          <span className="hidden sm:inline">Biblioteca</span>
        </Link>
      </div>

      {/* ── HERO CARD ── */}
      <div className="flex justify-center px-4 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl bg-slate-900 dark:bg-white/[0.04] border border-transparent dark:border-white/10 rounded-3xl p-8 text-center shadow-2xl"
        >
          <div className="text-6xl mb-5">🎬</div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4">
            {roteiro?.titulo || 'Roteiro'}
          </h1>
          {roteiro?.formato_nome && (
            <span className="inline-block mb-6 text-xs font-bold tracking-wider text-white/50 bg-white/10 rounded-full px-3 py-1 uppercase">
              {roteiro.formato_nome}
            </span>
          )}
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <Clock size={20} className="text-white/50 mx-auto mb-1" />
              <span className="text-2xl font-black text-white">{metrics.totalTime > 0 ? `${metrics.totalTime}s` : `${Math.round(metrics.wordCount / 2.5)}s`}</span>
              <span className="block text-xs text-white/40 uppercase tracking-wider">Duração</span>
            </div>
            <div className="text-center">
              <Mic size={20} className="text-white/50 mx-auto mb-1" />
              <span className="text-2xl font-black text-white">{blocks.length}</span>
              <span className="block text-xs text-white/40 uppercase tracking-wider">Seções</span>
            </div>
            <div className="text-center">
              <Type size={20} className="text-white/50 mx-auto mb-1" />
              <span className="text-2xl font-black text-white">{metrics.wordCount}</span>
              <span className="block text-xs text-white/40 uppercase tracking-wider">Palavras</span>
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
                    <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="bg-white dark:bg-[#151b2b] rounded-2xl border-2 border-blue-400 shadow-xl p-4"
                    >
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        autoFocus
                        className="w-full min-h-[160px] text-lg leading-relaxed text-slate-800 dark:text-white/90 font-medium resize-none outline-none bg-transparent placeholder:text-slate-400 dark:placeholder:text-white/30"
                        placeholder="Texto do bloco..."
                      />
                      <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-white/10">
                        <button onClick={() => setEditingBlockIdx(null)} className="px-4 py-1.5 text-sm text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white transition-colors">Cancelar</button>
                        <button onClick={confirmEdit} className="px-5 py-1.5 text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center gap-1.5">
                          <Check size={14} /> Salvar bloco
                        </button>
                      </div>
                    </motion.div>
                  ) : regenIdx === idx ? (
                    /* ── REGENERAR COM IA — input mode ── */
                    <motion.div key="regen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="bg-white dark:bg-[#151b2b] rounded-2xl border-2 border-violet-400 shadow-xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <WandSparkles size={16} className="text-violet-500" />
                        <span className="text-sm font-bold text-slate-700 dark:text-white">Regenerar bloco com IA</span>
                      </div>
                      <textarea
                        value={regenPrompt}
                        onChange={e => setRegenPrompt(e.target.value)}
                        autoFocus
                        rows={3}
                        className="w-full text-sm leading-relaxed text-slate-800 dark:text-white/90 resize-none outline-none bg-slate-50 dark:bg-[#0B0F19] rounded-xl px-3 py-2 border border-slate-200 dark:border-white/10 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-500/30 transition-all placeholder:text-slate-400 dark:placeholder:text-white/30"
                        placeholder="Instrução opcional — ex: 'Mais direto', 'Use tom de humor', 'Começa com uma pergunta'..."
                      />
                      <p className="text-xs text-slate-400 dark:text-white/40 mt-1.5 mb-3">Deixe em branco para regenerar com base no contexto do roteiro.</p>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setRegenIdx(null); setRegenPrompt('') }} className="px-4 py-1.5 text-sm text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white transition-colors">Cancelar</button>
                        <button
                          onClick={() => regenerateBlock(idx)}
                          className="px-5 py-1.5 text-sm font-bold bg-violet-500 hover:bg-violet-600 text-white rounded-xl transition-colors flex items-center gap-1.5"
                        >
                          <WandSparkles size={14} /> Regenerar
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    /* ── VIEW MODE ── */
                    <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {/* Text */}
                      <div className="text-center px-2">
                        {aiLoading === idx ? (
                          /* Streaming live preview */
                          <div className="bg-slate-100 dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
                            {regenStreaming ? (
                              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight text-left whitespace-pre-wrap">
                                {regenStreaming}
                                <span className="inline-block w-[2px] h-[1.1em] ml-[1px] bg-violet-400 align-middle animate-pulse rounded-sm" />
                              </p>
                            ) : (
                              <div className="flex items-center justify-center gap-2 py-4 text-slate-500 dark:text-white/50 text-sm">
                                <RefreshCw size={16} className="animate-spin text-violet-500" />
                                <span>Gerando com IA...</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight whitespace-pre-wrap">
                            &ldquo;{block.text.replace(/^["""]|["""]$/g, '')}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Direction + time */}
                      {(block.direction || block.timeSeconds > 0) && (
                        <div className="flex flex-col items-center gap-1 mt-4">
                          {block.direction && (
                            <p className="text-sm text-slate-500 dark:text-white/50 italic flex items-center gap-1.5">
                              <span className="text-base">🎙️</span>{block.direction}
                            </p>
                          )}
                          {block.timeSeconds > 0 && (
                            <p className="text-sm text-slate-400 dark:text-white/40 flex items-center gap-1">
                              <Clock size={14} />{block.timeSeconds}s
                            </p>
                          )}
                        </div>
                      )}

                      {/* Block Guide (Always visible but subtle) */}
                      {Object.values(BLOCK_DEFS).find(d => d.emoji === block.emoji)?.guide && (
                        <p className="text-xs text-slate-500 dark:text-white/30 text-center mt-4 max-w-md mx-auto leading-relaxed">
                          💡 {Object.values(BLOCK_DEFS).find(d => d.emoji === block.emoji)?.guide || BLOCK_DEFS['OUTROS'].guide}
                        </p>
                      )}

                      {/* Block actions — hover */}
                      <div className="flex justify-center flex-wrap gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {/* Editar manualmente */}
                        <button
                          onClick={() => startEdit(idx)}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm"
                        >
                          <Pencil size={13} /> Editar
                        </button>

                        {/* Trocar Gancho (apenas GANCHO) */}
                        {block.type === 'GANCHO' && (
                          <button
                            onClick={() => { setHookDrawerOpen(true); setHookDrawerBlockIdx(idx) }}
                            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors shadow-sm"
                          >
                            <ArrowLeftRight size={13} /> Trocar Gancho
                          </button>
                        )}

                        {/* Melhorar com IA */}
                        <button
                          onClick={() => improveBlock(idx)}
                          disabled={aiLoading === idx || variationsLoading}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors shadow-sm disabled:opacity-50"
                        >
                          {(aiLoading === idx && !regenStreaming) || (variationsLoading && variationsBlockIdx === idx) ? (
                            <RefreshCw size={13} className="animate-spin" />
                          ) : (
                            <Sparkles size={13} />
                          )}
                          {block.type === 'GANCHO' ? 'Ver 3 variações' : 'Melhorar com IA'}
                        </button>

                        {/* Regenerar do zero */}
                        <button
                          onClick={() => { setRegenIdx(idx); setEditingBlockIdx(null); setAiVariations(null) }}
                          disabled={aiLoading === idx}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors shadow-sm disabled:opacity-50"
                        >
                          <RotateCcw size={13} /> Regenerar
                        </button>
                      </div>

                      {/* AI Variations panel (Hook only) */}
                      <AnimatePresence>
                        {variationsBlockIdx === idx && aiVariations && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.3 }}
                            className="mt-5 bg-white rounded-2xl border border-blue-100 shadow-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-slate-600">✨ Escolha uma variação:</span>
                              <button onClick={() => { setAiVariations(null); setVariationsBlockIdx(null) }} className="text-slate-400 hover:text-slate-600">
                                <X size={16} />
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
          <div className="flex items-center gap-3 text-xs text-white/40 font-medium">
            <span className="flex items-center gap-1">
              <Clock size={14} className="text-white/30" />
              {metrics.totalTime > 0 ? `${metrics.totalTime}s` : `~${Math.round(metrics.wordCount / 2.5)}s`}
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Type size={14} className="text-white/30" />
              {metrics.wordCount} palavras
            </span>
            {metrics.wps !== '-' && (
              <span className="hidden sm:block text-white/30">{metrics.wps} p/s</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all border border-white/10"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado!' : 'Copiar roteiro'}
            </button>
            <Link
              href="/roteirista"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
            >
              <Sparkles size={14} />
              Novo roteiro
            </Link>
          </div>
        </div>
      </div>

      {/* ── HOOK DRAWER ── */}
      <AnimatePresence>
        {hookDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setHookDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col"
            >
              <div className="px-4 pt-5 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-black text-slate-900 text-lg">🪝 Trocar Gancho</h2>
                  <button onClick={() => setHookDrawerOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                </div>
                <input
                  type="text" placeholder="Buscar..."
                  value={ganchoSearch} onChange={e => setGanchoSearch(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all mb-3"
                />
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {['Todos', ...CATEGORIAS_GANCHOS].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setGanchoCategory(cat)}
                      className={`shrink-0 px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${ganchoCategory === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'}`}
                    >
                      {cat === 'Todos' ? '✨' : CATEGORIA_ICONS[cat]} {cat === 'Todos' ? 'Todos' : ''}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                {filteredGanchos.map(gancho => (
                  <button
                    key={gancho.id}
                    onClick={() => hookDrawerBlockIdx !== null && applyGanchoTemplate(hookDrawerBlockIdx, gancho.template)}
                    className="w-full text-left bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-xl px-4 py-3 transition-all group/item"
                  >
                    <p className="text-sm font-bold text-slate-800 leading-snug group-hover/item:text-blue-700">{gancho.template}</p>
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
