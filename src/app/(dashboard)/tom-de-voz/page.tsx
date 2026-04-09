'use client'

import { motion } from 'framer-motion'

export default function TomDeVozPage() {
  return (
    <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar">
      <div className="p-4 sm:p-6 lg:mx-auto max-w-5xl w-full space-y-8 pb-32">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
          <div className="flex items-center gap-4 mb-3">
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
        </motion.div>

        {/* Coming Soon Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 sm:p-12 text-center"
        >
          <div className="size-20 mx-auto mb-6 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-violet-400 text-4xl">construction</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Em Construção 🎭
          </h2>
          <p className="text-slate-600 dark:text-white/60 max-w-md mx-auto leading-relaxed mb-6">
            Aqui você vai poder criar perfis de voz personalizados. Cole exemplos de textos seus 
            e a IA vai aprender seu vocabulário, ritmo e estilo de escrita.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10">
              <span className="material-symbols-outlined text-[#0ea5e9] text-2xl mb-2 block">edit_document</span>
              <p className="text-xs font-bold text-slate-700 dark:text-white/80">Cole seus textos</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10">
              <span className="material-symbols-outlined text-violet-400 text-2xl mb-2 block">psychology</span>
              <p className="text-xs font-bold text-slate-700 dark:text-white/80">IA analisa estilo</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10">
              <span className="material-symbols-outlined text-emerald-400 text-2xl mb-2 block">check_circle</span>
              <p className="text-xs font-bold text-slate-700 dark:text-white/80">Roteiros no seu tom</p>
            </div>
          </div>
        </motion.div>

      </div>
    </main>
  )
}
