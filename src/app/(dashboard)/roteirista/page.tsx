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
import { ScriptRenderer } from '@/components/roteirista/ScriptRenderer'
import { ArrowUp, BarChart3, Brain, CheckCircle, ChevronLeft, ChevronRight, FileEdit, LayoutDashboard, Mic2, Plus, RefreshCw, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

// ─── Streaming text with ChatGPT-style cursor ─────────────────
function StreamingText({ content }: { content: string }) {
  // Strip internal tokens from display
  const clean = content
    .replace(/\[THINKING\][\s\S]*?(\[\/THINKING\]|$)/g, '')
    .replace(/\[METADADOS[^\]]*\]/gi, '')
    .replace(/\[ROTEIRO_FINAL\]/gi, '')
    .replace(/\[ROTEIRO_ID:[^\]]+\]/gi, '')
    .trim()

  return (
    <div className="text-sm leading-relaxed text-slate-900 dark:text-white/90 whitespace-pre-wrap font-normal">
      {clean}
      <span
        className="inline-block w-[2px] h-[1.1em] ml-[1px] bg-slate-400 dark:bg-white/50 align-middle animate-pulse rounded-sm"
        aria-hidden
      />
    </div>
  )
}

// ─── Types ──────────────────────────────────────────────
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  format?: string
  timestamp: Date
  locked?: boolean
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

