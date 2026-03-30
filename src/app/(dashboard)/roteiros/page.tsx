'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface Roteiro {
  id: string
  titulo: string
  roteiro: string
  nicho: string | null
  formato_nome: string | null
  created_at: string
}

export default function RoteirosPage() {
  const [roteiros, setRoteiros] = useState<Roteiro[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function fetchRoteiros() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data, error } = await supabase
        .from('roteiros')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) setRoteiros(data)
      setLoading(false)
    }
    fetchRoteiros()
  }, [supabase])

  const handleCopy = async (texto: string, id: string) => {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = texto
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('roteiros').delete().eq('id', id)
    setRoteiros(prev => prev.filter(r => r.id !== id))
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="material-symbols-outlined animate-spin text-[#0ea5e9] text-4xl">autorenew</span>
      </div>
    )
  }

  return (
    <>
      <main className="flex-1 flex flex-col items-center w-full relative z-10 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-4xl px-6 lg:px-8 py-8 md:py-12 pb-24">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <span className="material-symbols-outlined text-white text-3xl">description</span>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Meus Roteiros</h1>
                <p className="text-emerald-500 font-medium mt-1">Todos os roteiros gerados pela IA</p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-white/70 max-w-2xl leading-relaxed mt-4">
              Aqui ficam salvos todos os roteiros que você gerou na aba <strong className="text-slate-900 dark:text-white">Formatos Virais</strong>. 
              Clique em qualquer um para expandir, editar ou copiar.
            </p>
          </motion.div>

          {/* Empty State */}
          {roteiros.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-12 text-center border border-slate-200 dark:border-white/10"
            >
              <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-white/20 mb-4 block">edit_note</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhum roteiro ainda</h3>
              <p className="text-slate-500 dark:text-white/50 max-w-md mx-auto">
                Vá para <strong>Formatos Virais</strong> no menu, escolha um vídeo e clique em <strong>&quot;Gerar Meu Roteiro com a IA&quot;</strong>. 
                Ele aparecerá aqui automaticamente.
              </p>
            </motion.div>
          )}

          {/* Roteiros List */}
          <div className="space-y-4">
            <AnimatePresence>
              {roteiros.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-card rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden hover:border-emerald-500/30 transition-colors"
                >
                  {/* Card Header — sempre visível */}
                  <button
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate">{r.titulo}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        {r.nicho && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {r.nicho}
                          </span>
                        )}
                        {r.formato_nome && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">
                            {r.formato_nome}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 dark:text-white/40">
                          {formatDate(r.created_at)}
                        </span>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined text-slate-400 dark:text-white/40 transition-transform duration-200 ${expandedId === r.id ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>

                  {/* Card Body — expandido */}
                  <AnimatePresence>
                    {expandedId === r.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-slate-100 dark:border-white/5">
                          {/* Action buttons */}
                          <div className="flex items-center gap-2 py-3">
                            <button
                              onClick={() => handleCopy(r.roteiro, r.id)}
                              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white transition-all shadow-lg shadow-emerald-500/20"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {copiedId === r.id ? 'check' : 'content_copy'}
                              </span>
                              {copiedId === r.id ? 'Copiado!' : 'Copiar'}
                            </button>
                            <button
                              onClick={() => { if (confirm('Tem certeza que quer deletar este roteiro?')) handleDelete(r.id) }}
                              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all border border-red-500/20"
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                              Deletar
                            </button>
                          </div>

                          {/* Roteiro text */}
                          <div className="bg-slate-50 dark:bg-white/[0.02] rounded-xl p-5 border border-slate-100 dark:border-white/5">
                            <pre className="whitespace-pre-wrap break-words font-sans text-sm sm:text-base leading-relaxed text-slate-800 dark:text-white/90">
                              {r.roteiro}
                            </pre>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>
      </main>
    </>
  )
}
