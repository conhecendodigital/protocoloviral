'use client'

import { useState, useRef, useMemo } from 'react'

import { useProfile } from '@/hooks/use-profile'
import { useAutoSave } from '@/hooks/use-auto-save'
import { PROFILE_FIELDS } from '@/types/profile'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { parseClareza, parsePersona } from '@/lib/parser'
import type { ClarezaParsed, PersonaParsed } from '@/lib/parser'

// ─── Section Config ────────────────────────────────────────
const SECTION_META = {
  sobre: { icon: 'person', title: 'Sobre Você', desc: 'Conta um pouco sobre o que você faz' },
  publico: { icon: 'groups', title: 'Seu Público', desc: 'Quem são as pessoas que você quer alcançar' },
  objetivos: { icon: 'rocket_launch', title: 'Seus Objetivos', desc: 'O que você quer conseguir' },
}

// ─── Format Text Component ─────────────────────────────────
// Componente de helper simples para formatar os blocos de texto, separando linhas baseadas em rótulos
function FormattedContent({ text }: { text: string }) {
  if (!text) return null
  
  // Normaliza quebras de linha e trata colagens comuns de texto (sem estragar abreviações)
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\t/g, '  ')
  const lines = normalizedText.split('\n')

  return (
    <div className="space-y-3 whitespace-pre-wrap break-words">
      {lines.map((line, idx) => {
        if (!line.trim()) return <span key={idx} className="block h-2" />
        
        // Anti-gluing: Separa minúscula seguida de Maiúscula se a cópia colou as colunas da tabela
        // Ex: "DimensãoO que" -> "Dimensão O que". Ignora YouTube, TikTok pois o espaço não estraga o sentido.
        let displayLine = line
          .replace(/([a-zçãõáéíóú])([A-Z])/g, '$1 $2')
          .replace(/([a-zçãõáéíóú])(["])/g, '$1 $2')

        const colonIndex = displayLine.indexOf(':')
        if (colonIndex > 0 && colonIndex < 40) {
          const label = displayLine.slice(0, colonIndex + 1)
          const rest = displayLine.slice(colonIndex + 1)
          return (
            <p key={idx} className="mb-1 leading-relaxed text-slate-700 dark:text-white/80">
              <strong className="text-slate-900 dark:text-white font-bold">
                {label}
              </strong>
              {rest}
            </p>
          )
        }

        return (
          <p key={idx} className="mb-1 leading-relaxed text-slate-700 dark:text-white/80">
            {displayLine}
          </p>
        )
      })}
    </div>
  )
}

// ─── Clareza Read-Only Tab ─────────────────────────────────
function ClarezaTab({ data }: { data: ClarezaParsed }) {
  const sections = [
    { key: 'manifesto', title: 'Mensagem Central (Manifesto)', icon: 'emoji_objects', color: 'amber', content: data.manifesto },
    { key: 'diferencial', title: 'Diferencial Competitivo', icon: 'diamond', color: 'purple', content: data.diferencial },
    { key: 'transformacao', title: 'Transformação Entregue', icon: 'swap_horiz', color: 'emerald', content: data.transformacao },
    { key: 'posicionamento', title: 'Frase de Posicionamento', icon: 'format_quote', color: 'sky', content: data.posicionamento },
    { key: 'pilares', title: 'Pilares de Conteúdo', icon: 'view_column', color: 'indigo', content: data.pilares },
    { key: 'armadilhas', title: 'Armadilhas a Evitar', icon: 'warning', color: 'red', content: data.armadilhas },
    { key: 'proximosPassos', title: 'Próximos Passos', icon: 'checklist', color: 'emerald', content: data.proximosPassos },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {sections.map((sec) => sec.content && (
        <div key={sec.key} className={`glass-card rounded-3xl p-6 sm:p-8 border border-${sec.color}-500/10 relative overflow-hidden`}>
          {sec.key === 'manifesto' && (
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <span className="material-symbols-outlined text-[80px] text-[#0ea5e9]">auto_awesome</span>
            </div>
          )}
          <div className="flex items-center gap-3 mb-5">
            <div className={`size-10 rounded-xl bg-${sec.color}-500/10 flex items-center justify-center border border-${sec.color}-500/20`}>
              <span className={`material-symbols-outlined text-${sec.color}-400 text-xl`}>{sec.icon}</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">{sec.title}</h3>
          </div>
          <div className="text-sm leading-relaxed">
            <FormattedContent text={sec.content} />
          </div>
        </div>
      ))}
    </motion.div>
  )
}

// ─── Persona Read-Only Tab ─────────────────────────────────
function PersonaTab({ data }: { data: PersonaParsed }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Identidade Demográfica */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <span className="material-symbols-outlined text-[80px] text-purple-400">person_pin</span>
        </div>
        <div className="flex items-center gap-3 mb-5">
          <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <span className="material-symbols-outlined text-purple-400 text-xl">badge</span>
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Perfil Demográfico</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Nome', value: data.demografico.nome, icon: 'person' },
            { label: 'Idade', value: data.demografico.idade, icon: 'cake' },
            { label: 'Gênero', value: data.demografico.genero, icon: 'wc' },
            { label: 'Estado Civil', value: data.demografico.estadoCivil, icon: 'favorite' },
            { label: 'Cidade', value: data.demografico.cidade, icon: 'location_on' },
            { label: 'Profissão', value: data.demografico.profissao, icon: 'work' },
            { label: 'Renda', value: data.demografico.renda, icon: 'payments' },
            { label: 'Escolaridade', value: data.demografico.escolaridade, icon: 'school' },
          ].map((item) => item.value && (
            <div key={item.label} className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="material-symbols-outlined text-purple-400 text-[14px]">{item.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40">{item.label}</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rotina Diária */}
      {data.rotina && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
              <span className="material-symbols-outlined text-sky-400 text-xl">schedule</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Rotina Diária</h3>
          </div>
          <div className="text-sm leading-relaxed"><FormattedContent text={data.rotina} /></div>
        </div>
      )}

      {/* Perfil Psicológico */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="size-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <span className="material-symbols-outlined text-rose-400 text-xl">psychology</span>
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Perfil Psicológico</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Dores Superficiais', subtitle: 'O que ela fala que é o problema', value: data.psicologico.doresSuperficiais, color: 'red', icon: 'sentiment_dissatisfied' },
            { label: 'Dores Profundas', subtitle: 'O que ela realmente sente', value: data.psicologico.doresProfundas, color: 'rose', icon: 'heart_broken' },
            { label: 'Desejos Declarados', subtitle: 'O que ela diz querer', value: data.psicologico.desejosDeclarados, color: 'amber', icon: 'star' },
            { label: 'Desejos Ocultos', subtitle: 'O que ela realmente quer sentir', value: data.psicologico.desejosOcultos, color: 'violet', icon: 'visibility_off' },
          ].map((item) => item.value && (
            <div key={item.label} className={`p-5 rounded-2xl bg-${item.color}-500/5 border border-${item.color}-500/10`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`material-symbols-outlined text-${item.color}-400 text-lg`}>{item.icon}</span>
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest text-${item.color}-400 block`}>{item.label}</span>
                </div>
              </div>
              <div className="text-sm leading-relaxed mt-2"><FormattedContent text={item.value} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Comportamento Digital */}
      {(data.comportamentoDigital.consumo || data.comportamentoDigital.influenciadores || data.comportamentoDigital.compra) && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3 mb-5">
            <div className="size-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <span className="material-symbols-outlined text-cyan-400 text-xl">phone_iphone</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Comportamento Digital</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.comportamentoDigital.consumo && (
              <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block mb-2">Consumo de Conteúdo</span>
                <div className="text-sm leading-relaxed"><FormattedContent text={data.comportamentoDigital.consumo} /></div>
              </div>
            )}
            {data.comportamentoDigital.influenciadores && (
              <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-500/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-400 block mb-2">Influenciadores</span>
                <div className="text-sm leading-relaxed"><FormattedContent text={data.comportamentoDigital.influenciadores} /></div>
              </div>
            )}
            {data.comportamentoDigital.compra && (
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-2">Comportamento de Compra</span>
                <div className="text-sm leading-relaxed"><FormattedContent text={data.comportamentoDigital.compra} /></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Objeções */}
      {data.objecoes && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-orange-500/10 bg-orange-500/[0.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <span className="material-symbols-outlined text-orange-400 text-xl">block</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Objeções e Barreiras</h3>
          </div>
          <div className="text-sm leading-relaxed"><FormattedContent text={data.objecoes} /></div>
        </div>
      )}

      {/* Gatilhos */}
      {data.gatilhos && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/10 bg-emerald-500/[0.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <span className="material-symbols-outlined text-emerald-400 text-xl">bolt</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Gatilhos de Conexão</h3>
          </div>
          <div className="text-sm leading-relaxed"><FormattedContent text={data.gatilhos} /></div>
        </div>
      )}

      {/* Mapa de Empatia */}
      {data.mapaEmpatia && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-violet-500/10 bg-violet-500/[0.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
              <span className="material-symbols-outlined text-violet-400 text-xl">map</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Mapa de Empatia</h3>
          </div>
          <div className="text-sm leading-relaxed"><FormattedContent text={data.mapaEmpatia} /></div>
        </div>
      )}
    </motion.div>
  )
}

// ─── Empty State Component ─────────────────────────────────
function EmptyInsightState({ type }: { type: 'clareza' | 'persona' }) {
  const config = {
    clareza: {
      icon: 'lightbulb',
      title: 'Sua Clareza ainda não foi gerada',
      desc: 'Vá até o Gerador de Prompts, gere o Passo 1 (Clareza), cole no ChatGPT, e depois cole a resposta de volta no campo indicado.',
      step: 'clareza',
      stepLabel: 'Passo 1: Clareza',
    },
    persona: {
      icon: 'groups',
      title: 'Sua Persona ainda não foi gerada',
      desc: 'Vá até o Gerador de Prompts, gere o Passo 2 (Persona), cole no ChatGPT, e depois cole a resposta de volta no campo indicado.',
      step: 'persona',
      stepLabel: 'Passo 2: Persona',
    },
  }
  const c = config[type]
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="size-20 rounded-full bg-[#0ea5e9]/10 flex items-center justify-center mb-6 border border-[#0ea5e9]/20">
        <span className="material-symbols-outlined text-[40px] text-[#0ea5e9]">{c.icon}</span>
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{c.title}</h3>
      <p className="text-sm text-slate-700 dark:text-white/60 max-w-md mb-8 leading-relaxed">{c.desc}</p>
      <Link
        href={`/prompts/${c.step}`}
        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-400 to-[#0ea5e9] text-white font-bold text-sm hover:brightness-110 transition-all active:scale-[0.97] shadow-lg shadow-[#0ea5e9]/30"
      >
        <span className="material-symbols-outlined text-lg">auto_awesome</span>
        Ir para {c.stepLabel}
      </Link>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════
// ██ MAIN PAGE
// ═══════════════════════════════════════════════════════════
export default function PerfilPage() {
  const { profile, loading, userId, updateField, uploadAvatar, getCompletionPercent } = useProfile()
  const { debouncedSave } = useAutoSave(userId)
  const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({})
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [enhancingAll, setEnhancingAll] = useState(false)
  const [enhanceResult, setEnhanceResult] = useState<'idle' | 'success' | 'error'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const completion = getCompletionPercent()

  // ─── Real-time Parser (computed from profile) ──────────
  const clarezaData = useMemo<ClarezaParsed | null>(
    () => parseClareza(profile?.resposta1),
    [profile?.resposta1]
  )
  const personaData = useMemo<PersonaParsed | null>(
    () => parsePersona(profile?.resposta2),
    [profile?.resposta2]
  )

  const handleFieldChange = (fieldId: string, value: string) => {
    updateField(fieldId, value)
    debouncedSave(fieldId, value, (status) => {
      setSaveStatus(prev => ({ ...prev, [fieldId]: status === 'saving' ? 'saving' : status === 'saved' ? 'saved' : 'error' }))
      if (status === 'saved') {
        setTimeout(() => setSaveStatus(prev => ({ ...prev, [fieldId]: 'idle' })), 2000)
      }
    })
  }

  const getDisplayName = () => {
    if (profile?.nome_completo) return profile.nome_completo
    if (!profile?.email) return 'Usuário Mapeador'
    return profile.email.split('@')[0].split('.')[0].replace(/^\w/, c => c.toUpperCase())
  }

  const getInitials = () => {
    const name = profile?.nome_completo || profile?.email?.split('@')[0] || 'U'
    const parts = name.split(/[\s.]+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  const handleAvatarClick = () => { fileInputRef.current?.click() }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    await uploadAvatar(file)
    setUploadingAvatar(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleStartEditName = () => {
    setTempName(profile?.nome_completo || getDisplayName())
    setEditingName(true)
  }
  const handleSaveName = () => {
    if (tempName.trim()) handleFieldChange('nome_completo', tempName.trim())
    setEditingName(false)
  }
  const handleCancelEditName = () => { setEditingName(false) }

  const handleEnhanceAll = async () => {
    if (!profile) return
    setEnhanceResult('idle')
    const filledFields = PROFILE_FIELDS
      .filter(f => {
        const val = (profile as Record<string, string | null>)?.[f.id]
        return val && val.trim().length >= 5
      })
      .map(f => ({ id: f.id, label: f.label, value: (profile as Record<string, string | null>)?.[f.id] || '' }))

    if (filledFields.length === 0) return
    setEnhancingAll(true)
    try {
      const res = await fetch('/api/enhance-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: filledFields }),
      })
      const data = await res.json()
      if (data.enhanced && typeof data.enhanced === 'object') {
        let updated = 0
        for (const [fieldId, value] of Object.entries(data.enhanced)) {
          if (typeof value === 'string' && value.trim().length > 0) {
            const original = filledFields.find(f => f.id === fieldId)?.value
            if (original !== value) { handleFieldChange(fieldId, value); updated++ }
          }
        }
        setEnhanceResult(updated > 0 ? 'success' : data.used_ai ? 'success' : 'error')
      } else {
        setEnhanceResult('error')
      }
    } catch {
      setEnhanceResult('error')
    }
    setEnhancingAll(false)
    setTimeout(() => setEnhanceResult('idle'), 4000)
  }

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-96 relative z-10 w-full">
          <Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" />
        </div>
      </>
    )
  }

  return (
    <>
      <main className="flex-1 flex flex-col items-center w-full relative z-10 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-7xl px-6 lg:px-8 py-8 md:py-12 pb-24">

          {/* ─── Profile Header ──────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              {/* Avatar */}
              <div className="relative group">
                <div
                  className="size-28 rounded-full border-4 border-slate-300/10 dark:border-white/10 p-0.5 glass-card shadow-[0_0_30px_rgba(14,165,233,0.2)] bg-white/80 dark:bg-black/50 cursor-pointer overflow-hidden"
                  onClick={handleAvatarClick}
                >
                  {profile?.avatar_url ? (
                    <Image src={profile.avatar_url} alt="Avatar" width={112} height={112} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#0ea5e9] to-indigo-500 flex items-center justify-center">
                      <span className="text-3xl font-black text-white">{getInitials()}</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleAvatarClick}>
                  {uploadingAvatar ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>}
                </div>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarChange} />
              </div>

              {/* Name & Email */}
              <div className="mb-2 md:mb-4">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') handleCancelEditName() }} autoFocus className="text-2xl font-black text-slate-900 dark:text-white tracking-tight bg-black/5 dark:bg-white/5 border border-slate-300/20 dark:border-white/20 rounded-xl px-4 py-2 focus:outline-none focus:border-[#0ea5e9] transition-all" />
                    <button onClick={handleSaveName} className="text-[#0ea5e9] hover:text-white transition-colors"><span className="material-symbols-outlined">check</span></button>
                    <button onClick={handleCancelEditName} className="text-slate-500 hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 group cursor-pointer" onClick={handleStartEditName}>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{getDisplayName()}</h2>
                    <span className="material-symbols-outlined text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity text-lg">edit</span>
                  </div>
                )}
                <p className="text-[#0ea5e9] font-medium tracking-wide text-sm mt-1">{profile?.email}</p>
              </div>
            </div>
          </motion.div>

          {/* ─── Main 3-Tab Layout ───────────────────────── */}
          <Tabs defaultValue="dados" className="w-full focus-visible:outline-none">
            <TabsList className="mb-8 bg-black/5 dark:bg-white/5 border border-slate-300/10 dark:border-white/10 p-1.5 rounded-2xl w-full grid grid-cols-3 !h-auto min-h-[60px] sm:min-h-[50px]">
              <TabsTrigger value="dados" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-xl font-bold py-2 sm:py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0ea5e9]/20 data-[state=active]:text-[#0ea5e9] data-[state=active]:shadow-[0_4px_8px_rgba(0,0,0,0.05)] transition-all focus-visible:ring-0 text-[11px] sm:text-sm leading-none !h-auto">
                <span className="material-symbols-outlined text-[18px] sm:text-base">person</span>
                <span>Meus Dados</span>
              </TabsTrigger>
              <TabsTrigger value="clareza" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-xl font-bold py-2 sm:py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0ea5e9]/20 data-[state=active]:text-[#0ea5e9] data-[state=active]:shadow-[0_4px_8px_rgba(0,0,0,0.05)] transition-all focus-visible:ring-0 text-[11px] sm:text-sm leading-none !h-auto">
                <span className="material-symbols-outlined text-[18px] sm:text-base">lightbulb</span>
                <div className="flex items-center gap-1">
                  <span>Sua Clareza</span>
                  {clarezaData && <span className="size-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" />}
                </div>
              </TabsTrigger>
              <TabsTrigger value="persona" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-xl font-bold py-2 sm:py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0ea5e9]/20 data-[state=active]:text-[#0ea5e9] data-[state=active]:shadow-[0_4px_8px_rgba(0,0,0,0.05)] transition-all focus-visible:ring-0 text-[11px] sm:text-sm leading-none !h-auto">
                <span className="material-symbols-outlined text-[18px] sm:text-base">groups</span>
                <div className="flex items-center gap-1">
                  <span>Sua Persona</span>
                  {personaData && <span className="size-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" />}
                </div>
              </TabsTrigger>
            </TabsList>

            {/* ═══ TAB 1: MEUS DADOS ═══════════════════════ */}
            <TabsContent value="dados" className="focus-visible:outline-none focus:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">

                  {/* Progress Card */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-3xl p-8 border border-slate-200 dark:border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="material-symbols-outlined text-[80px] text-[#0ea5e9]">verified</span>
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Suas Informações</h3>
                        <p className="text-sm text-slate-700 dark:text-white/70 max-w-md">
                          {completion < 50 ? 'Responda as perguntas abaixo para a gente te conhecer melhor. É com base nisso que vamos criar todos os seus textos e roteiros.' :
                           completion < 100 ? 'Quase lá! Faltam só alguns detalhes para a gente te ajudar melhor.' :
                           'Tudo preenchido! Agora seus textos e roteiros vão ser feitos sob medida para você.'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="block text-3xl font-black text-slate-900 dark:text-white">{completion}%</span>
                          <span className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-widest">Concluído</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full mt-6 overflow-hidden relative z-10">
                      <div className="h-full bg-gradient-to-r from-sky-400 to-[#0ea5e9] shadow-[0_0_15px_rgba(14,165,233,0.5)] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ width: `${completion}%` }} />
                    </div>

                    {/* AI Enhance Button */}
                    {completion > 0 && (
                      <motion.button
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        onClick={handleEnhanceAll} disabled={enhancingAll}
                        className={`mt-6 w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold transition-all active:scale-[0.98] relative z-10 border disabled:opacity-60 disabled:pointer-events-none ${
                          enhanceResult === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                          enhanceResult === 'error' ? 'border-red-500/30 bg-red-500/10 text-red-400' :
                          'border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 hover:border-violet-500/50'
                        }`}
                      >
                        {enhancingAll ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /><span>Melhorando respostas...</span></>
                        ) : enhanceResult === 'success' ? (
                          <><CheckCircle2 className="w-4 h-4" /><span>Suas respostas foram melhoradas!</span></>
                        ) : enhanceResult === 'error' ? (
                          <><span className="material-symbols-outlined text-lg">warning</span><span>Erro — tente novamente</span></>
                        ) : (
                          <><span className="material-symbols-outlined text-lg">auto_fix_high</span><span>Melhorar Tudo com IA</span></>
                        )}
                      </motion.button>
                    )}

                    <AnimatePresence>
                      {enhanceResult === 'success' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 relative z-10">
                          <p className="text-sm text-emerald-400 text-center font-medium">Pronto! Suas respostas foram melhoradas. Seus próximos textos e roteiros vão ficar ainda melhores.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {completion === 100 && enhanceResult !== 'success' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-[#0ea5e9]/10 border border-emerald-500/20 text-center relative z-10">
                        <span className="material-symbols-outlined text-[32px] text-emerald-400 mb-2 block">rocket_launch</span>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">Perfil Completo! 🚀</h4>
                        <p className="text-sm text-slate-700 dark:text-white/70 mb-5">Agora que temos todas as suas informações, vamos criar seu primeiro conteúdo.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Link href="/jornada" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-[#0ea5e9] text-white font-bold text-sm hover:opacity-90 transition-opacity active:scale-[0.97]">
                            <span className="material-symbols-outlined text-lg">explore</span> Ir para a Jornada de Conteúdo
                          </Link>
                          <Link href="/prompts" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-sm hover:bg-black/10 dark:hover:bg-white/10 transition-colors active:scale-[0.97]">
                            <span className="material-symbols-outlined text-lg">auto_awesome</span> Gerar meu primeiro Roteiro
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* All 13 Fields - Grouped By Section */}
                  {(['sobre', 'publico', 'objetivos'] as const).map((sectionKey) => {
                    const meta = SECTION_META[sectionKey]
                    const fields = PROFILE_FIELDS.filter(f => f.section === sectionKey)
                    return (
                      <motion.div key={sectionKey} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="size-12 rounded-xl bg-[#0ea5e9]/10 flex items-center justify-center border border-[#0ea5e9]/20 shadow-inner">
                            <span className="material-symbols-outlined text-[#0ea5e9] text-2xl">{meta.icon}</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">{meta.title}</h3>
                            <p className="text-sm text-slate-700 dark:text-white/60">{meta.desc}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {fields.map(field => {
                            const fieldValue = profile?.[field.id] as string || ''
                            const status = saveStatus[field.id] || 'idle'
                            const isTextarea = field.type === 'textarea'
                            return (
                              <div key={field.id} className={`space-y-2 ${isTextarea ? 'md:col-span-2' : ''}`}>
                                <div className="flex items-center justify-between">
                                  <label htmlFor={field.id} className="text-xs font-bold text-slate-600 dark:text-white/60 uppercase tracking-widest ml-1">{field.label}</label>
                                  <div className="h-4 flex items-center gap-2">
                                    {status === 'saving' && <span className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-widest font-bold"><Loader2 className="w-3 h-3 animate-spin" />Salvando</span>}
                                    {status === 'saved' && <span className="text-[10px] text-[#0ea5e9] flex items-center gap-1 uppercase tracking-widest font-bold"><CheckCircle2 className="w-3 h-3" />Salvo</span>}
                                    {status === 'error' && <span className="text-[10px] text-red-400 flex items-center gap-1 uppercase tracking-widest font-bold">Erro ao salvar</span>}
                                  </div>
                                </div>
                                <div className="group relative">
                                  <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none border border-[#0ea5e9]/50" />
                                  {isTextarea ? (
                                    <Textarea id={field.id} placeholder={field.placeholder} value={fieldValue} onChange={e => handleFieldChange(field.id, e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-2xl px-5 py-4 focus-visible:ring-0 focus-visible:border-[#0ea5e9] outline-none transition-all resize-none text-slate-900 dark:text-white text-sm leading-relaxed min-h-[100px] relative z-10 placeholder:text-slate-400 dark:placeholder:text-white/30" rows={4} />
                                  ) : (
                                    <Input id={field.id} placeholder={field.placeholder} value={fieldValue} onChange={e => handleFieldChange(field.id, e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-2xl px-5 py-6 h-auto focus-visible:ring-0 focus-visible:border-[#0ea5e9] outline-none transition-all text-slate-900 dark:text-white text-sm relative z-10 placeholder:text-slate-400 dark:placeholder:text-white/30" />
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                  {/* Tips */}
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-[#0ea5e9]/20 to-indigo-900/10 rounded-3xl p-8 border border-[#0ea5e9]/20 relative overflow-hidden">
                    <div className="relative z-10">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#0ea5e9]">lightbulb</span> Como preencher?
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6">Essas informações são usadas para criar textos feitos sob medida para você. Escreva do jeito mais natural possível.</p>
                      <ul className="space-y-3 text-sm text-slate-700 dark:text-white/70">
                        <li className="flex gap-2 items-start"><span className="text-[#0ea5e9] mt-0.5">•</span> Imagine que está contando sobre seu trabalho para alguém que acabou de conhecer.</li>
                        <li className="flex gap-2 items-start"><span className="text-[#0ea5e9] mt-0.5">•</span> Quanto mais detalhes sobre o seu público, melhores ficam os textos.</li>
                        <li className="flex gap-2 items-start"><span className="text-[#0ea5e9] mt-0.5">•</span> Use o botão <strong className="text-violet-400">&quot;Melhorar Tudo com IA&quot;</strong> para deixar suas respostas mais completas.</li>
                        <li className="flex gap-2 items-start"><span className="text-[#0ea5e9] mt-0.5">•</span> Você pode mudar essas informações quando quiser!</li>
                      </ul>
                    </div>
                  </motion.div>

                  {/* Auto-save Status */}
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-3xl p-8 border border-slate-200 dark:border-white/10">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-500">cloud_done</span> Salvamento
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-white/60 mb-1">
                          <span>Suas informações</span>
                          <span className="text-[#0ea5e9]">Ativo</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-full bg-[#0ea5e9] shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-white/50">Tudo é salvo automaticamente enquanto você digita.</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </TabsContent>

            {/* ═══ TAB 2: SUA CLAREZA ══════════════════════ */}
            <TabsContent value="clareza" className="focus-visible:outline-none focus:outline-none">
              {clarezaData ? <ClarezaTab data={clarezaData} /> : <EmptyInsightState type="clareza" />}
            </TabsContent>

            {/* ═══ TAB 3: SUA PERSONA ══════════════════════ */}
            <TabsContent value="persona" className="focus-visible:outline-none focus:outline-none">
              {personaData ? <PersonaTab data={personaData} /> : <EmptyInsightState type="persona" />}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  )
}
