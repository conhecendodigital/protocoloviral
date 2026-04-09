'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVoiceProfiles } from '@/hooks/use-voice-profiles'
import { cn } from '@/lib/utils'

export default function TomDeVozPage() {
  const { profiles, isLoading, createProfile, deleteProfile, setDefaultProfile } = useVoiceProfiles()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [samples, setSamples] = useState<string[]>(['', '', ''])

  const handleUpdateSample = (index: number, value: string) => {
    const newSamples = [...samples]
    newSamples[index] = value
    setSamples(newSamples)
  }

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return alert('Dê um nome para o tom de voz.')
    
    const validSamples = samples.filter(s => s.trim().length > 10)
    if (validSamples.length < 2) return alert('Por favor, informe pelo menos 2 textos de exemplo substanciais.')

    setIsAnalyzing(true)
    try {
      // Analyze with GPT-4o-Mini
      const res = await fetch('/api/analyze-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleTexts: validSamples })
      })

      if (!res.ok) throw new Error('Falha na análise. Verifique os textos.')
      const extracted_style = await res.json()

      // Save to Supabase
      await createProfile({
        name,
        description,
        sample_texts: validSamples,
        extracted_style,
        is_default: profiles.length === 0 // First one becomes default
      })

      // Reset modal
      setName('')
      setDescription('')
      setSamples(['', '', ''])
      setIsModalOpen(false)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar">
      <div className="p-4 sm:p-6 lg:mx-auto max-w-5xl w-full space-y-8 pb-32">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-slate-200 dark:border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="size-14 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <span className="material-symbols-outlined text-white text-3xl">record_voice_over</span>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Tom de Voz
              </h1>
              <p className="text-sm text-slate-600 dark:text-white/60">
                Treine a IA para escrever com o seu estilo único
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-black dark:bg-white text-white dark:text-black font-bold px-5 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all outline-none ring-2 ring-transparent focus-visible:ring-violet-500 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Criar Novo Tom
          </button>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-3xl text-slate-400">autorenew</span>
          </div>
        ) : profiles.length === 0 ? (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center flex flex-col items-center">
             <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-white/20 mb-4 block">assignment_ind</span>
             <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhum tom de voz configurado.</h2>
             <p className="text-slate-500 dark:text-white/60 max-w-sm">Adicione exemplos de como você escreve para que o Roteirista possa imitar perfeitamente o seu estilo.</p>
           </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {profiles.map((profile, i) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  key={profile.id} 
                  className={cn(
                    "relative group bg-white dark:bg-[#0B0F19] border rounded-2xl overflow-hidden transition-all shadow-sm",
                    profile.is_default 
                      ? "border-violet-500 ring-1 ring-violet-500 shadow-violet-500/10" 
                      : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                  )}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{profile.name}</h3>
                        {profile.description && <p className="text-xs text-slate-500 dark:text-white/60 mb-2">{profile.description}</p>}
                        {profile.is_default && (
                          <span className="inline-flex items-center gap-1 bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                            PADRÃO
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => {
                          if (confirm('Tem certeza que deseja apagar este tom de voz?')) {
                            deleteProfile(profile.id)
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                        title="Apagar Tom"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-100 dark:border-white/5">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">psychology</span> Traços Extraídos
                        </p>
                        <ul className="text-xs text-slate-600 dark:text-white/70 space-y-1">
                          <li><strong>Tom:</strong> {profile.extracted_style?.tone?.slice(0,2).join(', ') || 'N/A'}</li>
                          <li><strong>Formatação:</strong> {profile.extracted_style?.formatting || 'N/A'}</li>
                        </ul>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {profile.extracted_style?.vocabulary?.slice(0, 3).map((v: string) => (
                            <span key={v} className="bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-700 dark:text-white/70">"{v}"</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {!profile.is_default && (
                    <div className="px-6 pb-6 pt-2">
                      <button 
                        onClick={() => setDefaultProfile(profile.id)}
                        className="w-full py-2 text-xs font-bold text-slate-700 dark:text-white/80 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors border border-slate-200 dark:border-white/10"
                      >
                        Tornar Padrão
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Modal Criação */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm"
                onClick={() => !isAnalyzing && setIsModalOpen(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
              >
                <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/[0.02]">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-violet-500">model_training</span>
                    Criar Novo Tom de Voz
                  </h2>
                  <button 
                    onClick={() => !isAnalyzing && setIsModalOpen(false)} 
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <form onSubmit={handleAnalyze} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-white/80">Nome do Tom *</label>
                      <input 
                        type="text" 
                        required 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="Ex: Oficial da Marca, Pessoal, Sarcástico"
                        className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500 dark:text-white" 
                        disabled={isAnalyzing}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-white/80">Descrição Opcional</label>
                      <input 
                        type="text" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        placeholder="Para qual finalidade?"
                        className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500 dark:text-white" 
                        disabled={isAnalyzing}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Entradas de Texto</h3>
                      <p className="text-xs text-slate-500 dark:text-white/60">Cole de 2 a 3 textos seus recentes. A IA irá extrair os padrões do seu estilo e salvar como um modelo matemático.</p>
                    </div>

                    {[0, 1, 2].map((i) => (
                      <div key={i} className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-white/60 pl-1 flex items-center gap-1">
                          Amostra {i+1} {i > 1 && <span className="opacity-50">(opcional)</span>}
                        </label>
                        <textarea
                          rows={3}
                          value={samples[i]}
                          onChange={(e) => handleUpdateSample(i, e.target.value)}
                          placeholder={i === 0 ? "Cole aqui um roteiro, caption ou texto que representa perfeitamente seu tom..." : "Mais um exemplo de escrita (opcional)..."}
                          className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500 dark:text-white resize-none"
                          disabled={isAnalyzing}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                    <button 
                      type="submit" 
                      disabled={isAnalyzing}
                      className="w-full bg-linear-to-r from-violet-500 to-pink-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 hover:shadow-violet-500/40 relative overflow-hidden flex items-center justify-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[20px]">autorenew</span>
                          Analisando com GPT-4o-Mini...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">psychology</span>
                          Extrair DNA e Salvar Tom
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">Esta extração não consome seus créditos do plano.</p>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
