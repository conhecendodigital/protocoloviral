'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Camera, ChevronsUpDown, Clock, Eye, Flame, Heart, Search, TrendingUp } from 'lucide-react'

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

const HARDCODED_FORMAT_TYPES = [
  'Todos',
  'Ancoragem',
  'Perguntas e Respostas',
  'Preguiçoso',
  'Tela dividida',
  'Varias Cenas',
  'Reação (react)',
  'Caixinha de Perguntas',
  'Tutorial (passo a passo)'
];

const formatoEmojis: Record<string, string> = {
  'Ancoragem': '⚓',
  'Perguntas e Respostas': '💬',
  'Preguiçoso': '🛋️',
  'Tela dividida': '📱',
  'Varias Cenas': '🎬',
  'Reação (react)': '😲',
  'Caixinha de Perguntas': '❓',
  'Tutorial (passo a passo)': '📋',
  'Todos': '🔥',
};

export const normalizeFormato = (tipo: string | null, nicho: string | null): string => {
  const t = (tipo || '').toLowerCase();
  const n = (nicho || '').toLowerCase();
  const combo = t + ' ' + n;
  
  if (combo.includes('ancorag') || combo.includes('story')) return 'Ancoragem';
  if (combo.includes('pergunta') || combo.includes('resposta') || combo.includes('dual')) return 'Perguntas e Respostas';
  if (combo.includes('caixinha')) return 'Caixinha de Perguntas';
  if (combo.includes('preguiçoso') || combo.includes('preguicoso') || combo.includes('certo') || combo.includes('errado')) return 'Preguiçoso';
  if (combo.includes('tela') || combo.includes('dividida') || combo.includes('comparação') || combo.includes('lado a lado')) return 'Tela dividida';
  if (combo.includes('tutorial') || combo.includes('dica') || combo.includes('passo')) return 'Tutorial (passo a passo)';
  if (combo.includes('react') || combo.includes('reação') || combo.includes('experimento')) return 'Reação (react)';
  
  // default fallback to prevent 'geral' or random categories
  return 'Varias Cenas';
}

