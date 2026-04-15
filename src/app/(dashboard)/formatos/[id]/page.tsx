'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/hooks/use-profile'
import { Textarea } from '@/components/ui/textarea'
import { useParams } from 'next/navigation'
import { parseRoteiroBlocks, parsePersona } from '@/lib/parser'
import Link from 'next/link'

interface Formato {
  id: string
  titulo: string
  plataforma: string
  tipo: string
  nicho: string
  descricao: string | null
  video_url: string
  link_original: string | null
  // campo legado — mantido por compatibilidade
  estudo: string | null
  destaque: boolean
  curtidas: number | null
  views: number | null
  reproducoes: number | null
  comentarios: number | null
  duracao: number | null
  engajamento: number | null
  username: string | null
  created_at: string
  // novos campos da análise
  gancho: string | null
  analise_tipo: string | null
  analise_gatilho: string | null
  analise_forca: string | null
  analise_retencao: string | null
  roteiro_completo: string | null
  estrutura: string | null
  porque_funcionou: string | null
  adaptacao_esqueleto: string | null
  adaptacao_troque: string | null
  adaptacao_gancho: string | null
  adaptacao_cuidado: string | null
}

const formatNumber = (n: number | null): string => {
  if (!n) return '0'
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

const formatDuration = (s: number | null): string => {
  if (!s) return '0:00'
  const min = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

const nichoEmojis: Record<string, string> = {
  'Empresas': '🏢', 'Vlog': '🎥', 'Educação': '📚', 'Fitness': '💪',
  'Comida': '🍕', 'Tech': '💻', 'Moda': '👗', 'Beleza': '💄',
  'Finanças': '💰', 'Humor': '😂', 'Lifestyle': '✨', 'Saúde': '🏥', 'Todos': '🔥',
}

// ─── Componente de seção da análise ──────────────────────────────────
function AnaliseSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-[#0ea5e9]/40 pl-5 relative before:absolute before:w-2 before:h-2 before:rounded-full before:bg-[#0ea5e9] before:-left-[5px] before:top-1.5">
      <p className="text-xs font-black text-slate-500 dark:text-white/40 uppercase tracking-widest mb-1 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[14px] text-[#0ea5e9]">{icon}</span>
        {title}
      </p>
      {children}
    </div>
  )
}

// ─── Badge de força do gancho ─────────────────────────────────────────
function ForcaBadge({ forca }: { forca: string }) {
  const isForte = forca.toLowerCase().startsWith('forte')
  const isMedio = forca.toLowerCase().startsWith('médio') || forca.toLowerCase().startsWith('medio')
  const color = isForte
    ? 'text-green-400 bg-green-500/10 border-green-500/20'
    : isMedio
    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    : 'text-red-400 bg-red-500/10 border-red-500/20'
  const label = isForte ? 'Forte' : isMedio ? 'Médio' : 'Fraco'
  const dot = isForte ? 'bg-green-400' : isMedio ? 'bg-amber-400' : 'bg-red-400'

  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}

// ─── Paywall Overlay ────────────────────────────────────────────────
function PremiumOverlay({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center backdrop-blur-[8px] bg-white/20 dark:bg-black/60 rounded-2xl border border-slate-200/50 dark:border-white/5">
      <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)] mb-4">
        <span className="material-symbols-outlined text-white text-3xl">lock</span>
      </div>
      <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">{title}</h4>
      <p className="text-sm font-medium text-slate-700 dark:text-white/80 max-w-sm mb-6 leading-relaxed">{desc}</p>
      <Link href="/assinatura" className="shimmer-btn px-6 py-3 rounded-xl text-white font-bold text-sm shadow-xl shadow-amber-500/20 bg-gradient-to-r from-blue-500 to-blue-600 hover:scale-105 transition-transform border border-blue-400/30">
        Desbloquear Acesso Premium
      </Link>
    </div>
  )
}

