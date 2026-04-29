import Link from 'next/link'
import { ArrowRight, TrendingUp } from 'lucide-react'

export function LandingHero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 px-6 text-center overflow-hidden">
      {/* Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[#0ea5e9]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#0ea5e9]/10 border border-[#0ea5e9]/25 rounded-full px-4 py-1.5 mb-8">
          <TrendingUp size={14} className="text-[#0ea5e9]" />
          <span className="text-sm font-bold text-[#0ea5e9]">Para criadores que querem vender — não só crescer</span>
        </div>

        {/* Headline — foco no resultado, não na ferramenta */}
        <h1 className="text-5xl md:text-7xl lg:text-[80px] font-black tracking-tighter leading-[1.05] mb-6">
          <span className="block text-white">Seu conteúdo deveria</span>
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-[#0ea5e9] to-violet-500">
            estar vendendo por você.
          </span>
        </h1>

        {/* Sub — bate na dor real */}
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-3 leading-relaxed font-medium">
          Você posta todos os dias e os clientes não aparecem. O problema não é quantidade — é estrutura. O Mapa do Engajamento transforma o que você já sabe em vídeos que atraem, qualificam e convertem.
        </p>
        <p className="text-sm text-white/30 mb-10">
          Usado por criadores que faturam com conteúdo — não que criam por hobby.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/login?mode=signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0ea5e9] to-[#6d28d9] text-white rounded-2xl px-8 py-4 font-black text-lg hover:scale-[1.03] transition-transform shadow-xl shadow-[#0ea5e9]/25"
          >
            Quero conteúdo que vende
            <ArrowRight size={18} />
          </Link>
          <a
            href="#como-funciona"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white/80 rounded-2xl px-8 py-4 font-bold text-lg hover:bg-white/10 transition-colors"
          >
            Ver como funciona
          </a>
        </div>

        {/* Proof bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.05] rounded-2xl overflow-hidden border border-white/[0.05]">
          {[
            { v: 'R$ 0', l: 'custo extra por roteiro gerado' },
            { v: '< 15min', l: 'do tema ao vídeo pronto pra gravar' },
            { v: '100%', l: 'no seu tom de voz, não de robô' },
            { v: '7 dias', l: 'garantia incondicional se não valer' },
          ].map(s => (
            <div key={s.l} className="bg-[#080b12]/80 py-6 px-4 text-center">
              <p className="text-2xl font-black text-white mb-1">{s.v}</p>
              <p className="text-xs font-medium text-white/35">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
