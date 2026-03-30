'use client'

import { useState } from 'react'

import { GANCHOS_VIRAIS, CATEGORIAS_GANCHOS } from '@/data/ganchos'
import { CopyButton } from '@/components/shared/copy-button'
import { motion } from 'framer-motion'

export default function GanchosPage() {
  const [categoria, setCategoria] = useState('all')
  const [busca, setBusca] = useState('')

  const filtered = GANCHOS_VIRAIS.filter(g => {
    const matchCat = categoria === 'all' || g.cat === categoria
    const matchBusca = !busca || g.txt.toLowerCase().includes(busca.toLowerCase())
    return matchCat && matchBusca
  })

  return (
    <>
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative z-10">
        <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-12">
          
          {/* Title Section */}
          <section>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl lg:text-6xl font-black tracking-[-0.04em] mb-4 text-slate-900 dark:text-white uppercase italic">
              BANCO DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-[#0ea5e9]">GANCHOS VIRAIS</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-slate-800 dark:text-white/90 dark:text-white/90 text-lg max-w-3xl leading-relaxed">
              Acesso instantâneo às melhores estratégias de abertura para prender a atenção do seu público nos primeiros segundos. ({GANCHOS_VIRAIS.length} ganchos prontos)
            </motion.p>
          </section>

          {/* Search Bar */}
          <section>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative group">
              <div className="absolute inset-0 bg-[#0ea5e9]/5 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>
              <div className="relative flex items-center glass-card rounded-2xl border border-slate-300/10 dark:border-slate-200 dark:border-white/10 bg-white/[0.02]">
                <div className="pl-6 text-slate-700 dark:text-white/90">
                  <span className="material-symbols-outlined text-2xl">search</span>
                </div>
                <input 
                  className="w-full bg-transparent border-none h-16 py-6 pl-4 pr-6 text-lg focus:ring-0 outline-none placeholder:text-slate-800 dark:text-white/90 text-slate-900 dark:text-white font-medium" 
                  placeholder="Pesquise por nichos, temas ou palavras-chave..." 
                  type="text"
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                />
              </div>
            </motion.div>
          </section>

          {/* Filters */}
          <section className="flex flex-wrap gap-3">
             <button
               onClick={() => setCategoria('all')}
               className={`px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-[0.15em] transition-all hover:scale-105 ${
                 categoria === 'all' 
                 ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20' 
                 : 'glass-card text-slate-700 dark:text-white/90 hover:text-slate-900 dark:text-white hover:bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-slate-200 dark:border-white/10'
               }`}
             >
               Todos os Ganchos
             </button>
            {CATEGORIAS_GANCHOS.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoria(cat.id)}
                className={`px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-[0.15em] transition-all hover:scale-105 ${
                 categoria === cat.id 
                 ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20' 
                 : 'glass-card text-slate-700 dark:text-white/90 hover:text-slate-900 dark:text-white hover:bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-slate-200 dark:border-white/10'
                }`}
              >
                {cat.nome}
              </button>
            ))}
          </section>

          {/* Hook Cards Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {filtered.map((gancho, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: Math.min(i * 0.05, 0.4) }}
                className="glass-card tool-card p-10 rounded-3xl transition-all duration-500 flex flex-col justify-between group h-full border border-white/[0.05] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <span className="material-symbols-outlined text-[100px] text-[#0ea5e9]">anchor</span>
                </div>
                
                <div className="relative z-10 w-full">
                  <div className="flex justify-between items-start mb-8 w-full">
                    <span className="px-4 py-1.5 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] text-[10px] font-black uppercase tracking-[0.15em]">
                      {gancho.cat}
                    </span>
                    <CopyButton text={gancho.txt} variant="icon" className="shrink-0 text-slate-800 dark:text-white/90 hover:text-slate-900 dark:text-white transition-colors p-1" />
                  </div>
                  
                  <h3 className="text-xl lg:text-2xl font-bold leading-snug text-slate-900 dark:text-white tracking-tight">
                    {gancho.txt}
                  </h3>
                </div>
                
                <div className="relative z-10 w-full flex items-center justify-between mt-12 pt-6 border-t border-slate-200 dark:border-slate-200 dark:border-white/10">
                  <span className="text-slate-700 dark:text-white/90 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                     <span className="material-symbols-outlined text-[16px] text-[#0ea5e9]/50">visibility</span>
                     Usado 1.2k+
                  </span>
                  
                  <button onClick={() => { navigator.clipboard.writeText(gancho.txt) }} className="text-[#0ea5e9] text-[11px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 outline-none">
                     Copiar <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </section>

        </div>
      </main>
    </>
  )
}
