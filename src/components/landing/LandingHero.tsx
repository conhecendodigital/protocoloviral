import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LandingStats } from './LandingStats'

export function LandingHero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 px-6 text-center overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[#0ea5e9]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      <div className="relative z-10 max-w-5xl mx-auto">

        <p className="text-sm font-black uppercase tracking-widest text-[#0ea5e9] mb-6">
          Biblioteca de formatos virais de criadores reais
        </p>

        {/* Headline central — a promessa do produto */}
        <h1 className="text-5xl md:text-7xl lg:text-[80px] font-black tracking-tighter leading-[1.05] mb-8">
          <span className="block text-white">Outros criadores</span>
          <span className="block text-white">já testaram.</span>
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-[#0ea5e9] to-violet-500 mt-2">
            Você só executa.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-3 leading-relaxed font-medium">
          O Mapa do Engajamento estuda e mapeia os formatos dos vídeos que mais viralizaram. Você pega a estrutura que já funcionou, adapta pro seu nicho e grava. Sem inventar a roda. Sem testar no escuro.
        </p>

        <p className="text-sm text-white/30 mb-10">
          Formatos reais de criadores reais. Estrutura extraída, documentada e pronta pra usar.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/login?mode=signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0ea5e9] to-[#6d28d9] text-white rounded-2xl px-8 py-4 font-black text-lg hover:scale-[1.03] transition-transform shadow-xl shadow-[#0ea5e9]/25"
          >
            Acessar os formatos
            <ArrowRight size={18} />
          </Link>
          <a
            href="#como-funciona"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white/80 rounded-2xl px-8 py-4 font-bold text-lg hover:bg-white/10 transition-colors"
          >
            Ver como funciona
          </a>
        </div>

        {/* Real-time proof numbers */}
        <div className="mt-16">
          <LandingStats />
        </div>
      </div>
    </section>
  )
}
