'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/hooks/use-profile'
import { Textarea } from '@/components/ui/textarea'

interface Formato {
  id: string
  titulo: string
  plataforma: string
  tipo: string
  nicho: string
  descricao: string | null
  video_url: string
  link_original: string | null
  estudo: string
  destaque: boolean
  curtidas: number | null
  views: number | null
  reproducoes: number | null
  comentarios: number | null
  duracao: number | null
  engajamento: number | null
  username: string | null
  created_at: string
}

// Format large numbers (e.g., 52977 -> 52.9K)
const formatNumber = (n: number | null): string => {
  if (!n) return '0'
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

// Format duration (33.066 -> 0:33)
const formatDuration = (s: number | null): string => {
  if (!s) return '0:00'
  const min = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

// Emoji map for nichos
const nichoEmojis: Record<string, string> = {
  'Empresas': '🏢',
  'Vlog': '🎥',
  'Educação': '📚',
  'Fitness': '💪',
  'Comida': '🍕',
  'Tech': '💻',
  'Moda': '👗',
  'Beleza': '💄',
  'Finanças': '💰',
  'Humor': '😂',
  'Lifestyle': '✨',
  'Saúde': '🏥',
  'Todos': '🔥',
}

export default function FormatosPage() {
  const [formatos, setFormatos] = useState<Formato[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroAtivo, setFiltroAtivo] = useState('Todos')
  const [modalFormato, setModalFormato] = useState<Formato | null>(null)
  const supabase = useMemo(() => createClient(), [])

  // AI Generator States
  const { profile } = useProfile()
  const [generatingReel, setGeneratingReel] = useState(false)
  const [generatedReel, setGeneratedReel] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [ideia, setIdeia] = useState('')

  const handleCloseModal = () => {
    setModalFormato(null)
    setGeneratedReel(null)
    setGenerateError(null)
  }

  const handleGenerateReel = async () => {
    if (!profile?.resposta1 || !profile?.resposta2) {
      setGenerateError('⚠️ Preencha sua Clareza e Persona na aba "Perfil" no menu esquerdo para a IA saber quem é você antes de gerar.')
      return
    }
    if (!modalFormato) return

    setGeneratingReel(true)
    setGenerateError(null)

    // DEBUG — remove depois de confirmar que os dados chegam certos
    console.log('📤 Perfil completo:', {
      nicho: profile.nicho,
      resposta1_length: profile.resposta1?.length,
      resposta2_length: profile.resposta2?.length,
    })

    try {
      const nicho    = profile.nicho || ''
      const persona  = profile.resposta2.substring(0, 8000)
      const estudo   = modalFormato.estudo
      const duracaoStr = modalFormato.duracao
        ? `${formatDuration(modalFormato.duracao)} segundos`
        : '30 segundos'

      console.log('📦 Enviando pra IA:', {
        nicho,
        persona_length: persona.length,
        estudo_length: estudo?.length,
        duracaoStr,
      })

      const res = await fetch('/api/generate-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nicho,
          persona,
          estudo,
          duracaoStr,
          ideia: ideia || '',
        })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Erro desconhecido na geração.')
      }

      const data = await res.json()

      if (!data.result) {
        throw new Error('A IA retornou vazio. Tente novamente.')
      }

      setGeneratedReel(data.result)

      // Salva o roteiro no Supabase
      const primeiraLinha = data.result.split('\n')[0]
      const titulo = primeiraLinha.replace(/\*\*/g, '').trim() || 'Roteiro sem título'

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('roteiros').insert({
          user_id: user.id,
          titulo,
          roteiro: data.result,
          nicho: nicho,
          formato_nome: modalFormato.titulo || '',
        })
        console.log('✅ Roteiro salvo:', titulo)
      }

    } catch (err: any) {
      setGenerateError(err.message)
    } finally {
      setGeneratingReel(false)
    }
  }

  useEffect(() => {
    async function fetchFormatos() {
      const { data, error } = await supabase
        .from('formatos')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setFormatos(data)
      }
      setLoading(false)
    }
    fetchFormatos()
  }, [supabase])

  // Dynamic nicho filters based on data
  const nichos = useMemo(() => {
    const unique = [...new Set(formatos.map(f => f.nicho).filter(Boolean))]
    return ['Todos', ...unique]
  }, [formatos])

  const formatosFiltrados = filtroAtivo === 'Todos'
    ? formatos
    : formatos.filter(f => f.nicho === filtroAtivo)

  // Extract Google Drive file ID
  const getDriveFileId = (url: string): string | null => {
    const ucMatch = url.match(/drive\.google\.com\/uc\?.*id=([^&\s]+)/)
    if (ucMatch) return ucMatch[1]
    const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/\s]+)/)
    if (fileMatch) return fileMatch[1]
    return null
  }

  // Detect URL type
  const getVideoType = (url: string): 'drive' | 'direct' | 'embed' => {
    if (url.includes('drive.google.com')) return 'drive'
    if (url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || url.includes('/storage/v1/object/')) return 'direct'
    return 'embed'
  }

  // Render video — autoplay param for modal
  const renderVideo = (url: string, titulo: string, autoplay = false, isCover = false) => {
    const type = getVideoType(url)
    
    if (type === 'drive') {
      const fileId = getDriveFileId(url)
      const base = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url
      const embedUrl = autoplay ? `${base}` : base // Drive preview auto-plays by default
      return (
        <iframe
          src={embedUrl}
          className={`absolute inset-0 w-full h-full ${isCover ? 'object-cover scale-150' : ''}`}
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={titulo}
          style={{ border: 'none' }}
        />
      )
    }
    
    if (type === 'direct') {
      return (
        <video
          src={url}
          controls={autoplay}
          autoPlay={autoplay}
          preload="metadata"
          playsInline
          muted={!autoplay}
          className={`absolute inset-0 w-full h-full ${isCover ? 'object-cover' : 'object-contain'}`}
        />
      )
    }
    
    const separator = url.includes('?') ? '&' : '?'
    const embedUrl = autoplay ? `${url}${separator}autoplay=1` : url
    return (
      <iframe
        src={embedUrl}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={titulo}
      />
    )
  }

  return (
    <>
      <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar">
        <div className="p-4 sm:p-6 lg:p-12 max-w-6xl mx-auto w-full space-y-6 sm:space-y-12">

          {/* Title */}
          <section className="text-center space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-[#0ea5e9]">FORMATOS</span> QUE VIRALIZAM
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-slate-800 dark:text-white/90 dark:text-white/90 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed"
            >
              Análises semanais dos formatos mais eficientes por nicho.
            </motion.p>
          </section>

          {/* Nicho Filters */}
          {!loading && formatos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
            >
              {nichos.map(nicho => (
                <button
                  key={nicho}
                  onClick={() => setFiltroAtivo(nicho)}
                  className={`flex items-center gap-1.5 text-[10px] sm:text-xs py-2 px-3 sm:py-2.5 sm:px-5 rounded-full font-bold uppercase tracking-widest transition-all ${
                    filtroAtivo === nicho
                      ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20'
                      : 'glass-card text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:border-slate-300/20 dark:border-white/20'
                  }`}
                >
                  <span className="text-sm">{nichoEmojis[nicho] || '📁'}</span>
                  {nicho}
                </button>
              ))}
            </motion.div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-2 border-[#0ea5e9]/30 border-t-[#0ea5e9] rounded-full animate-spin" />
              <p className="text-slate-800 dark:text-white/90 dark:text-white/90 text-sm">Carregando formatos...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && formatos.length === 0 && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-slate-800 dark:text-white/90 mb-4 block">movie_filter</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Em breve!</h3>
              <p className="text-slate-800 dark:text-white/90 dark:text-white/90 text-sm max-w-md mx-auto leading-relaxed">
                Vamos adicionar novos formatos em breve para você modelar conteúdos virais. 🚀
              </p>
            </div>
          )}

          {/* Formats Grid */}
          {!loading && formatosFiltrados.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              {formatosFiltrados.map((formato, i) => (
                <motion.div
                  key={formato.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.08, 0.3) }}
                  className="glass-card rounded-2xl overflow-hidden group relative cursor-pointer"
                  onClick={() => setModalFormato(formato)}
                >
                  {/* Destaque Badge */}
                  {formato.destaque && (
                    <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-amber-500/20">
                      <span className="material-symbols-outlined text-[12px]">star</span>
                      Destaque
                    </div>
                  )}

                  {/* Video thumbnail — cropped, click opens modal */}
                  <div className="relative w-full aspect-[4/5] sm:aspect-[9/16] sm:max-h-[350px] bg-slate-100 dark:bg-black/50 overflow-hidden rounded-t-xl hover:opacity-90 transition-opacity pointer-events-none">
                    {renderVideo(formato.video_url, formato.titulo, false, true)}
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/20 dark:bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:bg-white/30 transition-all group-hover:scale-110">
                        <span className="material-symbols-outlined text-slate-900 dark:text-white text-2xl sm:text-3xl ml-0.5">play_arrow</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    {/* Nicho + Type + Date */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span className="text-[10px] px-2.5 py-1 rounded font-black tracking-widest uppercase text-purple-400 bg-purple-500/10">
                        {nichoEmojis[formato.nicho] || '📁'} {formato.nicho || 'Geral'}
                      </span>
                      <span className={`text-[10px] px-2.5 py-1 rounded font-black tracking-widest uppercase ${
                        formato.plataforma === 'Instagram'
                          ? 'text-pink-400 bg-pink-500/10'
                          : 'text-cyan-400 bg-cyan-500/10'
                      }`}>
                        {formato.plataforma === 'Instagram' ? '📸' : '🎵'} {formato.plataforma}
                      </span>
                      <span className="text-[10px] text-[#0ea5e9] bg-[#0ea5e9]/10 px-2.5 py-1 rounded font-black tracking-widest uppercase">
                        {formato.tipo}
                      </span>
                      <span className="text-[10px] text-slate-700 dark:text-white/90 font-medium ml-auto">
                        {new Date(formato.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-base sm:text-xl tracking-tight text-slate-900 dark:text-white leading-tight line-clamp-2">{formato.titulo}</h3>

                    {/* Username */}
                    {formato.username && (
                      <p className="text-xs text-slate-700 dark:text-white/90 font-medium">@{formato.username}</p>
                    )}

                    {/* Description */}
                    {formato.descricao && (
                      <p className="text-sm text-slate-800 dark:text-white/90 dark:text-white/90 leading-relaxed line-clamp-2">{formato.descricao}</p>
                    )}

                    {/* Metrics Bar */}
                    {(formato.curtidas || formato.views || formato.engajamento) && (
                      <div className="flex items-center flex-wrap gap-3 sm:gap-4 pt-1 text-[10px] sm:text-[11px] text-slate-800 dark:text-white/90 dark:text-white/90">
                        {formato.curtidas != null && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-red-400">favorite</span>
                            {formatNumber(formato.curtidas)}
                          </span>
                        )}
                        {formato.views != null && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-blue-400">visibility</span>
                            {formatNumber(formato.views)}
                          </span>
                        )}
                        {formato.comentarios != null && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-amber-400">chat_bubble</span>
                            {formatNumber(formato.comentarios)}
                          </span>
                        )}
                        {formato.duracao != null && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-slate-800 dark:text-white/90 dark:text-white/90">timer</span>
                            {formatDuration(formato.duracao)}
                          </span>
                        )}
                        {formato.engajamento != null && (
                          <span className="flex items-center gap-1 ml-auto font-bold text-green-400">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span>
                            {formato.engajamento.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    )}

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-xs text-[#0ea5e9] font-bold pt-1">
                      <span className="material-symbols-outlined text-[16px]">play_circle</span>
                      Assistir e ver estudo completo
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Filtered Empty */}
          {!loading && formatos.length > 0 && formatosFiltrados.length === 0 && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-5xl text-slate-800 dark:text-white/90 mb-4 block">movie_filter</span>
              <p className="text-slate-800 dark:text-white/90 dark:text-white/90 text-lg">Nenhum formato encontrado para este nicho.</p>
              <button
                onClick={() => setFiltroAtivo('Todos')}
                className="mt-4 text-[#0ea5e9] text-sm font-bold hover:underline"
              >
                Ver todos os formatos
              </button>
            </div>
          )}

          <div className="pb-10" />
        </div>
      </main>

      {/* ===== STUDY MODAL (responsive popup) — opens on card click ===== */}
      <AnimatePresence>
        {modalFormato && (
          <motion.div
            key={modalFormato.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
            onClick={handleCloseModal}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal Content */}
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full sm:max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col bg-white dark:bg-[#0a0f1e] border border-slate-200 dark:border-white/10 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="relative shrink-0">
                <div className="modal-header-line" />

                {/* Drag handle (mobile) */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                  <div className="w-10 h-1 rounded-full bg-black/20 dark:bg-white/20" />
                </div>

                <div className="px-6 py-4 sm:py-5 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded font-black tracking-widest uppercase text-purple-400 bg-purple-500/10">
                        {nichoEmojis[modalFormato.nicho] || '📁'} {modalFormato.nicho || 'Geral'}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-black tracking-widest uppercase ${
                        modalFormato.plataforma === 'Instagram'
                          ? 'text-pink-400 bg-pink-500/10'
                          : 'text-cyan-400 bg-cyan-500/10'
                      }`}>
                        {modalFormato.plataforma === 'Instagram' ? '📸' : '🎵'} {modalFormato.plataforma}
                      </span>
                      <span className="text-[10px] text-[#0ea5e9] bg-[#0ea5e9]/10 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                        {modalFormato.tipo}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                      {modalFormato.titulo}
                    </h2>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="shrink-0 p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-slate-800 dark:text-white/90 dark:text-white/90 hover:text-slate-900 dark:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>

              {/* Modal Body (scrollable) */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                {/* Video (autoplay in modal) */}
                <div className="relative w-full max-w-[320px] mx-auto aspect-[9/16] rounded-xl overflow-hidden bg-white/80 dark:bg-black/50 mb-6">
                  {renderVideo(modalFormato.video_url, modalFormato.titulo, true)}
                </div>

                {/* Link Original */}
                {modalFormato.link_original && (
                  <a
                    href={modalFormato.link_original}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-slate-800 dark:text-slate-300 bg-black/5 dark:bg-white/5 py-2.5 px-4 rounded-xl border border-slate-300/10 dark:border-slate-200 dark:border-white/10 hover:bg-black/10 dark:bg-white/10 hover:text-slate-900 dark:text-white transition-all font-semibold mb-6"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    Ver Original no {modalFormato.plataforma}
                  </a>
                )}

                {/* Metrics Grid */}
                {(modalFormato.curtidas || modalFormato.views || modalFormato.engajamento) && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
                    {modalFormato.curtidas != null && (
                      <div className="glass-card rounded-xl p-3 text-center">
                        <span className="material-symbols-outlined text-red-400 text-xl block mb-1">favorite</span>
                        <p className="text-slate-900 dark:text-white font-bold text-sm">{formatNumber(modalFormato.curtidas)}</p>
                        <p className="text-[10px] text-slate-700 dark:text-white/90 uppercase tracking-wider">Curtidas</p>
                      </div>
                    )}
                    {modalFormato.views != null && (
                      <div className="glass-card rounded-xl p-3 text-center">
                        <span className="material-symbols-outlined text-blue-400 text-xl block mb-1">visibility</span>
                        <p className="text-slate-900 dark:text-white font-bold text-sm">{formatNumber(modalFormato.views)}</p>
                        <p className="text-[10px] text-slate-700 dark:text-white/90 uppercase tracking-wider">Views</p>
                      </div>
                    )}
                    {modalFormato.reproducoes != null && (
                      <div className="glass-card rounded-xl p-3 text-center">
                        <span className="material-symbols-outlined text-purple-400 text-xl block mb-1">play_circle</span>
                        <p className="text-slate-900 dark:text-white font-bold text-sm">{formatNumber(modalFormato.reproducoes)}</p>
                        <p className="text-[10px] text-slate-700 dark:text-white/90 uppercase tracking-wider">Plays</p>
                      </div>
                    )}
                    {modalFormato.comentarios != null && (
                      <div className="glass-card rounded-xl p-3 text-center">
                        <span className="material-symbols-outlined text-amber-400 text-xl block mb-1">chat_bubble</span>
                        <p className="text-slate-900 dark:text-white font-bold text-sm">{formatNumber(modalFormato.comentarios)}</p>
                        <p className="text-[10px] text-slate-700 dark:text-white/90 uppercase tracking-wider">Coment.</p>
                      </div>
                    )}
                    {modalFormato.duracao != null && (
                      <div className="glass-card rounded-xl p-3 text-center">
                        <span className="material-symbols-outlined text-slate-800 dark:text-white/90 dark:text-white/90 text-xl block mb-1">timer</span>
                        <p className="text-slate-900 dark:text-white font-bold text-sm">{formatDuration(modalFormato.duracao)}</p>
                        <p className="text-[10px] text-slate-700 dark:text-white/90 uppercase tracking-wider">Duração</p>
                      </div>
                    )}
                    {modalFormato.engajamento != null && (
                      <div className="glass-card rounded-xl p-3 text-center border border-green-500/20">
                        <span className="material-symbols-outlined text-green-400 text-xl block mb-1">trending_up</span>
                        <p className="text-green-400 font-bold text-sm">{modalFormato.engajamento.toFixed(2)}%</p>
                        <p className="text-[10px] text-slate-700 dark:text-white/90 uppercase tracking-wider">Engaj.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Study Terminal */}
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black shadow-xl">
                  <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.02]">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="ml-4 text-xs font-mono text-slate-700 dark:text-white/90">
                      estudo.md
                    </span>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(modalFormato.estudo)
                        } catch {
                          const ta = document.createElement('textarea')
                          ta.value = modalFormato.estudo
                          ta.style.position = 'fixed'
                          ta.style.opacity = '0'
                          document.body.appendChild(ta)
                          ta.select()
                          document.execCommand('copy')
                          document.body.removeChild(ta)
                        }
                      }}
                      className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-800 dark:text-white/90 dark:text-white/90 hover:text-slate-900 dark:text-white bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-300/10 dark:border-slate-200 dark:border-white/10 hover:bg-black/10 dark:bg-white/10 transition-all font-bold uppercase tracking-widest"
                    >
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      Copiar
                    </button>
                  </div>
                  <div className="p-4 sm:p-6 overflow-x-auto space-y-4">
                    {modalFormato.estudo.split('\n\n').map((block, i) => {
                      // Check if block starts with a section header like **Gancho:**
                      const headerMatch = block.match(/^\*\*(.+?)\*\*(.*)/)
                      if (headerMatch) {
                        const title = headerMatch[1]
                        const rest = headerMatch[2]?.trim() || ''
                        // Get remaining lines after the header
                        const lines = block.split('\n').slice(1).join('\n')
                        const content = rest ? `${rest}\n${lines}` : lines
                        return (
                          <div key={i} className="border-l-2 border-[#0ea5e9]/40 pl-4">
                            <p className="text-[13px] sm:text-[14px] font-mono font-bold text-slate-900 dark:text-white mb-1.5 tracking-wide">
                              {title}
                            </p>
                            {content.trim() && (
                              <p className="text-[13px] sm:text-[14px] font-mono text-[#0ea5e9] whitespace-pre-wrap leading-relaxed opacity-80">
                                {content.trim()}
                              </p>
                            )}
                          </div>
                        )
                      }
                      // Regular paragraph
                      return (
                        <p key={i} className="text-[13px] sm:text-[14px] font-mono text-[#0ea5e9] whitespace-pre-wrap leading-relaxed opacity-80">
                          {block}
                        </p>
                      )
                    })}
                  </div>
                </div>

                {/* AI Generator Section */}
                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/10">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white mb-2">
                    <span className="material-symbols-outlined text-[#0ea5e9]">map</span>
                    Adapte esse formato
                  </h3>
                  <p className="text-sm text-slate-800 dark:text-white/90 dark:text-white/90 mb-4 leading-relaxed">
                    A IA vai ler toda a inteligência viral desse <strong className="text-slate-900 dark:text-white">estudo.md</strong> acima e cruzar com os seus dados de <strong className="text-slate-900 dark:text-white">Clareza</strong> e <strong className="text-slate-900 dark:text-white">Persona</strong> para escrever um roteiro inédito já moldado para o seu perfil falar OBRIGATORIAMENTE no modelo estrutural deste vídeo que viralizou.
                  </p>

                  {/* Campo opcional de ideia */}
                  {!generatedReel && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-slate-700 dark:text-white/70 mb-2 block">
                        Tem alguma ideia ou situação específica? <span className="text-slate-400 dark:text-white/40">(opcional)</span>
                      </label>
                      <textarea
                        value={ideia}
                        onChange={e => setIdeia(e.target.value)}
                        placeholder="Ex: quero falar sobre procrastinação, sobre como parei de ter medo de câmera..."
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:ring-2 focus:ring-[#0ea5e9] outline-none resize-none transition-all min-h-[80px] max-h-[120px]"
                      />
                    </div>
                  )}

                  {/* Botão Gerar */}
                  {!generatedReel && (
                    <button
                      onClick={handleGenerateReel}
                      disabled={generatingReel}
                      className="shimmer-btn w-full py-4 rounded-xl flex items-center justify-center gap-3 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed group transition-transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-[#0ea5e9]/20"
                    >
                      {generatingReel ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Escrevendo roteiro viral...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">map</span>
                          Gerar Meu Roteiro com a IA
                        </>
                      )}
                    </button>
                  )}

                  {/* Mensagem de Erro */}
                  {generateError && (
                    <div className="mt-4 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-sm font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined">error</span>
                      {generateError}
                    </div>
                  )}

                  {/* Resultado Gerado */}
                  {generatedReel && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 glass-card rounded-xl border-l-4 border-l-[#0ea5e9] overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-slate-100 dark:bg-white/5">
                        <label className="text-[11px] font-bold text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#0ea5e9] text-[16px]">edit_document</span>
                          Seu Roteiro Inédito
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleGenerateReel}
                            disabled={generatingReel}
                            className="flex items-center gap-1.5 text-[10px] text-slate-800 dark:text-white/90 hover:text-slate-900 dark:text-white bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-300/10 dark:border-white/10 hover:bg-black/10 dark:bg-white/10 transition-all font-bold uppercase tracking-widest disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[14px]">refresh</span>
                            {generatingReel ? 'Gerando...' : 'Reescrever'}
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(generatedReel)
                              } catch {
                                const ta = document.createElement('textarea')
                                ta.value = generatedReel
                                ta.style.position = 'fixed'
                                ta.style.opacity = '0'
                                document.body.appendChild(ta)
                                ta.select()
                                document.execCommand('copy')
                                document.body.removeChild(ta)
                              }
                            }}
                            className="bg-[#0ea5e9] hover:bg-sky-400 text-white flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-lg transition-all font-bold uppercase tracking-widest shadow-lg shadow-[#0ea5e9]/20"
                          >
                            <span className="material-symbols-outlined text-[14px]">content_copy</span>
                            Copiar
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <Textarea
                          value={generatedReel}
                          onChange={(e) => setGeneratedReel(e.target.value)}
                          className="w-full bg-transparent border-0 text-slate-900 dark:text-white focus:ring-0 outline-none resize-none min-h-[300px] max-h-[500px] overflow-y-auto custom-scrollbar font-sans text-sm sm:text-base leading-relaxed p-0"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