const getFormatoIdParaRoteirista = (tipo: string | null, nicho: string | null): string => {
  const t = (tipo || '').toLowerCase();
  const n = (nicho || '').toLowerCase();
  const combo = t + ' ' + n;
  
  if (combo.includes('ancorag') || combo.includes('story')) return 'ancoragem';
  if (combo.includes('pergunta') || combo.includes('resposta') || combo.includes('dual')) return 'perguntas-e-respostas';
  if (combo.includes('caixinha')) return 'caixinha-perguntas';
  if (combo.includes('preguiçoso') || combo.includes('preguicoso') || combo.includes('certo') || combo.includes('errado')) return 'preguicoso';
  if (combo.includes('tela') || combo.includes('dividida') || combo.includes('comparação') || combo.includes('lado a lado')) return 'tela-dividida';
  if (combo.includes('tutorial') || combo.includes('dica') || combo.includes('passo')) return 'tutorial';
  if (combo.includes('react') || combo.includes('reação') || combo.includes('experimento')) return 'reacao';
  
  return 'varias-cenas';
}

export default function FormatoViewPage() {
  const params = useParams()
  const formatId = params.id as string

  const [formato, setFormato] = useState<Formato | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'analise' | 'roteiro' | 'adaptar'>('analise')
  const supabase = useMemo(() => createClient(), [])

  const { profile } = useProfile()
  const [generatingReel, setGeneratingReel] = useState(false)
  const [generatedReel, setGeneratedReel] = useState<string | null>(null)
  const [editableBlocks, setEditableBlocks] = useState<{titulo: string, gancho: string, desenvolvimento: string, cta: string} | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [ideia, setIdeia] = useState('')
  const [tomVoz, setTomVoz] = useState('')

  useEffect(() => {
    const savedTone = localStorage.getItem('mapa-engajamento-tom-voz')
    if (savedTone) setTomVoz(savedTone)
  }, [])

  const isPro = (profile?.plan_tier && profile.plan_tier !== 'free') || profile?.is_admin === true

  // decide se usa análise nova ou estudo legado
  const hasNewAnalysis = !!(formato?.gancho || formato?.analise_tipo)

  useEffect(() => {
    async function fetchFormato() {
      if (!formatId) { setLoading(false); return }
      const { data, error } = await supabase
        .from('formatos')
        .select('*')
        .eq('id', formatId)
        .single()
      if (!error && data) setFormato(data)
      setLoading(false)
    }
    fetchFormato()
  }, [supabase, formatId])

  const handleGenerateReel = async () => {
    if (!profile?.resposta1 || !profile?.resposta2) {
      setGenerateError('⚠️ Preencha sua Clareza e Persona na aba "Perfil" no menu esquerdo para a IA saber quem é você antes de gerar.')
      return
    }
    if (!formato) return
    if (!ideia.trim()) {
      setGenerateError('⚠️ A Ideia de Conteúdo é obrigatória para adaptar o roteiro.')
      return
    }
    setGeneratingReel(true)
    setGenerateError(null)
    setGeneratedReel('')
    setEditableBlocks(null)
    try {
      const nicho = profile.nicho || ''
      const parsedPersona = parsePersona(profile.resposta2)
      let shortPersona = profile.resposta2.substring(0, 8000)
      if (parsedPersona) {
        shortPersona = `PERFIL DEMOGRÁFICO:\nNome: ${parsedPersona.demografico.nome}\nIdade: ${parsedPersona.demografico.idade}\nGênero: ${parsedPersona.demografico.genero}\nCidade: ${parsedPersona.demografico.cidade}\nProfissão: ${parsedPersona.demografico.profissao}\nEscolaridade: ${parsedPersona.demografico.escolaridade}\n\nROTINA DIÁRIA:\n${parsedPersona.rotina}`
      }
      
      const estudo = formato.estudo || formato.roteiro_completo || ''
      const duracaoStr = formato.duracao ? `${formatDuration(formato.duracao)} segundos` : '30 segundos'

      const res = await fetch('/api/generate-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicho, persona: shortPersona, estudo, duracaoStr, ideia: ideia.trim(), tomVoz: tomVoz || 'Amigo' })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Erro desconhecido na geração.')
      }

      const data = await res.json()
      if (!data.result) throw new Error('A IA retornou vazio. Tente novamente.')
      setGeneratedReel(data.result)

      const primeiraLinha = data.result.split('\n')[0]
      const titulo = primeiraLinha.replace(/\*\*/g, '').trim() || 'Roteiro sem título'
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('roteiros').insert({
          user_id: user.id,
          titulo,
          roteiro: data.result,
          nicho,
          formato_nome: formato.titulo || '',
        })
      }
    } catch (err: any) {
      setGenerateError(err.message)
    } finally {
      setGeneratingReel(false)
    }
  }

  const getDriveFileId = (url: string) => {
    const ucMatch = url.match(/drive\.google\.com\/uc\?.*id=([^&\s]+)/)
    if (ucMatch) return ucMatch[1]
    const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/\s]+)/)
    if (fileMatch) return fileMatch[1]
    return null
  }

  const getVideoType = (url: string): 'drive' | 'direct' | 'embed' => {
    if (url.includes('drive.google.com')) return 'drive'
    if (url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || url.includes('/storage/v1/object/')) return 'direct'
    return 'embed'
  }

  const renderVideo = (url: string, titulo: string) => {
    const type = getVideoType(url)
    if (type === 'drive') {
      const fileId = getDriveFileId(url)
      const base = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url
      return <iframe src={base} className="absolute inset-0 w-full h-full" allow="autoplay; encrypted-media" allowFullScreen title={titulo} style={{ border: 'none' }} />
    }
    if (type === 'direct') {
      return <video src={url} controls playsInline className="absolute inset-0 w-full h-full object-contain" />
    }
    return <iframe src={url} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={titulo} />
  }

  // ─── Copia para clipboard ─────────────────────────────────────────
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
  }

  // ─── Texto completo para copiar (análise nova) ────────────────────
  const buildCopyText = () => {
    if (!formato) return ''
    if (!hasNewAnalysis) return formato.estudo || ''
    return [
      `🎬 GANCHO\n${formato.gancho}`,
      `🔬 ANÁLISE DO GANCHO\nTipo: ${formato.analise_tipo}\nGatilho: ${formato.analise_gatilho}\nForça: ${formato.analise_forca}\nRetenção: ${formato.analise_retencao}`,
      `📋 ROTEIRO\n${formato.roteiro_completo}`,
      `🧱 ESTRUTURA\n${formato.estrutura}`,
      `⚡ POR QUE FUNCIONOU\n${formato.porque_funcionou}`,
      `🎯 COMO ADAPTAR\nEsqueleto: ${formato.adaptacao_esqueleto}\nTroque: ${formato.adaptacao_troque}\nGancho adaptado: ${formato.adaptacao_gancho}\nCuidado: ${formato.adaptacao_cuidado}`,
    ].filter(Boolean).join('\n\n')
  }

  if (loading) {
    return (
      <main className="flex-1 flex flex-col pt-12">
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#0ea5e9]/30 border-t-[#0ea5e9] rounded-full animate-spin" />
        </div>
      </main>
    )
  }

  if (!formato) {
    return (
      <main className="flex-1 flex flex-col pt-12">
        <div className="text-center py-20 px-6">
          <h2 className="text-2xl font-bold dark:text-white">Formato não encontrado</h2>
          <Link href="/formatos" className="mt-4 text-[#0ea5e9] hover:underline font-medium inline-block">Voltar aos formatos</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 xl:py-12 custom-scrollbar">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-8 xl:gap-12">

        {/* ── Left Column ─────────────────────────────────────────── */}
        <div className="w-full xl:w-[400px] shrink-0 space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-white/60 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Voltar ao Início
          </Link>

          <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden glass-card border border-white/10 shadow-xl bg-black/50">
            {renderVideo(formato.video_url, formato.titulo)}
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-[10px] px-2.5 py-1 rounded font-black tracking-widest uppercase text-purple-400 bg-purple-500/10">
                {nichoEmojis[formato.nicho] || '📁'} {formato.nicho || 'Geral'}
              </span>
              <span className={`text-[10px] px-2.5 py-1 rounded font-black tracking-widest uppercase ${
                formato.plataforma === 'Instagram' ? 'text-pink-400 bg-pink-500/10' : 'text-cyan-400 bg-cyan-500/10'
              }`}>
                {formato.plataforma === 'Instagram' ? '📸' : '🎵'} {formato.plataforma}
              </span>
              <span className="text-[10px] text-[#0ea5e9] bg-[#0ea5e9]/10 px-2.5 py-1 rounded font-black tracking-widest uppercase">
                {formato.tipo}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
              {formato.titulo}
            </h1>
            {formato.descricao && (
              <p className="text-sm text-slate-700 dark:text-white/80 leading-relaxed mb-4">{formato.descricao}</p>
            )}
            {formato.link_original && (
              <a href={formato.link_original} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs w-full justify-center bg-black/5 dark:bg-white/5 py-3 px-4 rounded-xl border border-slate-300/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 dark:text-white transition-all font-bold">
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                Assistir Original
              </a>
            )}
          </div>
        </div>

        {/* ── Right Column ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-6 pt-10">

          {/* Métricas */}
          {(formato.curtidas || formato.views || formato.engajamento) && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {formato.curtidas != null && (
                <div className="glass-card rounded-xl p-3 text-center">
                  <span className="material-symbols-outlined text-red-400 text-xl block mb-1">favorite</span>
                  <p className="text-slate-900 dark:text-white font-bold text-sm">{formatNumber(formato.curtidas)}</p>
                  <p className="text-[10px] text-slate-700 dark:text-white/90 uppercase tracking-wider">Curtidas</p>
                </div>
              )}
              {formato.views != null && (
                <div className="glass-card rounded-xl p-3 text-center">
                  <span className="material-symbols-outlined text-blue-400 text-xl block mb-1">visibility</span>
                  <p className="text-slate-900 dark:text-white font-bold text-sm">{formatNumber(formato.views)}</p>
                  <p className="text-[10px] text-slate-700 dark:text-white/90 uppercase tracking-wider">Views</p>
                </div>
              )}
              {formato.reproducoes != null && (
                <div className="glass-card rounded-xl p-3 text-center">
                  <span className="material-symbols-outlined text-purple-400 text-xl block mb-1">play_circle</span>
                  <p className="text-slate-900 dark:text-white font-bold text-sm">{formatNumber(formato.reproducoes)}</p>
                  <p className="text-[10px] text-slate-700 dark:text-white/90 uppercase tracking-wider">Plays</p>
                </div>
              )}
              {formato.comentarios != null && (
                <div className="glass-card rounded-xl p-3 text-center">
                  <span className="material-symbols-outlined text-amber-400 text-xl block mb-1">chat_bubble</span>
                  <p className="text-slate-900 dark:text-white font-bold text-sm">{formatNumber(formato.comentarios)}</p>
                  <p className="text-[10px] text-slate-700 dark:text-white/90 uppercase tracking-wider">Coment.</p>
                </div>
              )}
              {formato.duracao != null && (
                <div className="glass-card rounded-xl p-3 text-center">
                  <span className="material-symbols-outlined text-slate-800 dark:text-white/90 text-xl block mb-1">timer</span>
                  <p className="text-slate-900 dark:text-white font-bold text-sm">{formatDuration(formato.duracao)}</p>
                  <p className="text-[10px] text-slate-700 dark:text-white/90 uppercase tracking-wider">Duração</p>
                </div>
              )}
              {formato.engajamento != null && (
                <div className="glass-card rounded-xl p-3 text-center border-green-500/20">
                  <span className="material-symbols-outlined text-green-400 text-xl block mb-1">trending_up</span>
                  <p className="text-green-400 font-bold text-sm">{formato.engajamento.toFixed(2)}%</p>
                  <p className="text-[10px] text-slate-700 dark:text-white/90 uppercase tracking-wider">Engaj.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Análise Box ────────────────────────────────────────── */}
          <div className="rounded-2xl overflow-hidden glass-card">
            {/* Header */}
            <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.02]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="ml-4 text-xs font-mono font-bold text-slate-700 dark:text-white/90">
                estudo_viral.md
              </span>
              <button
                onClick={() => copyToClipboard(buildCopyText())}
                className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-800 dark:text-white/90 hover:text-slate-900 glass-card px-3 py-1.5 rounded-lg border-white/10 transition-all font-bold uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                Copiar
              </button>
            </div>

            {/* Tabs — só aparecem se tiver análise nova */}
            {hasNewAnalysis && (
              <div className="flex border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.01]">
                {(['analise', 'roteiro', 'adaptar'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${
                      activeTab === tab
                        ? 'text-[#0ea5e9] border-b-2 border-[#0ea5e9] bg-[#0ea5e9]/5'
                        : 'text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70'
                    }`}
                  >
                    {tab === 'analise' ? '🔬 Análise' : tab === 'roteiro' ? '📋 Roteiro' : '🎯 Adaptar'}
                  </button>
                ))}
              </div>
            )}

            {/* Conteúdo */}
            <div className="p-4 sm:p-8 space-y-6">

              {/* ── ANÁLISE NOVA ─────────────────────────────────── */}
              {hasNewAnalysis ? (
                <>
                  {/* Tab: Análise */}
                  {activeTab === 'analise' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

                      {/* Gancho */}
                      {formato.gancho && (
                        <AnaliseSection icon="format_quote" title="Gancho">
                          <p className="text-base font-black text-slate-900 dark:text-white leading-snug">
                            &ldquo;{formato.gancho}&rdquo;
                          </p>
                        </AnaliseSection>
                      )}

                      {/* Análise do Gancho */}
                      {(formato.analise_tipo || formato.analise_gatilho || formato.analise_forca || formato.analise_retencao) && (
                        <AnaliseSection icon="biotech" title="Análise do Gancho">
                          <div className="space-y-3 mt-2">
                            {formato.analise_tipo && (
                              <div className="flex gap-3 items-start">
                                <span className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest w-16 shrink-0 pt-0.5">Tipo</span>
                                <span className="text-sm text-slate-900 dark:text-white/90">{formato.analise_tipo}</span>
                              </div>
                            )}
                            {formato.analise_gatilho && (
                              <div className="flex gap-3 items-start">
                                <span className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest w-16 shrink-0 pt-0.5">Gatilho</span>
                                <span className="text-sm text-slate-900 dark:text-white/90">{formato.analise_gatilho}</span>
                              </div>
                            )}
                            {formato.analise_forca && (
                              <div className="flex gap-3 items-start">
                                <span className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest w-16 shrink-0 pt-0.5">Força</span>
                                <div className="flex flex-col gap-1.5">
                                  <ForcaBadge forca={formato.analise_forca} />
                                  <span className="text-sm text-slate-900 dark:text-white/90">{formato.analise_forca.replace(/^(Forte|Médio|Fraco)\s*[—-]\s*/i, '')}</span>
                                </div>
                              </div>
                            )}
                            {formato.analise_retencao && (
                              <div className="flex gap-3 items-start">
                                <span className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest w-16 shrink-0 pt-0.5">Retenção</span>
                                <span className="text-sm text-slate-900 dark:text-white/90">{formato.analise_retencao}</span>
                              </div>
                            )}
                          </div>
                        </AnaliseSection>
                      )}

                      {/* Estrutura */}
                      {formato.estrutura && (
                        <AnaliseSection icon="account_tree" title="Estrutura Narrativa">
                          <p className="text-sm text-slate-900 dark:text-white/90 mt-1">{formato.estrutura}</p>
                        </AnaliseSection>
                      )}

                      {/* Por que funcionou */}
                      {formato.porque_funcionou && (
                        <AnaliseSection icon="bolt" title="Por que funcionou">
                          <p className="text-sm text-slate-900 dark:text-white/90 leading-relaxed mt-1 whitespace-pre-wrap">
                            {formato.porque_funcionou}
                          </p>
                        </AnaliseSection>
                      )}
                    </motion.div>
                  )}

                  {/* Tab: Roteiro */}
                  {activeTab === 'roteiro' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative min-h-[300px]">
                      {!isPro && (
                        <PremiumOverlay 
                          title="Roteiro Descriptografado" 
                          desc="Assine o Premium para liberar o roteiro exato, decodificado palavra por palavra para você colar na sua produção." 
                        />
                      )}
                      <div className={!isPro ? 'select-none pointer-events-none blur-[6px]' : ''}>
                        {formato.roteiro_completo ? (
                        (() => {
                          const parsed = parseRoteiroBlocks(formato.roteiro_completo);
                          if (parsed) {
                            return (
                              <div className="space-y-4 pt-2">
                                <div className="bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 rounded-xl p-5 shadow-inner">
                                  <h4 className="text-[11px] font-black text-[#0ea5e9] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">format_quote</span>Gancho
                                  </h4>
                                  <p className="text-[15px] font-semibold text-slate-900 dark:text-white leading-[1.7] whitespace-pre-wrap">{parsed.gancho}</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-inner">
                                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">subject</span>Desenvolvimento
                                  </h4>
                                  <p className="text-[15px] text-slate-900 dark:text-white/90 leading-[1.7] whitespace-pre-wrap">{parsed.desenvolvimento}</p>
                                </div>
                                {parsed.cta?.trim() && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 shadow-inner">
                                  <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">smart_button</span>CTA e Final
                                  </h4>
                                  <p className="text-[15px] font-semibold text-emerald-900 dark:text-emerald-100 leading-[1.7] whitespace-pre-wrap">{parsed.cta}</p>
                                </div>
                                )}
                              </div>
                            )
                          }
                          return (
                            <AnaliseSection icon="description" title="Roteiro Completo">
                              <p className="text-[15px] text-slate-900 dark:text-white/90 leading-[1.7] mt-2 whitespace-pre-wrap">
                                {formato.roteiro_completo}
                              </p>
                            </AnaliseSection>
                          )
                        })()
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-white/40 text-center py-8">Roteiro não disponível.</p>
                      )}
                      </div>
                    </motion.div>
                  )}

                  {/* Tab: Adaptar */}
                  {activeTab === 'adaptar' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative min-h-[300px]">
                      {!isPro && (
                        <PremiumOverlay 
                          title="Fórmula de Adaptação" 
                          desc="Libere dezenas de fórmulas prontas de como encaixar esse script viral perfeitamente dentro do seu próprio nicho." 
                        />
                      )}
                      <div className={`space-y-6 ${!isPro ? 'select-none pointer-events-none blur-[6px]' : ''}`}>
                        {formato.adaptacao_esqueleto && (
                        <AnaliseSection icon="schema" title="Esqueleto Replicável">
                          <p className="text-sm text-slate-900 dark:text-white/90 mt-1">{formato.adaptacao_esqueleto}</p>
                        </AnaliseSection>
                      )}
                      {formato.adaptacao_troque && (
                        <AnaliseSection icon="swap_horiz" title="Troque Isso">
                          <p className="text-sm text-slate-900 dark:text-white/90 mt-1">{formato.adaptacao_troque}</p>
                        </AnaliseSection>
                      )}
                      {formato.adaptacao_gancho && (
                        <AnaliseSection icon="edit" title="Gancho Adaptado">
                          <div className="mt-2 bg-[#0ea5e9]/5 border border-[#0ea5e9]/20 rounded-xl px-4 py-3">
                            <p className="text-sm font-bold text-[#0ea5e9] leading-snug">
                              {formato.adaptacao_gancho}
                            </p>
                          </div>
                        </AnaliseSection>
                      )}
                      {formato.adaptacao_cuidado && (
                        <AnaliseSection icon="warning" title="Cuidado">
                          <div className="mt-2 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
                            <p className="text-sm text-amber-400 leading-snug">
                              {formato.adaptacao_cuidado}
                            </p>
                          </div>
                        </AnaliseSection>
                      )}
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                /* ── FALLBACK LEGADO ──────────────────────────────── */
                <div className="relative min-h-[300px]">
                  {!isPro && (
                    <PremiumOverlay 
                      title="Estudo Completo Restrito" 
                      desc="Assine o Premium para liberar o manuscrito completo, estruturas e o roteiro exato para usar na sua produção." 
                    />
                  )}
                  <div className={!isPro ? 'select-none pointer-events-none blur-[6px] overflow-hidden max-h-[300px]' : ''}>
                    {formato.estudo?.split('\n\n').map((block, i) => {
                      const headerMatch = block.match(/^\*\*(.+?)\*\*(.*)/)
                      if (headerMatch) {
                        const title = headerMatch[1]
                        const rest = headerMatch[2]?.trim() || ''
                        const lines = block.split('\n').slice(1).join('\n')
                        const content = rest ? `${rest}\n${lines}` : lines
                        return (
                          <div key={i} className="border-l-2 border-[#0ea5e9]/40 pl-5 relative before:absolute before:w-2 before:h-2 before:rounded-full before:bg-[#0ea5e9] before:-left-[5px] before:top-1.5 mb-6">
                            <p className="text-sm font-bold text-slate-900 dark:text-white mb-2 tracking-wide">{title}</p>
                            {content.trim() && (
                              <p className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap leading-relaxed opacity-90">{content.trim()}</p>
                            )}
                          </div>
                        )
                      }
                      return (
                        <p key={i} className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap leading-relaxed opacity-90 mb-4">{block}</p>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Botão Redirecionar Roteirista ───────────────── */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-[#0ea5e9]/10 to-transparent border-[#0ea5e9]/20">
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0ea5e9]">flare</span>
                  Usar com Inteligência
                </h3>
                <p className="text-sm text-slate-700 dark:text-white/80 leading-relaxed max-w-xl">
                  Leve esta estrutura exata para o seu <strong>Roteirista Pro</strong> e deixe a Inteligência Artificial moldar o roteiro perfeito para o seu nicho.
                </p>
              </div>
              <Link 
                href={`/roteirista?formato_id=${getFormatoIdParaRoteirista(formato.tipo, formato.nicho)}`}
                className="w-full sm:w-auto shimmer-btn px-8 py-4 rounded-xl flex items-center justify-center gap-3 text-white font-bold text-base shadow-xl shadow-[#0ea5e9]/20 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
              >
                <span className="material-symbols-outlined">arrow_forward</span>
                Levar para o Roteirista
              </Link>
            </div>
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#0ea5e9]/20 blur-[80px] rounded-full pointer-events-none" />
          </div>

          {/* ── AI Generator Box (Oculto / Legado) ───────────────────────────────────── */}
          {false && (
          <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
            {!isPro && (
              <PremiumOverlay 
                title="Clonagem por IA Bloqueada" 
                desc="Desbloqueie o Premium para permitir que a Inteligência Artificial pegue este formato exato e escreva um roteiro inédito já moldado no seu nicho." 
              />
            )}
            
            <div className={`space-y-6 relative z-10 ${!isPro ? 'select-none pointer-events-none blur-[6px] max-h-[350px] overflow-hidden' : ''}`}>
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#0ea5e9]/10 blur-[80px] rounded-full pointer-events-none" />

              <div className="space-y-2 relative z-10">
                <h3 className="text-2xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
                  <span className="material-symbols-outlined text-[#0ea5e9] text-3xl">flare</span>
                  Crie seu Roteiro Modelado
                </h3>
                <p className="text-sm text-slate-700 dark:text-white/80 leading-relaxed max-w-xl">
                  Nossa IA lerá o estudo de viralização e usará a estrutura campeã adaptando para <strong>seu nicho e perfil inseridos na configuração.</strong>
                </p>
              </div>

              {!generatedReel && (
              <div className="space-y-6 relative z-10">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-white/70 uppercase tracking-widest pl-1">
                    Como a Inteligência deve se comportar? (Tom de Voz)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'Professor', icon: '🧑‍🏫' },
                      { id: 'Amigo', icon: '🤝' },
                      { id: 'Provocador', icon: '🔥' },
                      { id: 'Mentor', icon: '🧭' },
                      { id: 'Comediante', icon: '😂' },
                      { id: 'Hipeman', icon: '🚀' },
                    ].map((tom) => (
                      <button
                        key={tom.id}
                        onClick={() => {
                          setTomVoz(tom.id)
                          localStorage.setItem('mapa-engajamento-tom-voz', tom.id)
                        }}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${
                          tomVoz === tom.id
                            ? 'bg-[#0ea5e9]/10 border-[#0ea5e9] text-[#0ea5e9]'
                            : 'bg-black/5 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                      >
                        <span className="text-base">{tom.icon}</span>
                        {tom.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-white/70 uppercase tracking-widest pl-1">
                    Sua Ideia de Conteúdo <span className="text-red-500 font-extrabold">* (obrigatório)</span>
                  </label>
                  <textarea
                    value={ideia}
                    onChange={e => setIdeia(e.target.value)}
                    placeholder="Ex: Quero vender a mentoria de R$1000 no final, pegue na dor da falta de tempo..."
                    className="w-full bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:ring-1 focus:ring-[#0ea5e9] outline-none resize-none transition-all min-h-[100px]"
                  />
                </div>
                <button
                  onClick={handleGenerateReel}
                  disabled={generatingReel}
                  className="shimmer-btn w-full py-4 rounded-xl flex items-center justify-center gap-3 text-white font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-[#0ea5e9]/20 hover:scale-[1.01] active:scale-[0.98]"
                >
                  {generatingReel ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Gerando Inteligência...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">auto_fix_high</span>
                      Gerar Meu Roteiro Viral
                    </>
                  )}
                </button>
              </div>
            )}

            {generateError && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-sm font-bold flex items-center gap-2 relative z-10">
                <span className="material-symbols-outlined">error</span>
                {generateError}
              </div>
            )}

            {generatedReel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 mt-6 glass-card rounded-xl border-l-[3px] border-l-[#0ea5e9] overflow-hidden bg-black/40"
              >
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-slate-900/50 dark:bg-black/50">
                  <label className="text-[10px] sm:text-[11px] font-black text-slate-200 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-[18px]">verified</span>
                    Roteiro Disponível
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGenerateReel}
                      disabled={generatingReel}
                      className="flex items-center gap-1.5 text-[10px] text-white/70 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[14px]">refresh</span>
                      {generatingReel ? 'Gerando...' : 'Reescrever'}
                    </button>
                    <button
                      onClick={() => copyToClipboard(generatedReel)}
                      className="bg-[#0ea5e9] hover:bg-sky-400 text-white flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-lg transition-all font-bold uppercase tracking-widest"
                    >
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      Copiar
                    </button>
                  </div>
                </div>
                <div className="p-5 sm:p-8">
                  {(() => {
                    const parsed = editableBlocks || parseRoteiroBlocks(generatedReel);
                    if (parsed) {
                      const updateReel = (newBlocks: any) => {
                        const merged = { ...parsed, ...newBlocks }
                        setEditableBlocks(merged)
                        setGeneratedReel(`**${merged.titulo}**\n\n[GANCHO]\n${merged.gancho}\n\n[DESENVOLVIMENTO]\n${merged.desenvolvimento}\n\n[CTA E FINAL]\n${merged.cta}`)
                      }
                      return (
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <h4 className="text-[11px] font-black text-[#0ea5e9] uppercase tracking-[0.2em] flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">format_quote</span>Gancho
                            </h4>
                            <Textarea
                              value={parsed.gancho}
                              onChange={(e) => updateReel({ gancho: e.target.value })}
                              className="w-full bg-black/20 border border-[#0ea5e9]/30 rounded-xl p-4 text-white placeholder-white/30 focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9]/50 outline-none resize-y min-h-[120px] font-sans text-[15px] leading-[1.7]"
                            />
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">subject</span>Desenvolvimento
                            </h4>
                            <Textarea
                              value={parsed.desenvolvimento}
                              onChange={(e) => updateReel({ desenvolvimento: e.target.value })}
                              className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 focus:ring-1 focus:ring-white/30 focus:border-white/20 outline-none resize-y min-h-[220px] font-sans text-[15px] leading-[1.7]"
                            />
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">smart_button</span>CTA e Final
                            </h4>
                            <Textarea
                              value={parsed.cta}
                              onChange={(e) => updateReel({ cta: e.target.value })}
                              className="w-full bg-black/20 border border-emerald-500/30 rounded-xl p-4 text-[#a7f3d0] placeholder-emerald-500/30 focus:ring-1 focus:ring-emerald-500 outline-none resize-y min-h-[100px] font-sans text-[15px] leading-[1.7]"
                            />
                          </div>
                        </div>
                      )
                    }
                    return (
                      <Textarea
                        value={generatedReel}
                        onChange={(e) => setGeneratedReel(e.target.value)}
                        className="w-full bg-transparent border-0 text-white focus:ring-0 outline-none resize-y min-h-[400px] font-sans text-[15px] leading-[1.8] p-0 custom-scrollbar"
                      />
                    )
                  })()}
                </div>
              </motion.div>
            )}
            
            </div>
          </div>
          )}

        </div>
      </div>
    </main>
  )
}
