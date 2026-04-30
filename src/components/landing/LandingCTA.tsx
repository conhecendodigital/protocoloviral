import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function LandingCTA() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-24">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c1628] to-[#0c1628] border border-[#0ea5e9]/20 p-12 md:p-16 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/10 via-transparent to-violet-600/10 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#0ea5e9]/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9] mb-6">
            Pare de criar no escuro
          </p>

          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-6 leading-tight">
            Os formatos que funcionam<br />já foram estudados.
          </h2>

          <p className="text-white/55 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Você pode continuar testando do zero. Ou pode acessar a biblioteca de formatos virais que outros criadores já validaram e começar a usar amanhã.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login?mode=signup"
              className="inline-flex items-center justify-center gap-2 bg-[#0ea5e9] text-white rounded-2xl px-8 py-4 font-black text-lg hover:scale-[1.03] transition-transform shadow-xl shadow-[#0ea5e9]/25"
            >
              Acessar os formatos grátis
              <ArrowRight size={18} />
            </Link>
          </div>

          <p className="text-white/25 text-xs font-medium mt-6">
            Comece grátis. Planos a partir de R$77/mês.
          </p>
        </div>
      </div>
    </section>
  )
}
