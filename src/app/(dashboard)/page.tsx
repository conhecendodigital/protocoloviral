'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useProfile } from '@/hooks/use-profile'
import { ExecutionMap } from '@/components/shared/ExecutionMap'

export default function HomePage() {
  const { profile, loading, getCompletionPercent } = useProfile()
  const completion = getCompletionPercent()

  // Helper to extract name from email or use default
  const getFirstName = () => {
    if (profile?.nome_completo) {
      return profile.nome_completo.split(' ')[0]
    }
    if (!profile?.email) return 'Mapeador'
    return profile.email.split('@')[0].split('.')[0].replace(/^\w/, c => c.toUpperCase())
  }

  return (
    <>
      {/* Welcome Banner */}
      <section className="mb-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter mb-2 text-white">
            Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-[#0ea5e9]">{loading ? '...' : getFirstName()}</span>!
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            {completion < 100
              ? 'Complete seu perfil para ativar todos os geradores de conteúdo.'
              : 'Sua IA está pronta. Siga o mapa abaixo para criar conteúdo hoje.'}
          </p>
        </motion.div>
      </section>

      {/* Execution Map */}
      {!loading && (
        <ExecutionMap
          completion={completion}
          isRecurring={!!profile?.onboarding_completed}
        />
      )}

      {/* Tools Grid */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0ea5e9]">dashboard</span>
            Suas Ferramentas
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tool 1 */}
          <Link href="/jornada" className="glass-card hover-physics p-6 rounded-xl transition-all duration-300 cursor-pointer block border border-white/5 hover:border-sky-500/30 group">
            <div className="size-12 rounded-xl bg-gradient-to-br from-sky-400/20 to-sky-600/10 flex items-center justify-center text-sky-400 mb-4 border border-sky-400/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[24px]">map</span>
            </div>
            <h4 className="font-bold text-lg mb-2 text-white group-hover:text-sky-400 transition-colors">Jornada de Conteúdo</h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">Siga o mapa metodológico. 30 estações com frameworks prontos para aplicação.</p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-sky-400 uppercase tracking-widest">
              <span>Acessar</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </div>
          </Link>
          {/* Tool 2 */}
          <Link href="/prompts" className="glass-card hover-physics p-6 rounded-xl transition-all duration-300 cursor-pointer block border border-white/5 hover:border-violet-500/30 group">
            <div className="size-12 rounded-xl bg-gradient-to-br from-violet-400/20 to-violet-600/10 flex items-center justify-center text-violet-400 mb-4 border border-violet-400/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[24px]">magic_button</span>
            </div>
            <h4 className="font-bold text-lg mb-2 text-white group-hover:text-violet-400 transition-colors">Gerador de Prompts</h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">Crie textos persuasivos, defina seu nicho e gere roteiros usando o método NOEIXO.</p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
              <span>Acessar</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </div>
          </Link>
          {/* Tool 3 */}
          <Link href="/ganchos" className="glass-card hover-physics p-6 rounded-xl transition-all duration-300 cursor-pointer block border border-white/5 hover:border-cyan-500/30 group">
            <div className="size-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-cyan-600/10 flex items-center justify-center text-cyan-400 mb-4 border border-cyan-400/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[24px]">anchor</span>
            </div>
            <h4 className="font-bold text-lg mb-2 text-white group-hover:text-cyan-400 transition-colors">Ganchos Virais</h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">Biblioteca com as melhores frases de abertura para prender atenção nos Reels.</p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
              <span>Acessar</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </div>
          </Link>
          {/* Tool 4 */}
          <Link href="/bio-analyzer" className="glass-card hover-physics p-6 rounded-xl transition-all duration-300 cursor-pointer block border border-white/5 hover:border-[#0ea5e9]/30 group">
            <div className="size-12 rounded-xl bg-gradient-to-br from-[#0ea5e9]/20 to-sky-600/10 flex items-center justify-center text-[#0ea5e9] mb-4 border border-[#0ea5e9]/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[24px]">monitoring</span>
            </div>
            <h4 className="font-bold text-lg mb-2 text-white group-hover:text-[#0ea5e9] transition-colors">Analisador de Bio</h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">Otimize a descrição do seu perfil no Instagram para converter mais visitantes.</p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#0ea5e9] uppercase tracking-widest">
              <span>Acessar</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </div>
          </Link>
          {/* Tool 5 */}
          <Link href="/rotina" className="glass-card hover-physics p-6 rounded-xl transition-all duration-300 cursor-pointer block border border-white/5 hover:border-emerald-500/30 group">
            <div className="size-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 flex items-center justify-center text-emerald-400 mb-4 border border-emerald-400/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[24px]">calendar_today</span>
            </div>
            <h4 className="font-bold text-lg mb-2 text-white group-hover:text-emerald-400 transition-colors">Rotina Semanal</h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">Sua checklist de criação de conteúdo distribuída estrategicamente durante a semana.</p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              <span>Acessar</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </div>
          </Link>
          {/* Tool 6 */}
          <Link href="/stories" className="glass-card hover-physics p-6 rounded-xl transition-all duration-300 cursor-pointer block border border-white/5 hover:border-rose-500/30 group">
            <div className="size-12 rounded-xl bg-gradient-to-br from-rose-400/20 to-rose-600/10 flex items-center justify-center text-rose-400 mb-4 border border-rose-400/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[24px]">video_camera_front</span>
            </div>
            <h4 className="font-bold text-lg mb-2 text-white group-hover:text-rose-400 transition-colors">Roteiros para Stories</h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">Frameworks focados em gerar conexão real e preparar a audiência para vender.</p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-rose-400 uppercase tracking-widest">
              <span>Acessar</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </div>
          </Link>
        </div>
      </motion.section>
    </>
  )
}

