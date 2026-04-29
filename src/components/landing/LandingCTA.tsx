import Link from 'next/link'
import { ArrowRight, TrendingUp } from 'lucide-react'

export function LandingCTA() {
  return (
    <section className="relative overflow-hidden py-32 px-6">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/15 via-transparent to-violet-600/15 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#0ea5e9]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
          <TrendingUp size={14} className="text-[#0ea5e9]" />
          <span className="text-sm font-bold text-white/80 uppercase tracking-widest">Você cria. O sistema vende.</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6 leading-[1.05]">
          Chega de conteúdo<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">
            que não converte.
          </span>
        </h2>

        <p className="text-white/55 text-xl font-medium mb-4 max-w-2xl mx-auto leading-relaxed">
          Você tem conhecimento. Falta o sistema que transforma esse conhecimento em cliente. O Mapa do Engajamento é esse sistema.
        </p>
        <p className="text-white/35 text-base mb-10 max-w-xl mx-auto">
          Sem depender de tráfego pago. Sem precisar viralizar. Só conteúdo estratégico que fala com quem pode te pagar.
        </p>

        <Link
          href="/login?mode=signup"
          className="inline-flex items-center gap-3 bg-white text-[#080b12] rounded-2xl px-10 py-5 font-black text-xl hover:scale-[1.03] transition-transform shadow-2xl shadow-black/40"
        >
          <TrendingUp size={20} className="text-[#0ea5e9]" />
          Quero conteúdo que vende
          <ArrowRight size={20} />
        </Link>

        <p className="text-white/25 text-sm mt-6">
          Garantia 7 dias incondicional · Cancele quando quiser
        </p>
      </div>
    </section>
  )
}
