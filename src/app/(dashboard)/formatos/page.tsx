'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface Formato {
  id: string
  titulo: string
  plataforma: string
  tipo: string
  descricao: string | null
  video_url: string
  link_original: string | null
  estudo: string
  destaque: boolean
  created_at: string
}

export default function FormatosPage() {
  const [formatos, setFormatos] = useState<Formato[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroAtivo, setFiltroAtivo] = useState('Todos')
  const [modalFormato, setModalFormato] = useState<Formato | null>(null)
  const supabase = useMemo(() => createClient(), [])

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

  const plataformas = useMemo(() => {
    const unique = [...new Set(formatos.map(f => f.plataforma))]
    return ['Todos', ...unique]
  }, [formatos])

  const formatosFiltrados = filtroAtivo === 'Todos'
    ? formatos
    : formatos.filter(f => f.plataforma === filtroAtivo)

  // Extract Google Drive file ID from various URL formats
  const getDriveFileId = (url: string): string | null => {
    // Match: drive.google.com/uc?export=download&id=FILE_ID
    const ucMatch = url.match(/drive\.google\.com\/uc\?.*id=([^&\s]+)/)
    if (ucMatch) return ucMatch[1]
    
    // Match: drive.google.com/file/d/FILE_ID/...
    const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/\s]+)/)
    if (fileMatch) return fileMatch[1]
    
    return null
  }

  // Convert Drive URL to streamable URL
  const getDriveStreamUrl = (url: string): string => {
    const fileId = getDriveFileId(url)
    if (fileId) return `https://lh3.googleusercontent.com/d/${fileId}`
    return url
  }

  // Detect URL type
  const getVideoType = (url: string): 'drive' | 'direct' | 'embed' => {
    if (url.includes('drive.google.com')) return 'drive'
    if (url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || url.includes('/storage/v1/object/')) return 'direct'
    return 'embed'
  }

  // Render video based on type
  const renderVideo = (url: string, titulo: string, className: string = '') => {
    const type = getVideoType(url)
    
    if (type === 'drive') {
      return (
        <video
          src={getDriveStreamUrl(url)}
          controls
          preload="metadata"
          playsInline
          className={`absolute inset-0 w-full h-full object-cover ${className}`}
        />
      )
    }
    
    if (type === 'direct') {
      return (
        <video
          src={url}
          controls
          preload="metadata"
          playsInline
          className={`absolute inset-0 w-full h-full object-cover ${className}`}
        />
      )
    }
    
    return (
      <iframe
        src={url}
        className={`absolute inset-0 w-full h-full ${className}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={titulo}
      />
    )
  }

  return (
    <>
      <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar">
        <div className="p-6 lg:p-12 max-w-6xl mx-auto w-full space-y-12">

          {/* Title */}
          <section className="text-center space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase italic"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-[#0ea5e9]">FORMATOS</span> QUE VIRALIZAM
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed"
            >
              Análises semanais dos formatos mais eficientes do Instagram e TikTok.
            </motion.p>
          </section>

          {/* Platform Filters */}
          {!loading && formatos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              {plataformas.map(plat => (
                <button
                  key={plat}
                  onClick={() => setFiltroAtivo(plat)}
                  className={`flex items-center gap-2 text-xs py-2.5 px-6 rounded-full font-bold uppercase tracking-widest transition-all ${
                    filtroAtivo === plat
                      ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20'
                      : 'glass-card text-slate-300 hover:text-white hover:border-white/20'
                  }`}
                >
                  {plat === 'Instagram' && <span className="text-sm">📸</span>}
                  {plat === 'TikTok' && <span className="text-sm">🎵</span>}
                  {plat === 'Todos' && <span className="text-sm">🔥</span>}
                  {plat}
                </button>
              ))}
            </motion.div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-2 border-[#0ea5e9]/30 border-t-[#0ea5e9] rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Carregando formatos...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && formatos.length === 0 && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-slate-600 mb-4 block">movie_filter</span>
              <h3 className="text-xl font-bold text-white mb-2">Em breve!</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                Vamos adicionar novos formatos em breve para você modelar conteúdos virais. 🚀
              </p>
            </div>
          )}

          {/* Formats Grid */}
          {!loading && formatosFiltrados.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {formatosFiltrados.map((formato, i) => (
                <motion.div
                  key={formato.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.08, 0.3) }}
                  className="glass-card rounded-2xl overflow-hidden group relative"
                >
                  {/* Destaque Badge */}
                  {formato.destaque && (
                    <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-amber-500/20">
                      <span className="material-symbols-outlined text-[12px]">star</span>
                      Destaque
                    </div>
                  )}

                  {/* Video (vertical 9:16 — 1080x1920) */}
                  <div className="relative w-full aspect-[9/16] bg-black/50 overflow-hidden">
                    {renderVideo(formato.video_url, formato.titulo)}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Platform + Type + Date */}
                    <div className="flex items-center gap-3 flex-wrap">
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
                      <span className="text-[10px] text-slate-500 font-medium ml-auto">
                        {new Date(formato.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-xl tracking-tight text-white leading-tight">{formato.titulo}</h3>

                    {/* Description */}
                    {formato.descricao && (
                      <p className="text-sm text-slate-400 leading-relaxed">{formato.descricao}</p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      {formato.link_original && (
                        <a
                          href={formato.link_original}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 py-2.5 px-4 rounded-xl border border-white/10 hover:bg-white/10 hover:text-white transition-all font-semibold"
                        >
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          Ver Original
                        </a>
                      )}
                      <button
                        onClick={() => setModalFormato(formato)}
                        className="flex items-center gap-2 text-xs py-2.5 px-4 rounded-xl font-bold transition-all bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/20"
                      >
                        <span className="material-symbols-outlined text-[16px]">science</span>
                        Ver Estudo
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Filtered Empty */}
          {!loading && formatos.length > 0 && formatosFiltrados.length === 0 && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-5xl text-slate-600 mb-4 block">movie_filter</span>
              <p className="text-slate-400 text-lg">Nenhum formato encontrado para esta plataforma.</p>
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

      {/* ===== STUDY MODAL (responsive popup) ===== */}
      <AnimatePresence>
        {modalFormato && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
            onClick={() => setModalFormato(null)}
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
              className="relative z-10 w-full sm:max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col bg-[#0a0f1e] border border-white/10 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
            >
              {/* Modal Header */}
              <div className="relative shrink-0">
                <div className="modal-header-line" />

                {/* Drag handle (mobile) */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                  <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>

                <div className="px-6 py-4 sm:py-5 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
                      {modalFormato.titulo}
                    </h2>
                  </div>
                  <button
                    onClick={() => setModalFormato(null)}
                    className="shrink-0 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>

              {/* Modal Body (scrollable) */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                {/* Video (vertical 9:16) */}
                <div className="relative w-full max-w-[320px] mx-auto aspect-[9/16] rounded-xl overflow-hidden bg-black/50 mb-6">
                  {renderVideo(modalFormato.video_url, modalFormato.titulo)}
                </div>

                {/* Link Original */}
                {modalFormato.link_original && (
                  <a
                    href={modalFormato.link_original}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-slate-300 bg-white/5 py-2.5 px-4 rounded-xl border border-white/10 hover:bg-white/10 hover:text-white transition-all font-semibold mb-6"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    Ver Original no {modalFormato.plataforma}
                  </a>
                )}

                {/* Study Terminal */}
                <div className="rounded-xl overflow-hidden border border-white/10 bg-[#000000] shadow-2xl">
                  <div className="flex items-center px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="ml-4 text-xs font-mono text-slate-500">
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
                      className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-all font-bold uppercase tracking-widest"
                    >
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      Copiar
                    </button>
                  </div>
                  <div className="p-4 sm:p-6 overflow-x-auto">
                    <pre className="text-[13px] sm:text-[14px] font-mono text-[#0ea5e9] whitespace-pre-wrap leading-relaxed">
                      {modalFormato.estudo}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