const HARDCODED_FORMATOS: Formato[] = [
  { id: 'ancoragem',            titulo: 'Ancoragem / Storytelling' },
  { id: 'bastidores',           titulo: 'Bastidores e Comparação' },
  { id: 'curiosidade',          titulo: 'Curiosidade' },
  { id: 'curiosidade-noticia',  titulo: 'Curiosidade / Notícia' },
  { id: 'dica-util',            titulo: 'Dica Útil do Dia' },
  { id: 'ensino-oculto',        titulo: 'Ensino Oculto' },
  { id: 'geral',                titulo: 'Geral (Tutorial Rápido)' },
  { id: 'lista',                titulo: 'Lista Chocante' },
  { id: 'nutricao',             titulo: 'Desmistificação (Nutrição/Consumo)' },
  { id: 'pergunta-resposta',    titulo: 'Perguntas e Respostas' },
  { id: 'preguicoso',           titulo: 'Preguiçoso (Sem Esforço)' },
  { id: 'problema-solucao',     titulo: 'Problema / Solução' },
  { id: 'react',                titulo: 'Reação (React)' },
  { id: 'react-analise',        titulo: 'React / Análise' },
  { id: 'tutorial',             titulo: 'Tutorial (Passo a Passo)' },
]
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

  const [urlError, setUrlError] = useState<string | null>(null)
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

      // Formatos - Carregando a lista fixa padronizada
      setFormatos(HARDCODED_FORMATOS)

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
      setUrlError('Insira uma URL válida começando com http ou https.')
      setIsGenerating(false)
      return;
    }
    setUrlError(null)

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

    // Teaser Paywall Logic: a cota foi extrapolada ANTES deste clique?
    const isLockedMsg = !isPro && generationsToday >= 5;

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
    setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '', timestamp: new Date(), locked: isLockedMsg }])

    try {
      const res = await fetch('/api/roteirista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          mode: activeTab === 'analisar' ? 'analyze' : (isPro ? 'search' : 'fast'),
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
      let capturedRoteiroId: string | null = null

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunk = decoder.decode(value, { stream: true })
        currentText += chunk

        // Capture roteiro ID sentinel before displaying
        const idMatch = currentText.match(/\[ROTEIRO_ID:([a-f0-9-]+)\]/i)
        if (idMatch) capturedRoteiroId = idMatch[1]

        // Strip internal tokens from display
        let displayText = currentText
          .replace(/\[ROTEIRO_FINAL\]/g, '')
          .replace(/\[ROTEIRO_ID:[a-f0-9-]+\]/gi, '')

        // Ocultar blocos de raciocínio lógico (CoT) com uma mensagem de status atraente
        displayText = displayText.replace(/\[THINKING\][\s\S]*?(\[\/THINKING\]|$)/g, '> 🧠 **Ativando Raciocínio Profundo...**\n> Analisando formato e tom de voz antes de escrever...\n\n')

        displayText = displayText.trim()

        setMessages(prev =>
          prev.map(m => m.id === aiMsgId ? { ...m, content: displayText } : m)
        )
      }

      // Verifica se terminou vazio
      if (currentText.trim() === '') {
        throw new Error('A Vercel ou Inteligência Artificial fechou a conexão sem retornar nenhum texto.')
      }

      // Increment usages today after success
      if (!isPro) {
        setGenerationsToday(prev => prev + 1)
      }

      // ✅ If we got the ID: swap message to success state and redirect immediately
      if (capturedRoteiroId) {
        setMessages(prev =>
          prev.map(m =>
            m.id === aiMsgId
              ? { ...m, content: `__REDIRECT__${capturedRoteiroId}` }
              : m
          )
        )
        router.push(`/roteiros/${capturedRoteiroId}`)
      }

    } catch (err: any) {
      setMessages(prev =>
        prev.map(m => m.id === aiMsgId ? { ...m, content: `❌ Erro de Conexão Frontend:\n\nUm erro impediu a resposta. Detalhes técnicos para o Eng:\n\`\`\`\n${err.message || String(err)}\n\`\`\`` } : m)
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
                <LayoutDashboard size={14} className="text-sm" />
                {selectedFormato.titulo}
                <button onClick={() => setSelectedFormato(null)} className="hover:text-red-400 transition-colors ml-1"><X size={14} className="text-sm" /></button>
              </span>
            )}
            {selectedVoice && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <Mic2 size={14} className="text-sm" />
                {selectedVoice.name}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-3">
        <button onClick={() => setActiveTab('roteiro')} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'roteiro' ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20' : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}>
          <FileEdit size={14} className="text-sm" /> Roteiro
        </button>
        <button onClick={() => setActiveTab('analisar')} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'analisar' ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20' : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}>
          <BarChart3 size={14} className="text-sm" /> Analisar
        </button>
      </div>

      {/* Input Row */}
      <div className="relative flex items-end gap-2 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-none rounded-2xl px-3 py-2 focus-within:border-[#0ea5e9]/50 focus-within:ring-2 focus-within:ring-[#0ea5e9]/10 transition-all">
        {/* Plus Button */}
        {activeTab === 'roteiro' && (
          <div className="relative" ref={plusMenuRef}>
            <button onClick={() => { setShowPlusMenu(!showPlusMenu); setShowVoiceMenu(false); setShowFormatMenu(false) }} className="size-9 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 flex items-center justify-center transition-colors shrink-0 mb-0.5">
              <Plus size={18} className={`text-slate-600 dark:text-white/60 text-lg transition-transform ${showPlusMenu ? 'rotate-45' : ''}`} />
            </button>

            <AnimatePresence>
              {showPlusMenu && !showVoiceMenu && !showFormatMenu && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-12 left-0 w-56 bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden z-50">
                  <button onClick={() => { setShowFormatMenu(true); setShowPlusMenu(false) }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <LayoutDashboard size={18} className="text-[#0ea5e9] text-lg" />
                    <div className="text-left"><p className="font-semibold">Formato Viral</p><p className="text-[10px] text-slate-400 dark:text-white/40">Escolher estrutura</p></div>
                    <ChevronRight size={14} className="text-slate-400 ml-auto text-sm" />
                  </button>
                  <button onClick={() => { setShowVoiceMenu(true); setShowPlusMenu(false) }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <Mic2 size={18} className="text-violet-400 text-lg" />
                    <div className="text-left"><p className="font-semibold">Tom de Voz</p><p className="text-[10px] text-slate-400 dark:text-white/40">Alterar estilo</p></div>
                    <ChevronRight size={14} className="text-slate-400 ml-auto text-sm" />
                  </button>
                  <Link href="/tom-de-voz" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-t border-slate-100 dark:border-white/5">
                    <SlidersHorizontal size={18} className="text-emerald-400 text-lg" />
                    <div className="text-left"><p className="font-semibold">Configurar Tom</p><p className="text-[10px] text-slate-400 dark:text-white/40">Criar novo perfil</p></div>
                  </Link>
                </motion.div>
              )}

              {showFormatMenu && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-12 left-0 w-64 max-h-72 overflow-y-auto bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40 z-50 custom-scrollbar">
                  <div className="sticky top-0 bg-white dark:bg-[#141926] px-4 py-2.5 border-b border-slate-100 dark:border-white/5">
                    <button onClick={() => { setShowFormatMenu(false); setShowPlusMenu(true) }} className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-white/50 hover:text-[#0ea5e9]"><ChevronLeft size={14} className="text-sm" /> Voltar</button>
                  </div>
                  <button onClick={() => { setSelectedFormato(null); setShowFormatMenu(false) }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${!selectedFormato ? 'text-[#0ea5e9]' : 'text-slate-600 dark:text-white/70'}`}><X size={14} className="text-sm" /> Sem formato</button>
                  {formatos.map(f => (
                    <button key={f.id} onClick={() => { setSelectedFormato(f); setShowFormatMenu(false) }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${selectedFormato?.id === f.id ? 'text-[#0ea5e9] bg-[#0ea5e9]/5' : 'text-slate-600 dark:text-white/70'}`}>
                      <DynamicIcon name={f.icone} size={18} className="text-lg opacity-70"" />
                      {f.titulo}
                    </button>
                  ))}
                </motion.div>
              )}

              {showVoiceMenu && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-12 left-0 w-64 max-h-72 overflow-y-auto bg-white dark:bg-[#141926] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40 z-50 custom-scrollbar">
                  <div className="sticky top-0 bg-white dark:bg-[#141926] px-4 py-2.5 border-b border-slate-100 dark:border-white/5">
                    <button onClick={() => { setShowVoiceMenu(false); setShowPlusMenu(true) }} className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-white/50 hover:text-[#0ea5e9]"><ChevronLeft size={14} className="text-sm" /> Voltar</button>
                  </div>
                  <button onClick={() => { setSelectedVoiceId(null); setShowVoiceMenu(false) }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${!selectedVoiceId ? 'text-[#0ea5e9]' : 'text-slate-600 dark:text-white/70'}`}><Sparkles size={14} className="text-sm" /> Automático (Neutro)</button>
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
          {isGenerating ? <RefreshCw size={18} className="text-lg animate-spin" /> : <ArrowUp size={18} className="text-lg" />}
        </button>
      </div>

      {urlError && (
        <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-medium">
          <X size={14} className="shrink-0" />
          {urlError}
          <button onClick={() => setUrlError(null)} className="ml-auto"><X size={12} /></button>
        </div>
      )}

      <p className="text-center text-[11px] text-slate-400 dark:text-white/30 mt-2">Roteirista pode cometer erros. Revise o conteúdo gerado.</p>
    </div>
  )

  return (
    <main className="flex-1 flex flex-col h-[calc(100dvh-80px)] lg:h-[calc(100dvh-100px)] w-[calc(100%+3rem)] lg:w-[calc(100%+5rem)] -mx-6 lg:-mx-10 -mb-6 lg:-mb-10 overflow-hidden bg-transparent relative">

      {!hasMessages ? (
        /* ═══ EMPTY STATE — title + cards + input all centered ═══ */
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <div className={`size-20 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(14,165,233,0.15)] ${activeTab === 'analisar' ? 'bg-gradient-to-br from-[#0ea5e9]/20 to-indigo-500/20 border border-[#0ea5e9]/20' : 'bg-gradient-to-br from-[#0ea5e9]/20 to-indigo-500/20 border border-[#0ea5e9]/20'}`}>
              {activeTab === 'analisar' ? <BarChart3 size={36} className="text-[#0ea5e9]" /> : <Sparkles size={36} className="text-[#0ea5e9]" />}
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


          {activeTab === 'analisar' && (
            <div className="mb-8 p-6 max-w-xl mx-auto flex items-center gap-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-3xl text-left">
              <div className="size-12 shrink-0 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                 <Brain size={18} />
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
              {activeMessages.map((msg, idx) => {
                const isStreamingThisMsg = isGenerating && idx === activeMessages.length - 1 && msg.role === 'assistant' && !msg.content.startsWith('__REDIRECT__')
                return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`relative group ${
                    msg.role === 'user'
                      ? 'max-w-[80%] bg-[#0ea5e9] text-white rounded-2xl rounded-br-md px-5 py-3'
                      : isStreamingThisMsg
                        ? 'w-full px-1 py-2'  /* borderless full-width while streaming */
                        : 'w-full bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white/90 border border-slate-200 dark:border-white/[0.06] rounded-2xl rounded-bl-md px-5 py-3'
                  }`}>
                  {msg.role === 'assistant' ? (
                    msg.content.startsWith('__REDIRECT__') ? (

                      // ── SUCCESS STATE — shown while redirecting ──
                      <div className="flex flex-col items-center gap-4 py-6 px-4 text-center">
                        <div className="size-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <CheckCircle size={36} className="text-emerald-400 text-4xl" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-lg mb-1">✅ Roteiro Pronto!</p>
                          <p className="text-sm text-slate-500 dark:text-white/50">Abrindo o editor...</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <RefreshCw size={14} className="animate-spin text-sm" />
                          Redirecionando para o editor
                        </div>
                      </div>
                    ) : isGenerating && idx === activeMessages.length - 1 ? (
                      // ── STREAMING STATE — ChatGPT-style natural text flow ──
                      <StreamingText content={msg.content} />
                    ) : (
                      // ── DONE STATE (fallback if no redirect) ──
                      <ScriptRenderer content={msg.content} isUnlocked={msg.locked === undefined ? true : !msg.locked} isGenerating={false} />
                    )
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}
                    {msg.format && <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 font-medium">{msg.format}</span>}
                  </div>
                </motion.div>
                )
              })}


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
