'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/hooks/use-profile'
import { Textarea } from '@/components/ui/textarea'
import { useParams } from 'next/navigation'
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

export default function FormatoViewPage() {
  const params = useParams()
  const formatId = params.id as string

  const [formato, setFormato] = useState<Formato | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  // AI Generator States
  const { profile } = useProfile()
  const [generatingReel, setGeneratingReel] = useState(false)
  const [generatedReel, setGeneratedReel] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [ideia, setIdeia] = useState('')

  useEffect(() => {
    async function fetchFormato() {
      if (!formatId) {
        setLoading(false)
        return
      }
      
      const { data, error } = await supabase
        .from('formatos')
        .select('*')
        .eq('id', formatId)
        .single()

      if (!error && data) {
        setFormato(data)
      }
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

    setGeneratingReel(true)
    setGenerateError(null)

    try {
      const nicho    = profile.nicho || ''
      const persona  = profile.resposta2.substring(0, 8000)
      const estudo   = formato.estudo
      const duracaoStr = formato.duracao
        ? `${formatDuration(formato.duracao)} segundos`
        : '30 segundos'

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
          formato_nome: formato.titulo || '',
        })
      }
    } catch (err: any) {
      setGenerateError(err.message)
    } finally {
      setGeneratingReel(false)
    }
  }

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

  const renderVideo = (url: string, titulo: string) => {
    const type = getVideoType(url)
    
    if (type === 'drive') {
      const fileId = getDriveFileId(url)
      const base = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url
      return (
        <iframe
          src={base}
          className="absolute inset-0 w-full h-full"
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
          controls
          playsInline
          className="absolute inset-0 w-full h-full object-contain"
        />
      )
    }
    
    return (
      <iframe
        src={url}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={titulo}
      />
    )
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
        
        {/* Left Column (Video + Basic Info) */}
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
                 formato.plataforma === 'Instagram'
                   ? 'text-pink-400 bg-pink-500/10'
                   : 'text-cyan-400 bg-cyan-500/10'
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
               <p className="text-sm text-slate-700 dark:text-white/80 leading-relaxed mb-4">
                 {formato.descricao}
               </p>
             )}
             {formato.link_original && (
               <a
                 href={formato.link_original}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 text-xs w-full justify-center bg-black/5 dark:bg-white/5 py-3 px-4 rounded-xl border border-slate-300/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 dark:text-white transition-all font-bold"
               >
                 <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                 Assistir Original
               </a>
             )}
           </div>
        </div>

        {/* Right Column (Metrics, Study, AI) */}
        <div className="flex-1 flex flex-col gap-6 pt-10">
           {/* Metrics Grid */}
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

           {/* Study Box */}
          <div className="rounded-2xl overflow-hidden glass-card">
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
                 onClick={async () => {
                   try {
                     await navigator.clipboard.writeText(formato.estudo)
                   } catch {
                     const ta = document.createElement('textarea')
                     ta.value = formato.estudo
                     ta.style.position = 'fixed'
                     ta.style.opacity = '0'
                     document.body.appendChild(ta)
                     ta.select()
                     document.execCommand('copy')
                     document.body.removeChild(ta)
                   }
                 }}
                 className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-800 dark:text-white/90 hover:text-slate-900 dark:text-white glass-card px-3 py-1.5 rounded-lg border-white/10 transition-all font-bold uppercase tracking-widest"
               >
                 <span className="material-symbols-outlined text-[14px]">content_copy</span>
                 Copiar
               </button>
            </div>
            <div className="p-4 sm:p-8 overflow-x-auto space-y-6">
              {formato.estudo.split('\n\n').map((block, i) => {
                const headerMatch = block.match(/^\*\*(.+?)\*\*(.*)/)
                if (headerMatch) {
                  const title = headerMatch[1]
                  const rest = headerMatch[2]?.trim() || ''
                  const lines = block.split('\n').slice(1).join('\n')
                  const content = rest ? `${rest}\n${lines}` : lines
                  return (
                    <div key={i} className="border-l-2 border-[#0ea5e9]/40 pl-5 relative before:absolute before:w-2 before:h-2 before:rounded-full before:bg-[#0ea5e9] before:-left-[5px] before:top-1.5">
                      <p className="text-sm font-bold text-slate-900 dark:text-white mb-2 tracking-wide">
                        {title}
                      </p>
                      {content.trim() && (
                        <p className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap leading-relaxed opacity-90">
                          {content.trim()}
                        </p>
                      )}
                    </div>
                  )
                }
                return (
                  <p key={i} className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap leading-relaxed opacity-90">
                    {block}
                  </p>
                )
              })}
            </div>
          </div>

          {/* AI Generator Box */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
             {/* Subdued Glow */}
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
                <div className="space-y-4 relative z-10">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-white/70 uppercase tracking-widest pl-1">
                      Contexto Adicional <span className="text-white/40 opacity-70">(opcional)</span>
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
                       className="bg-[#0ea5e9] hover:bg-sky-400 text-white flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-lg transition-all font-bold uppercase tracking-widest"
                     >
                       <span className="material-symbols-outlined text-[14px]">content_copy</span>
                       Copiar
                     </button>
                   </div>
                 </div>
                 <div className="p-5 sm:p-8">
                   <Textarea
                     value={generatedReel}
                     onChange={(e) => setGeneratedReel(e.target.value)}
                     className="w-full bg-transparent border-0 text-white focus:ring-0 outline-none resize-none min-h-[400px] overflow-y-auto custom-scrollbar font-sans text-[15px] leading-[1.8] p-0"
                   />
                 </div>
               </motion.div>
             )}
          </div>
          
        </div>
      </div>
    </main>
  )
}
