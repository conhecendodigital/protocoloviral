'use client'

import { useState, useEffect, useMemo, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Camera, ChevronsUpDown, Clock, Eye, Flame, Heart, Search, TrendingUp, Anchor, MessageCircle, Sofa, Smartphone, Clapperboard, Star, HelpCircle, BookOpen, Globe, FolderOpen, type LucideIcon } from 'lucide-react'

// ─── Supabase client fora do componente (sem useMemo anti-pattern) ───
const supabase = createClient()

// ─── Types ───────────────────────────────────────────────────────────
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
  formato_normalizado?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────
const formatNumber = (n: number | null): string => {
  if (!n) return '0'
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

// ícones para tipos conhecidos — fallback em FolderOpen para qualquer outro
const formatoIconMap: Record<string, LucideIcon> = {
  'Ancoragem': Anchor,
  'Pergunta/Resposta': MessageCircle,
  'Perguntas e Respostas': MessageCircle,
  'Preguiçoso': Sofa,
  'Lo-Fi': Sofa,
  'Tela Dividida': Smartphone,
  'React': Star,
  'React/Análise': Star,
  'Tutorial': BookOpen,
  'Problema Solucao': BookOpen,
  'Problema / Solução': BookOpen,
  'Storytelling': Clapperboard,
  'Todos': Globe,
}

const FormatoIcon = ({ name, size = 14, className = '' }: { name: string; size?: number; className?: string }) => {
  const Icon = formatoIconMap[name] || FolderOpen
  return <Icon size={size} className={className} />
}

// normalizeFormato — limpa apenas caracteres de formatação, SEM renomear
// _ → espaço | trim | capitaliza primeira letra de cada palavra
export const normalizeFormato = (
  _tipo: string | null,
  nicho: string | null,
): string => {
  if (!nicho || nicho.trim() === '') return 'Geral'
  return nicho
    .replace(/_/g, ' ')   // problema_solucao → problema solucao
    .replace(/\.+$/, '')  // remove ponto no final
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase()) // capitaliza cada palavra
}

const getDriveFileId = (url: string): string | null => {
  const ucMatch = url.match(/drive\.google\.com\/uc\?.*id=([^&\s]+)/)
  if (ucMatch) return ucMatch[1]
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/\s]+)/)
  return fileMatch ? fileMatch[1] : null
}

const getVideoType = (url: string | null | undefined): 'drive' | 'direct' | 'embed' | null => {
  if (!url || url.trim() === '') return null
  if (url.includes('drive.google.com')) return 'drive'
  if (url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || url.includes('/storage/v1/object/')) return 'direct'
  return 'embed'
}

// ─── Lazy Video Card with IntersectionObserver ───────────────────────
interface VideoCardProps {
  formato: Formato & { formato_normalizado: string }
  index: number
}

