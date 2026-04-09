'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function RoteiristaPage() {
  return (
    <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar">
      <div className="p-4 sm:p-6 lg:mx-auto max-w-5xl w-full space-y-8 pb-32">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="size-14 bg-gradient-to-br from-[#0ea5e9] to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-[#0ea5e9]/20">
              <span className="material-symbols-outlined text-white text-3xl">edit_note</span>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Roteirista
              </h1>
              <p className="text-sm text-slate-600 dark:text-white/60">
                Escolha um formato viral, defina seu tom e gere roteiros com IA
              </p>
            </div>
          </div>
        </motion.div>

        {/* Coming Soon Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 sm:p-12 text-center"
        >
          <div className="size-20 mx-auto mb-6 bg-gradient-to-br from-[#0ea5e9]/20 to-violet-500/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[#0ea5e9] text-4xl">construction</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Em Construção 🚀
          </h2>
          <p className="text-slate-600 dark:text-white/60 max-w-md mx-auto leading-relaxed mb-6">
            O Roteirista com IA está sendo construído. Em breve você poderá escolher um formato viral, 
            definir seu tom de voz e gerar roteiros personalizados diretamente aqui.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link 
              href="/formatos"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#0ea5e9]/10 text-[#0ea5e9] font-bold rounded-xl hover:bg-[#0ea5e9]/20 transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-lg">movie_filter</span>
              Ver Formatos
            </Link>
            <Link 
              href="/roteiros"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/80 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-lg">description</span>
              Meus Roteiros
            </Link>
          </div>
        </motion.div>

      </div>
    </main>
  )
}
