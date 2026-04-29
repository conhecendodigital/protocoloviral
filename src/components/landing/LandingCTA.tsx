import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function LandingCTA() {
  return (
    <section className="relative overflow-hidden py-32 px-6">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/15 via-transparent to-violet-600/15 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#0ea5e9]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="max-w-3xl mx-auto text-center relative z-10">

        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6 leading-[1.05]">
          Você já tem o conhecimento.
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">
            Falta o sistema que vende.
          </span>
        </h2>

        <p className="text-white/55 text-xl font-medium mb-4 max-w-2xl mx-auto leading-relaxed">
          O Mapa do Engajamento coloca estrutura em cada vídeo que você grava. Gancho. Argumento. CTA. Na ordem que faz o cliente agir.
        </p>

        <p className="text-white/35 text-base mb-10 max-w-xl mx-auto">
          Sem depender de tráfego pago. Sem precisar viralizar. Sem precisar ter 100 mil seguidores.
        </p>

        <Link
          href="/login?mode=signup"
          className="inline-flex items-center gap-3 bg-white text-[#080b12] rounded-2xl px-10 py-5 font-black text-xl hover:scale-[1.03] transition-transform shadow-2xl shadow-black/40"
        >
          Quero vender com conteúdo
          <ArrowRight size={20} />
        </Link>

        <p className="text-white/25 text-sm mt-6">
          Garantia 7 dias. Cancele quando quiser.
        </p>
      </div>
    </section>
  )
}