const VideoCard = memo(function VideoCard({ formato, index }: VideoCardProps) {
  const containerRef = useRef<HTMLAnchorElement>(null)
  // Primeiros 8 cards montam o vídeo imediatamente
  const [inView, setInView] = useState(index < 8)

  // Observer único — carga inicial (dispara 1x e desconecta)
  // rootMargin 250px: pré-carrega antes de aparecer na tela
  useEffect(() => {
    if (index < 8) {
      setInView(true)
      return
    }
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { rootMargin: '250px', threshold: 0 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [index])

  // null quando não há URL válida ou card ainda fora da tela
  const videoType = inView && formato.video_url ? getVideoType(formato.video_url) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      // Delay apenas nos primeiros 8 cards — durante o scroll é instantâneo
      transition={{ delay: index < 8 ? Math.min(index * 0.04, 0.28) : 0, duration: 0.3 }}
    >
      <Link
        ref={containerRef}
        href={`/formatos/${formato.id}`}
        className="group block relative aspect-[9/16] rounded-[24px] overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 hover:shadow-xl hover:shadow-[#0ea5e9]/20 transition-all cursor-pointer ring-1 ring-white/10 hover:ring-[#0ea5e9]/40 hover:-translate-y-1"
      >
        {/* Vídeo ou placeholder */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Placeholder quando fora da tela ou sem URL */}
          {(!inView || videoType === null) && (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              {inView && videoType === null && (
                <div className="flex flex-col items-center gap-2 opacity-20">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
            </div>
          )}

          {inView && videoType === 'drive' && (() => {
            const fileId = getDriveFileId(formato.video_url)
            const src = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : formato.video_url
            return (
              <iframe
                src={src}
                className="w-full h-full object-cover scale-[1.3] opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none"
                allow="autoplay; encrypted-media"
                title={formato.titulo}
                loading={index < 4 ? "eager" : "lazy"}
              />
            )
          })()}

          {inView && videoType === 'direct' && (
            <video
              src={formato.video_url}
              autoPlay muted loop playsInline
              preload={index < 4 ? "auto" : "metadata"}
              poster="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
              onTimeUpdate={(e) => {
                const v = e.currentTarget
                if (v.currentTime > 5) v.currentTime = 0
              }}
              onError={(e) => {
                // Auto-retry once on video load failure
                const video = e.currentTarget;
                if (!video.src.includes('?retry=')) {
                  const sep = formato.video_url.includes('?') ? '&' : '?';
                  video.src = `${formato.video_url}${sep}retry=${Date.now()}`;
                  video.load();
                }
              }}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 pointer-events-none"
            />
          )}

          {inView && videoType === 'embed' && (() => {
            const sep = formato.video_url.includes('?') ? '&' : '?'
            return (
              <iframe
                src={`${formato.video_url}${sep}autoplay=1&mute=1&loop=1&controls=0&modestbranding=1&playsinline=1`}
                className="w-full h-full object-cover scale-[1.3] opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={formato.titulo}
                loading={index < 4 ? "eager" : "lazy"}
              />
            )
          })()}
        </div>

        {/* Gradiente permanente para legibilidade */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Hover overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060a12]/95 via-[#060a12]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#060a12]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Destaque badge */}
        {formato.destaque && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 bg-gradient-to-r from-amber-500/90 to-orange-600/90 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md shadow-black/30 backdrop-blur-sm">
            <Flame size={12} />
            Hot
          </div>
        )}

        {/* Título + métricas — sempre visíveis */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10 pointer-events-none">
          <h3 className="text-[13px] sm:text-sm font-bold text-white/90 leading-tight line-clamp-2 drop-shadow-lg group-hover:text-[#0ea5e9] transition-colors">
            {formato.titulo}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-[11px] sm:text-[12px] font-bold text-white/70">
            <span className="flex items-center gap-1">
              <TrendingUp size={11} className="text-green-400" />
              {formato.engajamento ? `${formato.engajamento.toFixed(1)}%` : 'Alto'}
            </span>
            {formato.views != null && (
              <span className="flex items-center gap-1">
                <Eye size={11} className="text-[#0ea5e9]" />
                {formatNumber(formato.views)}
              </span>
            )}
            {formato.views == null && formato.curtidas != null && (
              <span className="flex items-center gap-1">
                <Heart size={11} className="text-rose-400" />
                {formatNumber(formato.curtidas)}
              </span>
            )}
          </div>
        </div>

        {/* Info extra no hover */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-20 pointer-events-none">
          <div className="flex items-center gap-2 mb-2 flex-wrap text-[9px] sm:text-[11px] font-black uppercase tracking-widest">
            <span className="bg-[#0ea5e9]/20 backdrop-blur-md px-2.5 py-1 rounded text-white flex gap-1 items-center border border-white/10">
              <FormatoIcon name={formato.formato_normalizado} size={12} />
              {formato.formato_normalizado || 'Geral'}
            </span>
            <span className="text-white/70">•</span>
            <span className="text-white/90 drop-shadow-sm">{formato.plataforma}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
})

// ─── Main Component ───────────────────────────────────────────────────
export function FormatosFeed() {
  const [formatos, setFormatos] = useState<Formato[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroFormato, setFiltroFormato] = useState('Todos')
  const [ordemMenuAtivo, setOrdemMenuAtivo] = useState(false)
  const [formatoMenuAtivo, setFormatoMenuAtivo] = useState(false)
  const [ordenacao, setOrdenacao] = useState<'recente' | 'engajamento' | 'views'>('recente')
  const [visibleCount, setVisibleCount] = useState(30)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Reseta a paginação quando houver mudança nos filtros ou busca
  useEffect(() => {
    setVisibleCount(30)
  }, [busca, filtroFormato, ordenacao])

  // IntersectionObserver para o Infinite Scroll
  useEffect(() => {
    const el = observerTarget.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount(prev => prev + 30)
        }
      },
      { rootMargin: '2500px', threshold: 0 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [visibleCount, loading, formatos.length]) // Re-conecta o observer quando a div for renderizada ou o limite mudar

  useEffect(() => {
    let isMounted = true;
    let retries = 0;

    const fetchFormatos = async () => {
      try {
        const { data, error } = await supabase
          .from('formatos')
          .select('id, titulo, plataforma, tipo, nicho, descricao, video_url, link_original, destaque, curtidas, views, engajamento, created_at')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (isMounted) {
          if (data) setFormatos(data as unknown as Formato[]);
          setLoading(false);
        }
      } catch (err) {
        if (retries < 3 && isMounted) {
          retries++;
          setTimeout(fetchFormatos, 2000); // Retry every 2 seconds
        } else if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFormatos();

    return () => {
      isMounted = false;
    };
  }, [])

  const formatosProcessados = useMemo(() => {
    let result = formatos.map(f => ({
      ...f,
      formato_normalizado: normalizeFormato(f.tipo, f.nicho),
    }))
    if (busca.trim()) {
      const q = busca.toLowerCase()
      result = result.filter(f =>
        (f.titulo || '').toLowerCase().includes(q) ||
        (f.descricao || '').toLowerCase().includes(q) ||
        (f.plataforma || '').toLowerCase().includes(q) ||
        f.formato_normalizado.toLowerCase().includes(q)
      )
    }
    if (filtroFormato !== 'Todos') {
      result = result.filter(f => f.formato_normalizado === filtroFormato)
    }
    result.sort((a, b) => {
      if (ordenacao === 'engajamento') return (b.engajamento || 0) - (a.engajamento || 0)
      if (ordenacao === 'views') return (b.views || 0) - (a.views || 0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    return result
  }, [formatos, busca, filtroFormato, ordenacao])

  // Lista dinâmica de tipos — gerada dos dados reais do banco
  const tiposDisponiveis = useMemo(() => {
    const set = new Set<string>()
    formatosProcessados.forEach(f => { if (f.formato_normalizado) set.add(f.formato_normalizado) })
    return ['Todos', ...Array.from(set).sort()]
  }, [formatosProcessados])

  return (
    <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar">
      <div className="p-4 sm:p-6 lg:mx-auto max-w-7xl w-full space-y-8 pb-32">

        {/* Sticky Filters */}
        <section className="sticky top-0 z-50 pt-4 pb-6 backdrop-blur-xl mx-[-16px] sm:mx-[-24px] px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between max-w-7xl mx-auto">
            <div className="flex-1 w-full relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 pointer-events-none" />
              <input
                autoFocus
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                type="text"
                placeholder="Buscar por título, conteúdo ou tema..."
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:ring-2 focus:ring-[#0ea5e9] outline-none shadow-sm transition-all font-medium"
              />
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 relative">
              {/* Formato dropdown */}
              <div className="relative w-1/2 lg:w-48">
                <button
                  onClick={() => { setFormatoMenuAtivo(!formatoMenuAtivo); setOrdemMenuAtivo(false) }}
                  className="w-full flex items-center justify-between gap-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 py-3.5 px-4 rounded-2xl text-sm font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FormatoIcon name={filtroFormato} size={16} className="text-[#0ea5e9] shrink-0" />
                    <span className="truncate">{filtroFormato === 'Todos' ? 'Todos Formatos' : filtroFormato}</span>
                  </div>
                  <ChevronsUpDown size={18} className="text-slate-400 shrink-0" />
                </button>
                <AnimatePresence>
                  {formatoMenuAtivo && (
                    <motion.div
                      initial={{ opacity: 0, scaleY: 0.9, y: 5 }} animate={{ opacity: 1, scaleY: 1, y: 0 }} exit={{ opacity: 0, scaleY: 0.9, y: 5 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0a0f1e] border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl p-2 z-50 origin-top max-h-64 overflow-y-auto custom-scrollbar"
                    >
                      {tiposDisponiveis.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => { setFiltroFormato(opt); setFormatoMenuAtivo(false) }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${filtroFormato === opt ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] font-bold' : 'text-slate-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >
                          <FormatoIcon name={opt} size={14} />
                          {opt === 'Todos' ? 'Todos Formatos' : opt}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Ordenação dropdown */}
              <div className="relative w-1/2 lg:w-44">
                <button
                  onClick={() => { setOrdemMenuAtivo(!ordemMenuAtivo); setFormatoMenuAtivo(false) }}
                  className="w-full flex items-center justify-between gap-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 py-3.5 px-4 rounded-2xl text-sm font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    {ordenacao === 'recente' ? <Clock size={18} className="text-[#0ea5e9]" /> : ordenacao === 'engajamento' ? <TrendingUp size={18} className="text-[#0ea5e9]" /> : <Eye size={18} className="text-[#0ea5e9]" />}
                    <span className="truncate">
                      {ordenacao === 'recente' ? 'Mais Recente' : ordenacao === 'engajamento' ? 'Top Engajamento' : 'Mais Vistos'}
                    </span>
                  </div>
                  <ChevronsUpDown size={18} className="text-slate-400 shrink-0" />
                </button>
                <AnimatePresence>
                  {ordemMenuAtivo && (
                    <motion.div
                      initial={{ opacity: 0, scaleY: 0.9, y: 5 }} animate={{ opacity: 1, scaleY: 1, y: 0 }} exit={{ opacity: 0, scaleY: 0.9, y: 5 }}
                      className="absolute top-full right-0 w-48 mt-2 bg-white dark:bg-[#0a0f1e] border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl p-2 z-50 origin-top"
                    >
                      {([['recente', 'Mais Recente', Clock], ['engajamento', 'Maior Engajamento', TrendingUp], ['views', 'Mais Views', Eye]] as const).map(([val, label, Icon]) => (
                        <button
                          key={val}
                          onClick={() => { setOrdenacao(val); setOrdemMenuAtivo(false) }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${ordenacao === val ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] font-bold' : 'text-slate-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >
                          <Icon size={16} /> {label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="relative aspect-[9/16] w-full rounded-[2rem] bg-slate-100 dark:bg-white/5 animate-pulse overflow-hidden border border-slate-200 dark:border-white/10">
                <div className="absolute top-4 right-4 w-12 h-6 bg-slate-200 dark:bg-white/10 rounded-full" />
                <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-3">
                  <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-full" />
                  <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-2/3" />
                  <div className="flex gap-2 mt-2">
                    <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-16" />
                    <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && formatosProcessados.length === 0 && (
          <div className="text-center py-20">
            <Camera size={64} className="text-slate-300 dark:text-white/30 mb-4 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhum formato viral.</h3>
            <p className="text-slate-600 dark:text-white/60 text-sm max-w-md mx-auto leading-relaxed">
              Tente limpar os filtros, ou aguarde nossa inteligência injetar novas atualizações na base.
            </p>
          </div>
        )}

        {/* Grid — lazy cards */}
        {!loading && formatosProcessados.length > 0 && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {formatosProcessados.slice(0, visibleCount).map((formato, i) => (
                <VideoCard key={formato.id} formato={formato} index={i} />
              ))}
            </div>
            
            {/* Infinite Scroll Trigger */}
            {visibleCount < formatosProcessados.length && (
              <div ref={observerTarget} className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-[#0ea5e9]/30 border-t-[#0ea5e9] rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Backdrop to close menus */}
      {(ordemMenuAtivo || formatoMenuAtivo) && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => { setOrdemMenuAtivo(false); setFormatoMenuAtivo(false) }} />
      )}
    </main>
  )
}