export default function FormatosPage() {
  const [formatos, setFormatos] = useState<Formato[]>([])
  const [loading, setLoading] = useState(true)
  
  // States do Filtro "Explore"
  const [busca, setBusca] = useState('')
  const [filtroFormato, setFiltroFormato] = useState('Todos')
  const [ordemMenuAtivo, setOrdemMenuAtivo] = useState(false)
  const [formatoMenuAtivo, setFormatoMenuAtivo] = useState(false)
  const [ordenacao, setOrdenacao] = useState<'recente' | 'engajamento' | 'views'>('recente')
  
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

  const formatosOptions = HARDCODED_FORMAT_TYPES;

  // Filtragem e Ordenação encadeada
  const formatosProcessados = useMemo(() => {
    // Add normalized field
    let result = formatos.map(f => ({
      ...f,
      formato_normalizado: normalizeFormato(f.tipo, f.nicho)
    }))

    // Busca Textual (Título, Descrição ou Plataforma)
    if (busca.trim()) {
      const q = busca.toLowerCase()
      result = result.filter(f => 
        (f.titulo || '').toLowerCase().includes(q) || 
        (f.descricao || '').toLowerCase().includes(q) ||
        (f.plataforma || '').toLowerCase().includes(q) ||
        f.formato_normalizado.toLowerCase().includes(q)
      )
    }

    // Filtro Formato
    if (filtroFormato !== 'Todos') {
      result = result.filter(f => f.formato_normalizado === filtroFormato)
    }

    // Ordenação
    result.sort((a, b) => {
      if (ordenacao === 'engajamento') return (b.engajamento || 0) - (a.engajamento || 0)
      if (ordenacao === 'views') return (b.views || 0) - (a.views || 0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime() // recente
    })

    return result
  }, [formatos, busca, filtroFormato, ordenacao])

  // Extração e Renderização em Autoplay Invisível
  const getDriveFileId = (url: string): string | null => {
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

  const renderVideoExploreContent = (url: string, titulo: string) => {
    const type = getVideoType(url)
    
    // Autoplay Loop Muted Invisível estilo Insta Explore Feed
    if (type === 'drive') {
      const fileId = getDriveFileId(url)
      const base = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url
      return (
        <iframe
          src={base}
          className="w-full h-full object-cover scale-[1.3] opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none"
          allow="autoplay; encrypted-media"
          title={titulo}
        />
      )
    }
    
    if (type === 'direct') {
      return (
        <video
          src={url}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 pointer-events-none"
        />
      )
    }
    
    const separator = url.includes('?') ? '&' : '?'
    const embedUrl = `${url}${separator}autoplay=1&mute=1&loop=1&controls=0&modestbranding=1&playsinline=1`
    
    return (
      <iframe
        src={embedUrl}
        className="w-full h-full object-cover scale-[1.3] opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={titulo}
      />
    )
  }

  return (
    <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar">
      <div className="p-4 sm:p-6 lg:mx-auto max-w-7xl w-full space-y-8 pb-32">

        {/* Header e Filtros Estilo "Explore" Premium */}
        <section className="sticky top-0 z-50 pt-4 pb-6 backdrop-blur-xl mx-[-16px] sm:mx-[-24px] px-4 sm:px-6">
           <div className="flex flex-col lg:flex-row gap-4 items-center justify-between max-w-7xl mx-auto">
             <div className="flex-1 w-full relative">
               <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 text-xl pointer-events-none" />
               <input 
                 autoFocus
                 value={busca}
                 onChange={(e) => setBusca(e.target.value)}
                 type="text"
                 placeholder="Buscar por título, conteúdo ou tema..."
                 className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:ring-2 focus:ring-[#0ea5e9] outline-none shadow-sm shadow-slate-200/50 dark:shadow-none transition-all font-medium"
               />
             </div>
             
             <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 relative">
                {/* Dropdown Formato */}
                <div className="relative w-1/2 lg:w-48">
                  <button 
                    onClick={() => { setFormatoMenuAtivo(!formatoMenuAtivo); setOrdemMenuAtivo(false); }}
                    className="w-full flex items-center justify-between gap-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 py-3.5 px-4 rounded-2xl text-sm font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                       <span>{formatoEmojis[filtroFormato] || '📁'}</span>
                       <span className="truncate">{filtroFormato === 'Todos' ? 'Todos Formatos' : filtroFormato}</span>
                    </div>
                    <ChevronsUpDown size={18} className="text-slate-400 text-lg shrink-0" />
                  </button>
                  <AnimatePresence>
                    {formatoMenuAtivo && (
                      <motion.div 
                         initial={{ opacity: 0, scaleY: 0.9, y: 5 }} animate={{ opacity: 1, scaleY: 1, y: 0 }} exit={{ opacity: 0, scaleY: 0.9, y: 5 }}
                         className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0a0f1e] border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl p-2 z-50 transform origin-top max-h-64 overflow-y-auto custom-scrollbar"
                      >
                         {formatosOptions.map((opt) => (
                           <button 
                             key={opt} onClick={() => { setFiltroFormato(opt); setFormatoMenuAtivo(false); }}
                             className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${filtroFormato === opt ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] font-bold' : 'text-slate-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5'}`}
                           >
                             <span className="text-base">{opt === 'Todos' ? '🌐' : formatoEmojis[opt] || '📁'}</span>
                             {opt === 'Todos' ? 'Todos Formatos' : opt}
                           </button>
                         ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Dropdown Ordenação */}
                <div className="relative w-1/2 lg:w-44">
                  <button 
                    onClick={() => { setOrdemMenuAtivo(!ordemMenuAtivo); setFormatoMenuAtivo(false); }}
                    className="w-full flex items-center justify-between gap-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 py-3.5 px-4 rounded-2xl text-sm font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
{ordenacao === 'recente' ? <Clock size={18} className="text-[#0ea5e9]" /> : ordenacao === 'engajamento' ? <TrendingUp size={18} className="text-[#0ea5e9]" /> : <Eye size={18} className="text-[#0ea5e9]" />}
                       <span className="truncate">
                         {ordenacao === 'recente' ? 'Mais Recente' : ordenacao === 'engajamento' ? 'Top Engajamento' : 'Mais Vistos'}
                       </span>
                    </div>
                    <ChevronsUpDown size={18} className="text-slate-400 text-lg shrink-0" />
                  </button>
                  <AnimatePresence>
                    {ordemMenuAtivo && (
                      <motion.div 
                         initial={{ opacity: 0, scaleY: 0.9, y: 5 }} animate={{ opacity: 1, scaleY: 1, y: 0 }} exit={{ opacity: 0, scaleY: 0.9, y: 5 }}
                         className="absolute top-full right-0 w-48 mt-2 bg-white dark:bg-[#0a0f1e] border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl p-2 z-50 transform origin-top"
                      >
                         <button onClick={() => { setOrdenacao('recente'); setOrdemMenuAtivo(false); }} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${ordenacao === 'recente' ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] font-bold' : 'text-slate-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                           <Clock size={16} className="text-[16px]" /> Mais Recente
                         </button>
                         <button onClick={() => { setOrdenacao('engajamento'); setOrdemMenuAtivo(false); }} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${ordenacao === 'engajamento' ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] font-bold' : 'text-slate-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                           <TrendingUp size={16} className="text-[16px]" /> Maior Engajamento
                         </button>
                         <button onClick={() => { setOrdenacao('views'); setOrdemMenuAtivo(false); }} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${ordenacao === 'views' ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] font-bold' : 'text-slate-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                           <Eye size={16} className="text-[16px]" /> Mais Views
                         </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
             </div>
           </div>
        </section>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-2 border-[#0ea5e9]/30 border-t-[#0ea5e9] rounded-full animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && formatosProcessados.length === 0 && (
          <div className="text-center py-20">
            <Camera size={18} className="text-6xl text-slate-800 dark:text-white/30 mb-4 block" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhum formato viral.</h3>
            <p className="text-slate-800 dark:text-white/60 text-sm max-w-md mx-auto leading-relaxed">
               Tente limpar os filtros, ou aguarde nossa inteligência injetar novas atualizações na base.
            </p>
          </div>
        )}

        {/* Grid Feed Explorar Layout (IG Feed Style) */}
        {!loading && formatosProcessados.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {formatosProcessados.map((formato, i) => (
              <Link 
                href={`/formatos/${formato.id}`}
                key={formato.id}
                className="group block relative aspect-[9/16] rounded-[24px] overflow-hidden bg-black/50 hover:shadow-xl hover:shadow-[#0ea5e9]/20 transition-all cursor-pointer ring-1 ring-white/10 hover:ring-[#0ea5e9]/40 hover:-translate-y-1"
              >
                {/* O Vídeo Em AutoPlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {renderVideoExploreContent(formato.video_url, formato.titulo)}
                </div>
                
                {/* Desfoque do vídeo ao passar o mouse */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 backdrop-blur-[2px] pointer-events-none z-0" />
                
                {/* Sobreposição de Gradiente para legibilidade (Apenas no Hover) */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#060a12]/95 via-[#060a12]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#060a12]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {formato.destaque && (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 bg-gradient-to-r from-amber-500/90 to-orange-600/90 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md shadow-black/30 backdrop-blur-sm opacity-100">
                    <Flame size={12} className="text-[10px] sm:text-[12px]" />
                    Hot
                  </div>
                )}
                
                {/* Informações da Card (Apenas no Hover) */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0 z-10">
                   <div className="flex items-center gap-2 mb-3 flex-wrap text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-[#0ea5e9]">
                     <span className="bg-[#0ea5e9]/20 backdrop-blur-md px-2.5 py-1 rounded text-white flex gap-1 items-center border border-white/10">
                       <span>{formatoEmojis[(formato as any).formato_normalizado] || '📁'}</span>
                       {(formato as any).formato_normalizado || 'Geral'}
                     </span>
                     <span>•</span>
                     <span className="text-white/90 drop-shadow-sm">{formato.plataforma}</span>
                   </div>
                   
                   <h3 className="text-base sm:text-lg font-bold text-white leading-tight line-clamp-3 drop-shadow-lg group-hover:text-[#0ea5e9] transition-colors mb-4">
                     {formato.titulo}
                   </h3>

                   {/* Micro-Metrics e Avatar placeholder */}
                   <div className="flex items-center justify-between mt-auto w-full pt-1 border-t border-white/10">
                     <div className="flex items-center gap-1.5 px-1 py-1 text-[11px] sm:text-[12px] font-bold text-white mt-1">
                        <TrendingUp size={14} className="text-[14px] sm:text-[15px] text-green-400" />
                        {formato.engajamento ? `${formato.engajamento.toFixed(1)}%` : 'Alto'}
                     </div>

                     {(formato.views || formato.curtidas) && (
                       <div className="flex items-center gap-3 sm:gap-4 text-white/90 drop-shadow-md text-[11px] sm:text-[13px] font-bold mt-1">
                         {formato.views != null && (
                           <span className="flex items-center gap-1.5"><Eye size={14} className="text-[14px] sm:text-[16px] text-[#0ea5e9]" /> {formatNumber(formato.views)}</span>
                         )}
                         {formato.views == null && formato.curtidas != null && (
                           <span className="flex items-center gap-1.5"><Heart size={14} className="text-[14px] sm:text-[16px] text-rose-400" /> {formatNumber(formato.curtidas)}</span>
                         )}
                       </div>
                     )}
                   </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* Background layer clicker to close active menus if clicking away */}
      {(ordemMenuAtivo || formatoMenuAtivo) && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => { setOrdemMenuAtivo(false); setFormatoMenuAtivo(false); }} />
      )}
    </main>
  )
}
