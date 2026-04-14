'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { useProfile } from '@/hooks/use-profile'

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
  nicho?: string
}

// removed SUGESTOES array

// ═══════════════════════════════════════════════════════════
// ██  ROTEIRISTA PAGE — ChatGPT-style
// ═══════════════════════════════════════════════════════════
export default function RoteiristaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Carregando painel do roteirista...</div>}>
      <RoteiristaContent />
    </Suspense>
  )
}

function RoteiristaContent() {
  // ─── State ────────────────────────────────────────────
  const searchParams = useSearchParams()
  const router = useRouter()
  const urlFormatoId = searchParams?.get('formato_id')
  const [messages, setMessages] = useState<Message[]>([])
  const [analisarMessages, setAnalisarMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'roteiro' | 'analisar'>('roteiro')
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const activeMessages = activeTab === 'roteiro' ? messages : analisarMessages
  const hasMessages = activeMessages.length > 0

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
  
  // Profile & Limits
  const { profile } = useProfile()
  const isPro = (profile?.plan_tier && profile.plan_tier !== 'free') || profile?.is_admin === true
  const [generationsToday, setGenerationsToday] = useState(0)

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
      const { data: fmts, error: formatErr } = await supabase
        .from('formatos')
        .select('id, titulo, nicho, estudo')
        .order('titulo')

      if (formatErr) {
        console.error("ERRO AO BUSCAR FORMATOS:", formatErr);
        const { data: fallbackFmts } = await supabase
          .from('formatos')
          .select('id, titulo')
          .order('titulo')
        if (fallbackFmts) setFormatos(fallbackFmts)
      } else if (fmts) {
        setFormatos(fmts)
      }

      // Daily Usage Count
      const startOfDay = new Date()
      startOfDay.setHours(0,0,0,0)
      const { count } = await supabase
        .from('roteiros')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .gte('created_at', startOfDay.toISOString())

      if (count !== null) {
        setGenerationsToday(count)
      }
    }
    load()
  }, [supabase])

  const [initUrlParsed, setInitUrlParsed] = useState(false)

  // ─── Sync Formato URL ─────────────────────────────────
  useEffect(() => {
    if (urlFormatoId && formatos.length > 0 && !initUrlParsed) {
      const matched = formatos.find(f => f.id === urlFormatoId)
      if (matched) {
        setSelectedFormato(matched)
      }
      setInitUrlParsed(true)
    }
  }, [urlFormatoId, formatos, initUrlParsed])

  // ─── Auto-scroll ──────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages])

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

  const selectedVoice = voiceProfiles.find(v => v.id === selectedVoiceId)

  const categorias = useMemo(() => {
    const cats = Array.from(new Set(formatos.map(f => f.nicho).filter(Boolean))) as string[];
    // Capitalize properly
    const beautified = cats.map(c => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase());
    return ["Todos", ...Array.from(new Set(beautified))];
  }, [formatos])

  const filteredFormatos = useMemo(() => {
    if (!activeFilter) return formatos;
    return formatos.filter(f => f.nicho && f.nicho.toLowerCase() === activeFilter.toLowerCase());
  }, [formatos, activeFilter])

  // ─── Handle Analyze Flow ─────────────────────────────
  const handleAnalise = async (urlStr: string) => {
    if (!urlStr.startsWith('http')) {
      alert('Por favor, insira uma URL válida (http/https).')
      setIsGenerating(false)
      return;
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: urlStr,
      timestamp: new Date(),
    }
    
    setAnalisarMessages(prev => [...prev, userMsg])
    setInput('')
    setIsGenerating(true)

    const aiMsgId = crypto.randomUUID()
    setAnalisarMessages(prev => [...prev, { 
      id: aiMsgId, 
      role: 'assistant', 
      content: '⏳ Iniciando análise do vídeo na nuvem...\n\nA inteligência artificial está assistindo o conteúdo e extraindo os roteiros. Geralmente leva de 30 a 90 segundos, aguarde aqui.', 
      timestamp: new Date() 
    }])

    try {
      // 1. Kickoff analysis
      const res = await fetch('/api/formatos/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlStr })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Falha ao acionar a análise.')
      }

      if (data.exists) {
        setAnalisarMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: '✅ Formato já existia! Redirecionando...' } : m));
        router.push(`/formatos/${data.id}?mode=edit`);
        return; // done
      }

      // 2. Poll for results
      let isDone = false;
      const startTime = Date.now();
      const timeoutMs = 180000; // 3 mins timeout

      while (!isDone) {
         if (Date.now() - startTime > timeoutMs) {
            throw new Error('A análise demorou muito tempo e excedeu o limite de espera (timeout). A automação pode ter falhado vazia.');
         }
         
         await new Promise(r => setTimeout(r, 6000)); // wait 6 seconds

         const checkRes = await fetch(`/api/formatos/check?url=${encodeURIComponent(urlStr)}`);
         const checkData = await checkRes.json();

         if (checkData.status === 'completed') {
            isDone = true;
            setAnalisarMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: '✅ Vídeo analisado com sucesso! Redirecionando para o formato salvo...' } : m));
            router.push(`/formatos/${checkData.id}?mode=edit`);
         }
      }

    } catch(err: any) {
      setAnalisarMessages(prev =>
        prev.map(m => m.id === aiMsgId ? { ...m, content: `❌ Erro na análise: ${err.message}` } : m)
      )
    } finally {
      setIsGenerating(false)
    }
  }

  // ─── Send Message ─────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim()
    if (!text || isGenerating) return

    if (activeTab === 'analisar') {
      return handleAnalise(text)
    }

    if (!isPro && generationsToday >= 5) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        format: selectedFormato?.titulo,
        timestamp: new Date(),
      }, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '🔒 **Limite Diário Atingido**\n\nVocê bateu o limite de **5 roteiros diários** do plano básico.\n\nAssine agora o nosso [Plano Premium](/assinatura) para ter acesso ilimitado!',
        timestamp: new Date()
      }])
      setInput('')
      return
    }

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
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
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
        const chunk = decoder.decode(value, { stream: true })
        currentText += chunk
        
        // Hide the hidden tag from the UI if it appears
        const displayText = currentText.replace(/\[ROTEIRO_FINAL\]/g, '').trim()
        
        setMessages(prev =>
          prev.map(m => m.id === aiMsgId ? { ...m, content: displayText } : m)
        )
      }
      
      // Increment usages today after success
      if (!isPro) {
        setGenerationsToday(prev => prev + 1)
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
        {activeTab === 'roteiro' && (selectedFormato || selectedVoice) && (
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
      <div className="relative flex items-end gap-2 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-none rounded-2xl px-3 py-2 focus-within:border-[#0ea5e9]/50 focus-within:ring-2 focus-within:ring-[#0ea5e9]/10 transition-all">
        {/* Plus Button */}
        {activeTab === 'roteiro' && (
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
        )}

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
    <main className="flex-1 flex flex-col h-[calc(100vh-80px)] lg:h-[calc(100vh-100px)] w-[calc(100%+3rem)] lg:w-[calc(100%+5rem)] -mx-6 lg:-mx-10 -mb-6 lg:-mb-10 overflow-hidden bg-transparent relative">

      {!hasMessages ? (
        /* ═══ EMPTY STATE — title + cards + input all centered ═══ */
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <div className={`size-20 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(14,165,233,0.15)] ${activeTab === 'analisar' ? 'bg-gradient-to-br from-[#0ea5e9]/20 to-indigo-500/20 border border-[#0ea5e9]/20' : 'bg-gradient-to-br from-[#0ea5e9]/20 to-indigo-500/20 border border-[#0ea5e9]/20'}`}>
              <span className="material-symbols-outlined text-[#0ea5e9] text-4xl">
                {activeTab === 'analisar' ? 'analytics' : 'auto_awesome'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              {activeTab === 'analisar' ? 'Extrair Formato de um Vídeo' : 'O que vamos criar hoje?'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-white/50 max-w-md mx-auto">
              {activeTab === 'analisar' 
                ? 'Cole o link público de um Reels ou TikTok e a Roteirista AI irá analisar o vídeo para extrair a estrutura, criando um novo formato para você reutilizar.' 
                : 'Descreva sua ideia ou explore dezenas de formatos virais para o seu roteiro.'
              }
            </p>
          </motion.div>

          <AnimatePresence>
            {activeTab === 'roteiro' && formatos.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, overflow: 'hidden' }} className="flex flex-wrap items-center justify-center gap-2 mb-4 w-full max-w-2xl mx-auto px-4">
                {categorias.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveFilter(cat === 'Todos' ? null : cat)}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-all border ${
                      (activeFilter?.toLowerCase() === cat.toLowerCase()) || (!activeFilter && cat === 'Todos')
                        ? 'bg-[#0ea5e9] text-white border-[#0ea5e9] shadow-lg shadow-[#0ea5e9]/20 scale-105' 
                        : 'bg-transparent text-slate-500 dark:text-white/50 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === 'roteiro' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full max-w-3xl mx-auto mb-8 max-h-[35vh] overflow-y-auto custom-scrollbar p-2">
              {filteredFormatos.slice(0, 15).map((f, i) => (
                <motion.button key={f.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} onClick={() => handleFormatCardClick(f)} className="text-left p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-[#0ea5e9]/30 transition-all group flex flex-col items-start gap-1.5 h-full relative overflow-hidden">
                  <span className="material-symbols-outlined text-[#0ea5e9] text-lg block group-hover:scale-110 group-hover:rotate-6 transition-transform">{f.icone || 'bolt'}</span>
                  {f.nicho && <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-white/30">{f.nicho}</span>}
                  <p className="text-xs font-semibold text-slate-700 dark:text-white/80 leading-snug line-clamp-3 mb-2" title={f.titulo}>{f.titulo}</p>
                  <div className="mt-auto pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-[#0ea5e9] font-bold bg-[#0ea5e9]/10 px-2 py-0.5 rounded-full inline-block">Usar →</span>
                  </div>
                </motion.button>
              ))}
              {formatos.length === 0 && (
                <div className="col-span-full text-center text-sm text-slate-400 dark:text-white/30 py-8">
                  <span className="material-symbols-outlined text-3xl mb-2 opacity-50 animate-pulse">hourglass_top</span>
                  <p>Carregando formatos virais...</p>
                </div>
              )}
              {filteredFormatos.length === 0 && formatos.length > 0 && (
                <div className="col-span-full text-center text-sm text-slate-400 dark:text-white/30 py-8">
                  Nenhum formato encontrado para este filtro.
                </div>
              )}
            </div>
          ) : (
            <div className="mb-8 p-6 max-w-xl mx-auto flex items-center gap-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-3xl text-left">
              <div className="size-12 shrink-0 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                 <span className="material-symbols-outlined">psychology</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Como funciona a engenharia?</h3>
                <p className="text-[13px] text-slate-500 dark:text-white/50 leading-relaxed">
                  Basta colar a URL no campo abaixo. A inteligência artificial irá extrair todo o conteúdo frame-a-frame, analisar os ganchos mentais e mapear a estrutura para o seu acervo de formatos dentro do app.
                </p>
              </div>
            </div>
          )}

          {renderInput()}
        </div>
      ) : (
        /* ═══ CHAT MODE — messages scrollable + input fixed at bottom ═══ */
        <>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
              {activeMessages.map((msg) => (
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
