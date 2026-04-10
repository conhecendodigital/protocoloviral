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

interface RoteiroBlock {
  type: string;
  content: string;
}

function parseScriptToBlocks(text: string): RoteiroBlock[] | null {
  const tokens = text.split(/\n/);
  const blocks: RoteiroBlock[] = [];
  let currentBlockType = 'Geral';
  let currentBlockContent: string[] = [];
  let hasFoundAnyBlock = false;

  for (const line of tokens) {
    const bracketMatch = line.match(/^\[(.*?)\]\s*$/);
    const mdMatch = line.match(/^##\s*(.*?)\s*$/);
    
    if (bracketMatch || mdMatch) {
      if (currentBlockContent.length > 0 || hasFoundAnyBlock) {
        blocks.push({
          type: currentBlockType,
          content: currentBlockContent.join('\n').trim()
        });
      }
      currentBlockContent = [];
      currentBlockType = (bracketMatch ? bracketMatch[1] : (mdMatch ? mdMatch[1] : '')).trim();
      hasFoundAnyBlock = true;
    } else {
      currentBlockContent.push(line);
    }
  }
  
  if (currentBlockContent.length > 0 || hasFoundAnyBlock) {
    blocks.push({
      type: currentBlockType,
      content: currentBlockContent.join('\n').trim()
    });
  }

  const finalBlocks = blocks.filter(b => b.content !== '' || b.type !== 'Geral');
  return hasFoundAnyBlock ? finalBlocks : null;
}

export default function RoteirosPage() {
  const [roteiros, setRoteiros] = useState<Roteiro[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({})
  const [editedBlocks, setEditedBlocks] = useState<Record<string, RoteiroBlock[]>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRoteiros() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

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
    if (!userId) return
    await supabase.from('roteiros').delete().eq('id', id).eq('user_id', userId)
    setRoteiros(prev => prev.filter(r => r.id !== id))
  }

  const getFullEditedText = (id: string, original: string) => {
    if (editedBlocks[id]) {
      return editedBlocks[id].map(b => b.type === 'Geral' ? b.content : `[${b.type}]\n${b.content}`).join('\n\n').trim();
    }
    return editedTexts[id] !== undefined ? editedTexts[id] : original;
  }

  const handleSave = async (id: string, original: string) => {
    if (!userId) return
    const texto = getFullEditedText(id, original)
    setSavingId(id)
    const primeiraLinha = texto.split('\n').find(l => l.trim().length > 0) || '';
    const titulo = primeiraLinha.replace(/\*\*/g, '').trim() || 'Roteiro sem título'
    await supabase.from('roteiros').update({ roteiro: texto, titulo }).eq('id', id).eq('user_id', userId)
    setRoteiros(prev => prev.map(r => r.id === id ? { ...r, roteiro: texto, titulo } : r))
    setEditedTexts(prev => { const n = { ...prev }; delete n[id]; return n })
    setEditedBlocks(prev => { const n = { ...prev }; delete n[id]; return n })
    setSavingId(null)
    setSavedId(id)
    setTimeout(() => setSavedId(null), 2000)
  }

  const getEditedText = (r: Roteiro) => editedTexts[r.id] !== undefined ? editedTexts[r.id] : r.roteiro
  
  const isEdited = (r: Roteiro) => {
    if (editedBlocks[r.id]) return true;
    return editedTexts[r.id] !== undefined && editedTexts[r.id] !== r.roteiro;
  }

  const getBlocksToRender = (r: Roteiro): RoteiroBlock[] | null => {
    if (editedBlocks[r.id]) return editedBlocks[r.id];
    return parseScriptToBlocks(r.roteiro);
  }

  const handleBlockChange = (scriptId: string, blockIndex: number, newContent: string, r: Roteiro) => {
    const blocks = getBlocksToRender(r) || [];
    const newBlocks = [...blocks];
    newBlocks[blockIndex] = { ...newBlocks[blockIndex], content: newContent };
    setEditedBlocks(prev => ({ ...prev, [scriptId]: newBlocks }));
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
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-[#0ea5e9]">MEUS</span> ROTEIROS
                </h1>
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
                              onClick={() => handleCopy(getFullEditedText(r.id, r.roteiro), r.id)}
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

                          {/* Roteiro text — editável */}
                          <div className="bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5 overflow-hidden">
                            {(() => {
                              const blocks = getBlocksToRender(r);
                              if (blocks) {
                                return (
                                  <div className="flex flex-col gap-4 p-5">
                                    {blocks.map((b, bIdx) => (
                                      <div key={bIdx} className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                                        {b.type !== 'Geral' && (
                                          <div className="bg-slate-100/50 dark:bg-white/5 px-4 py-2 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-white/50">
                                              {b.type}
                                            </span>
                                          </div>
                                        )}
                                        <textarea
                                          value={b.content}
                                          onChange={(e) => handleBlockChange(r.id, bIdx, e.target.value, r)}
                                          placeholder={b.type === 'Geral' ? 'Escreva aqui...' : `Conteúdo para: ${b.type}`}
                                          className="w-full bg-transparent p-4 font-sans text-sm sm:text-base leading-relaxed text-slate-800 dark:text-white/90 resize-none outline-none min-h-[100px]"
                                          style={{ height: 'auto', minHeight: `${Math.max(100, b.content.split('\n').length * 26)}px` }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                );
                              }
                              
                              return (
                                  <textarea
                                    value={getEditedText(r)}
                                    onChange={e => setEditedTexts(prev => ({ ...prev, [r.id]: e.target.value }))}
                                    className="w-full bg-transparent p-5 font-sans text-sm sm:text-base leading-relaxed text-slate-800 dark:text-white/90 resize-none outline-none min-h-[200px] focus:ring-2 focus:ring-emerald-500/30 rounded-xl transition-shadow"
                                    style={{ height: 'auto', minHeight: `${Math.max(200, getEditedText(r).split('\n').length * 26)}px` }}
                                  />
                              );
                            })()}
                          </div>
                          
                          {/* Salvar — aparece quando editado */}
                          {isEdited(r) && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-3">
                              <button
                                onClick={() => handleSave(r.id, r.roteiro)}
                                disabled={savingId === r.id}
                                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                              >
                                <span className="material-symbols-outlined text-[14px]">
                                  {savingId === r.id ? 'autorenew' : savedId === r.id ? 'check' : 'save'}
                                </span>
                                {savingId === r.id ? 'Salvando...' : savedId === r.id ? 'Salvo!' : 'Salvar alterações'}
                              </button>
                              <button
                                onClick={() => {
                                  setEditedTexts(prev => { const next = { ...prev }; delete next[r.id]; return next })
                                  setEditedBlocks(prev => { const next = { ...prev }; delete next[r.id]; return next })
                                }}
                                className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white/70 transition-colors"
                              >
                                Desfazer
                              </button>
                            </motion.div>
                          )}
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
