'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'

// ─── Types ──────────────────────────────────────────────
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  format?: string
  timestamp: Date
}

interface VoiceProfile {
  id: string
  name: string
  is_default: boolean
  wizard_inputs: Record<string, any>
}

interface Formato {
  id: string
  titulo: string
  icone?: string
}

// removed SUGESTOES array

// ═══════════════════════════════════════════════════════════
// ██  ROTEIRISTA PAGE — ChatGPT-style
// ═══════════════════════════════════════════════════════════
export default function RoteiristaPage() {
  // ─── State ────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'roteiro' | 'analisar'>('roteiro')

  // Plus Menu
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const plusMenuRef = useRef<HTMLDivElement>(null)

  // Voice
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([])
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null)
  const [showVoiceMenu, setShowVoiceMenu] = useState(false)

  // Format
  const [formatos, setFormatos] = useState<Formato[]>([])
  const [selectedFormato, setSelectedFormato] = useState<Formato | null>(null)
  const [showFormatMenu, setShowFormatMenu] = useState(false)

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const supabase = useMemo(() => createClient(), [])

  // ─── Load Data ────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      // Vozes
      const { data: voices } = await supabase
        .from('voice_profiles')
        .select('id, name, is_default, wizard_inputs')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (voices && voices.length > 0) {
        setVoiceProfiles(voices)
        const defaultVoice = voices.find(v => v.is_default) || voices[0]
        setSelectedVoiceId(defaultVoice.id)
      }

      // Formatos
      const { data: fmts } = await supabase
        .from('formatos')
        .select('id, titulo, icone')
        .order('titulo')

      if (fmts) setFormatos(fmts)
    }
    load()
  }, [supabase])

  // ─── Auto-scroll ──────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ─── Close menus on outside click ─────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setShowPlusMenu(false)
        setShowVoiceMenu(false)
        setShowFormatMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ─── Auto-resize textarea ────────────────────────────
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  // ─── Derived ──────────────────────────────────────────
  const selectedVoice = voiceProfiles.find(v => v.id === selectedVoiceId)
  const hasMessages = messages.length > 0

  // ─── Send Message ─────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim()
    if (!text || isGenerating) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      format: selectedFormato?.titulo,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsGenerating(true)

    const aiMsgId = crypto.randomUUID()
    setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '', timestamp: new Date() }])

    try {
      const res = await fetch('/api/roteirista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: text,
          mode: activeTab === 'analisar' ? 'analyze' : 'fast',
          voiceProfileId: selectedVoiceId,
          formatData: selectedFormato ? { id: selectedFormato.id, titulo: selectedFormato.titulo } : null,
        }),
      })

      if (!res.ok) throw new Error(await res.text())
      if (!res.body) throw new Error('No body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let currentText = ''

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunk = decoder.decode(value)

        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try { currentText += JSON.parse(line.slice(2)) } catch {}
          }
        }
        setMessages(prev =>
          prev.map(m => m.id === aiMsgId ? { ...m, content: currentText } : m)
        )
      }
    } catch (err: any) {
      setMessages(prev =>
        prev.map(m => m.id === aiMsgId ? { ...m, content: `❌ Erro: ${err.message}` } : m)
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFormatCardClick = (f: Formato) => {
    setSelectedFormato(f)
    textareaRef.current?.focus()
  }

  // ═══════════════════════════════════════════════════════
  // ██  RENDER
  // ═══════════════════════════════════════════════════════

  // Shared input component
  const renderInput = () => (
    <div className="w-full max-w-3xl mx-auto">
      {/* Active Filters */}
      <AnimatePresence>
        {(selectedFormato || selectedVoice) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-2 mb-3">
            {selectedFormato && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold border border-violet-500/20">
                <span className="material-symbols-outlined text-sm">view_carousel</span>
                {selectedFormato.titulo}
                <button onClick={() => setSelectedFormato(null)} className="hover:text-red-400 transition-colors ml-1"><span className="material-symbols-outlined text-sm">close</span></button>
              </span>
            )}
            {selectedVoice && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <span className="material-symbols-outlined text-sm">record_voice_over</span>
                {selectedVoice.name}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-3">
        <button onClick={() => setActiveTab('roteiro')} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'roteiro' ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20' : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}>
          <span className="material-symbols-outlined text-sm">edit_note</span> Roteiro
        </button>
        <button onClick={() => setActiveTab('analisar')} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'analisar' ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20' : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}>
          <span className="material-symbols-outlined text-sm">analytics</span> Analisar
        </button>
      </div>

      {/* Input Row */}
      <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-2xl px-3 py-2 focus-within:border-[#0ea5e9]/50 focus-within:ring-2 focus-within:ring-[#0ea5e9]/10 transition-all">
        {/* Plus Button */}
        <div className="relative" ref={plusMenuRef}>
          <button onClick={() => { setShowPlusMenu(!showPlusMenu); setShowVoiceMenu(false); setShowFormatMenu(false) }} className="size-9 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 flex items-center justify-center transition-colors shrink-0 mb-0.5">
            <span className={`material-symbols-outlined text-slate-600 dark:text-white/60 text-lg transition-transform ${showPlusMenu ? 'rotate-45' : ''}`}>add</span>
          </button>

          <AnimatePresence>
            {showPlusMenu && !showVoiceMenu && !showFormatMenu && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-12 left-0 w-56 bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden z-50">
                <button onClick={() => { setShowFormatMenu(true); setShowPlusMenu(false) }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined text-[#0ea5e9] text-lg">view_carousel</span>
                  <div className="text-left"><p className="font-semibold">Formato Viral</p><p className="text-[10px] text-slate-400 dark:text-white/40">Escolher estrutura</p></div>
                  <span className="material-symbols-outlined text-slate-400 ml-auto text-sm">chevron_right</span>
                </button>
                <button onClick={() => { setShowVoiceMenu(true); setShowPlusMenu(false) }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined text-violet-400 text-lg">record_voice_over</span>
                  <div className="text-left"><p className="font-semibold">Tom de Voz</p><p className="text-[10px] text-slate-400 dark:text-white/40">Alterar estilo</p></div>
                  <span className="material-symbols-outlined text-slate-400 ml-auto text-sm">chevron_right</span>
                </button>
                <Link href="/tom-de-voz" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-t border-slate-100 dark:border-white/5">
                  <span className="material-symbols-outlined text-emerald-400 text-lg">tune</span>
                  <div className="text-left"><p className="font-semibold">Configurar Tom</p><p className="text-[10px] text-slate-400 dark:text-white/40">Criar novo perfil</p></div>
                </Link>
              </motion.div>
            )}

            {showFormatMenu && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-12 left-0 w-64 max-h-72 overflow-y-auto bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40 z-50 custom-scrollbar">
                <div className="sticky top-0 bg-white dark:bg-[#141926] px-4 py-2.5 border-b border-slate-100 dark:border-white/5">
                  <button onClick={() => { setShowFormatMenu(false); setShowPlusMenu(true) }} className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-white/50 hover:text-[#0ea5e9]"><span className="material-symbols-outlined text-sm">chevron_left</span> Voltar</button>
                </div>
                <button onClick={() => { setSelectedFormato(null); setShowFormatMenu(false) }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${!selectedFormato ? 'text-[#0ea5e9]' : 'text-slate-600 dark:text-white/70'}`}><span className="material-symbols-outlined text-sm">close</span> Sem formato</button>
                {formatos.map(f => (
                  <button key={f.id} onClick={() => { setSelectedFormato(f); setShowFormatMenu(false) }} className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${selectedFormato?.id === f.id ? 'text-[#0ea5e9] bg-[#0ea5e9]/5' : 'text-slate-600 dark:text-white/70'}`}>{f.titulo}</button>
                ))}
              </motion.div>
            )}

            {showVoiceMenu && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-12 left-0 w-64 max-h-72 overflow-y-auto bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40 z-50 custom-scrollbar">
                <div className="sticky top-0 bg-white dark:bg-[#141926] px-4 py-2.5 border-b border-slate-100 dark:border-white/5">
                  <button onClick={() => { setShowVoiceMenu(false); setShowPlusMenu(true) }} className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-white/50 hover:text-[#0ea5e9]"><span className="material-symbols-outlined text-sm">chevron_left</span> Voltar</button>
                </div>
                <button onClick={() => { setSelectedVoiceId(null); setShowVoiceMenu(false) }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${!selectedVoiceId ? 'text-[#0ea5e9]' : 'text-slate-600 dark:text-white/70'}`}><span className="material-symbols-outlined text-sm">auto_awesome</span> Automático (Neutro)</button>
                {voiceProfiles.map(v => (
                  <button key={v.id} onClick={() => { setSelectedVoiceId(v.id); setShowVoiceMenu(false) }} className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between ${selectedVoiceId === v.id ? 'text-[#0ea5e9] bg-[#0ea5e9]/5' : 'text-slate-600 dark:text-white/70'}`}>
                    <span>{v.name}</span>
                    {v.is_default && <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">padrão</span>}
                  </button>
                ))}
                {voiceProfiles.length === 0 && <Link href="/tom-de-voz" className="block px-4 py-3 text-sm text-center text-[#0ea5e9] font-medium">+ Criar Tom de Voz</Link>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={activeTab === 'analisar' ? 'Cole um texto para analisar...' : 'Descreva o tema do roteiro — ex: Como ganhar seguidores no TikTok em 2025'}
          rows={1}
          disabled={isGenerating}
          className="flex-1 bg-transparent border-0 outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 resize-none py-2 leading-relaxed disabled:opacity-50 min-h-[36px] max-h-[200px]"
        />

        <button onClick={handleSend} disabled={!input.trim() || isGenerating} className={`size-9 rounded-xl flex items-center justify-center shrink-0 mb-0.5 transition-all ${input.trim() && !isGenerating ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/30 hover:bg-[#0ea5e9]/90 scale-100' : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-white/30 scale-95'}`}>
          {isGenerating ? <span className="material-symbols-outlined text-lg animate-spin">refresh</span> : <span className="material-symbols-outlined text-lg">arrow_upward</span>}
        </button>
      </div>

      <p className="text-center text-[11px] text-slate-400 dark:text-white/30 mt-2">Roteirista pode cometer erros. Revise o conteúdo gerado.</p>
    </div>
  )

  return (
    <main className="absolute inset-0 flex flex-col overflow-hidden bg-white dark:bg-[#000000]">

      {!hasMessages ? (
        /* ═══ EMPTY STATE — title + cards + input all centered ═══ */
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="size-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#0ea5e9]/20 to-indigo-500/20 border border-[#0ea5e9]/20 flex items-center justify-center shadow-[0_0_40px_rgba(14,165,233,0.15)]">
              <span className="material-symbols-outlined text-[#0ea5e9] text-4xl">auto_awesome</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">O que vamos criar hoje?</h1>
            <p className="text-sm text-slate-500 dark:text-white/50 max-w-md mx-auto">Descreva sua ideia e eu vou criar o roteiro perfeito para você, no seu tom de voz.</p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xl mx-auto mb-8">
            {formatos.slice(0, 4).map((f, i) => (
              <motion.button key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} onClick={() => handleFormatCardClick(f)} className="text-left p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/15 transition-all group flex flex-col items-start gap-2 h-full">
                <span className="material-symbols-outlined text-[#0ea5e9] text-xl block group-hover:scale-110 transition-transform">{f.icone || 'bolt'}</span>
                <p className="text-sm font-semibold text-slate-700 dark:text-white/80 leading-snug line-clamp-2" title={f.titulo}>{f.titulo}</p>
                <div className="mt-auto">
                    <span className="text-[10px] text-[#0ea5e9]/70 font-medium">Usar formato →</span>
                </div>
              </motion.button>
            ))}
            {formatos.length === 0 && (
              <div className="col-span-2 text-center text-sm text-slate-400 dark:text-white/30 py-4">
                Carregando formatos virais...
              </div>
            )}
          </div>

          {renderInput()}
        </div>
      ) : (
        /* ═══ CHAT MODE — messages scrollable + input fixed at bottom ═══ */
        <>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3 relative group ${msg.role === 'user' ? 'bg-[#0ea5e9] text-white rounded-br-md' : 'bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white/90 border border-slate-200 dark:border-white/[0.06] rounded-bl-md'}`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_p]:text-[13px] [&_li]:text-[13px] [&_p]:leading-relaxed [&_li]:leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    )}
                    {msg.format && <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 font-medium">{msg.format}</span>}
                    {msg.role === 'assistant' && (
                      <button onClick={() => navigator.clipboard.writeText(msg.content)} className="absolute -bottom-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-black/80 border border-white/10 hover:bg-white/10" title="Copiar">
                        <span className="material-symbols-outlined text-white/60 text-xs">content_copy</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/[0.06] rounded-2xl rounded-bl-md px-5 py-4">
                    <div className="flex gap-1.5">
                      <span className="size-2 rounded-full bg-slate-400 dark:bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="size-2 rounded-full bg-slate-400 dark:bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="size-2 rounded-full bg-slate-400 dark:bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          <div className="shrink-0 px-4 sm:px-6 py-4">
            {renderInput()}
          </div>
        </>
      )}
    </main>
  )
}
