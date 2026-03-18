'use client'

import { useState } from 'react'

import { STORIES_FRAMEWORKS, STORIES_DICAS, CATEGORIAS_STORIES } from '@/data/stories-frameworks'
import { CopyButton } from '@/components/shared/copy-button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

export default function StoriesPage() {
  const [activeTab, setActiveTab] = useState('vendas')

  const frameworks = STORIES_FRAMEWORKS[activeTab] || []

  return (
    <>
      <main className="flex-1 flex flex-col items-center w-full relative z-10 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-7xl px-6 lg:px-8 py-8 md:py-12 pb-24 space-y-8">
            
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(14,165,233,0.3)]">
                  <span className="material-symbols-outlined text-white text-2xl">amp_stories</span>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Stories que Vendem</h1>
                  <p className="text-[#0ea5e9] font-medium mt-1">Frameworks prontos para sequências estratégicas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Categories and Frameworks */}
            <div className="lg:col-span-8 space-y-8">
                
              {/* Category Tabs */}
              <div className="flex flex-wrap gap-3">
                {CATEGORIAS_STORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                      activeTab === cat.id
                        ? 'bg-[#0ea5e9] text-white shadow-[0_0_20px_rgba(14,165,233,0.4)] scale-105'
                        : 'glass-card text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    <span className="text-xl">{cat.icone}</span>
                    <span className="tracking-wide uppercase">{cat.nome}</span>
                  </button>
                ))}
              </div>

              {/* Frameworks */}
              <div className="space-y-6">
                {frameworks.map((fw, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20, scale: 0.98 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} 
                    className="glass-card rounded-3xl p-6 lg:p-8 border border-white/5 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#0ea5e9]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-opacity opacity-0 group-hover:opacity-100"></div>
                    
                    <div className="flex items-start justify-between gap-3 mb-8 relative z-10">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{fw.icone}</span>
                          <h3 className="font-bold text-xl text-white tracking-tight">{fw.nome}</h3>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">{fw.descricao}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0 font-bold bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/30 rounded-full px-4 py-1.5 uppercase tracking-wider text-[10px]">
                        {fw.stories.length} stories
                      </Badge>
                    </div>

                    <div className="space-y-4 relative z-10">
                      {fw.stories.map((story, j) => {
                        const fullText = `Story ${story.ordem} (${story.tipo}): ${story.texto}\nDica: ${story.dica}`

                        return (
                          <div key={j} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group/story hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0ea5e9]/20 to-indigo-500/20 border border-[#0ea5e9]/30 flex items-center justify-center text-sm font-black text-[#0ea5e9] shrink-0 shadow-inner">
                              {story.ordem}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-[10px] bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold uppercase tracking-wider border-0">
                                  {story.tipo}
                                </Badge>
                              </div>
                              <p className="text-sm font-semibold text-white mb-2 leading-relaxed">{story.texto}</p>
                              <p className="text-xs text-[#0ea5e9] font-medium flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">tips_and_updates</span> 
                                {story.dica}
                              </p>
                            </div>
                            <CopyButton text={fullText} variant="icon" className="opacity-0 group-hover/story:opacity-100 transition-opacity shrink-0 bg-white/10 hover:bg-[#0ea5e9] hover:text-white" />
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                      <CopyButton
                        text={fw.stories.map(s => `Story ${s.ordem} (${s.tipo}): ${s.texto}\nDica: ${s.dica}`).join('\n\n')}
                        className="w-full justify-center bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white rounded-xl py-6 font-bold uppercase tracking-widest text-xs transition-all"
                        label="Copiar Sequência Completa"
                        copiedLabel="Sequência Copiada!"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column: Tips */}
            <div className="lg:col-span-4 space-y-8">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-3xl p-8 border border-[#0ea5e9]/20 bg-gradient-to-b from-[#0ea5e9]/10 to-transparent">
                <h3 className="font-bold text-lg text-white mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#0ea5e9] text-2xl">emoji_objects</span>
                  Dicas de Ouro
                </h3>
                
                <div className="space-y-4">
                  {STORIES_DICAS.slice(0, 8).map((dica, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-[#0ea5e9]/30 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                         <span className="text-xl">{dica.icone}</span>
                      </div>
                      <div>
                        <Badge variant="outline" className="text-[9px] mb-2 border-[#0ea5e9]/30 text-[#0ea5e9] uppercase tracking-wider font-bold">
                          {dica.categoria}
                        </Badge>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">{dica.dica}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
