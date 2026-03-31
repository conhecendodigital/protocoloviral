'use client'


import { PROMPT_CONFIGS, type PromptType } from '@/types/prompt'
import Link from 'next/link'
import { motion } from 'framer-motion'

const PROMPT_ORDER: PromptType[] = ['clareza', 'persona', 'ideias', 'vendas']

const COLORS: Record<PromptType, string> = {
  clareza: 'from-sky-500 to-cyan-400',
  persona: 'from-violet-500 to-purple-400',
  ideias: 'from-amber-500 to-yellow-400',
  roteiro: 'from-emerald-500 to-green-400',
  vendas: 'from-rose-500 to-pink-400',
}

const BORDER_COLORS: Record<PromptType, string> = {
  clareza: 'border-sky-500/30 hover:border-sky-500/60',
  persona: 'border-violet-500/30 hover:border-violet-500/60',
  ideias: 'border-amber-500/30 hover:border-amber-500/60',
  roteiro: 'border-emerald-500/30 hover:border-emerald-500/60',
  vendas: 'border-rose-500/30 hover:border-rose-500/60',
}

const GLOW_COLORS: Record<PromptType, string> = {
  clareza: 'shadow-sky-500/20',
  persona: 'shadow-violet-500/20',
  ideias: 'shadow-amber-500/20',
  roteiro: 'shadow-emerald-500/20',
  vendas: 'shadow-rose-500/20',
}

export default function PromptsIndexPage() {
  return (
    <>

      <main className="flex-1 flex flex-col items-center w-full relative z-10 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-5xl px-6 lg:px-8 py-8 md:py-12 pb-24">

          {/* Page Header */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(14,165,233,0.3)]">
                <span className="material-symbols-outlined text-slate-900 dark:text-white text-3xl">auto_awesome</span>
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-[#0ea5e9]">GERADORES DE</span> TEXTO
                </h1>
                <p className="text-[#0ea5e9] font-medium mt-1">Escolha o que você quer criar</p>
              </div>
            </div>
            <p className="text-slate-800 dark:text-white/90 dark:text-white/90 max-w-2xl leading-relaxed mt-4">
              Comece pelo <strong className="text-slate-900 dark:text-white">Passo 1 (Clareza)</strong> para saber 
              sobre o que falar. Depois siga para os próximos. Cada um usa as informações do seu perfil para 
              criar textos feitos sob medida para você.
            </p>
          </motion.div>

          {/* Pipeline Visual */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROMPT_ORDER.map((tipo, i) => {
              const config = PROMPT_CONFIGS[tipo]
              const hasDeps = config.dependencias.length > 0

              return (
                <motion.div
                  key={tipo}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={`/prompts/${tipo}`}
                    className={`group block glass-card rounded-3xl p-6 border ${BORDER_COLORS[tipo]} transition-all duration-300 hover:shadow-lg ${GLOW_COLORS[tipo]} hover:-translate-y-1 relative overflow-hidden h-full`}
                  >
                    {/* Glow blob on hover */}
                    <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${COLORS[tipo]} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-500 pointer-events-none`}></div>

                    <div className="relative z-10">
                      {/* Number badge + emoji */}
                      <div className="flex items-center justify-between mb-5">
                        <div className={`size-12 rounded-xl bg-gradient-to-br ${COLORS[tipo]} flex items-center justify-center shadow-lg ${GLOW_COLORS[tipo]}`}>
                          <span className="text-2xl">{config.icone}</span>
                        </div>
                        <span className="text-xs font-black text-slate-700 dark:text-white/90 uppercase tracking-widest bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-200 dark:border-white/10">
                          Passo {config.numero}
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-1 group-hover:text-white/90 transition-colors">
                        {config.titulo}
                      </h3>
                      <p className="text-sm text-[#0ea5e9] font-semibold mb-3">{config.subtitulo}</p>
                      
                      {/* Description */}
                      <p className="text-xs text-slate-800 dark:text-white/90 dark:text-white/90 leading-relaxed mb-5">
                        {config.descricao}
                      </p>

                      {/* Dependencies */}
                      {hasDeps && (
                        <div className="flex items-center gap-2 mb-4">
                          <span className="material-symbols-outlined text-slate-800 dark:text-white/90 text-sm">link</span>
                          <span className="text-[10px] text-slate-700 dark:text-white/90 uppercase tracking-widest font-bold">
                            Precisa fazer antes: {config.dependencias.map(d => PROMPT_CONFIGS[d].titulo).join(', ')}
                          </span>
                        </div>
                      )}

                      {/* CTA */}
                      <div className={`flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r ${COLORS[tipo]} opacity-80 group-hover:opacity-100 transition-opacity`}>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">Começar</span>
                        <span className="material-symbols-outlined text-slate-900 dark:text-white text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>

        </div>
      </main>
    </>
  )
}
