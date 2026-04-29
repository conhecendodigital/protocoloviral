'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: 'Precisa de cartão pra testar?',
    a: 'Não. Você cria uma conta gratuitamente e já tem acesso a 5 roteiros por dia. Sem cartão, sem período de trial com prazo. Use quando quiser.',
  },
  {
    q: 'A IA escreve igual pra todo mundo?',
    a: 'Não. É exatamente esse o diferencial. Você configura o seu Tom de Voz uma vez — nicho, estilo, palavras que usa, palavras que evita — e a IA passa a escrever no seu estilo. Dois criadores com o mesmo tema recebem roteiros completamente diferentes.',
  },
  {
    q: 'Os roteiros são detectados como IA?',
    a: 'Depende de como você usa. O roteiro entregue é uma base — você adapta antes de gravar, adiciona exemplos seus, histórias pessoais. Quem faz isso passa despercebido. A ferramenta é pra acelerar, não pra substituir sua voz.',
  },
  {
    q: 'Funciona para qual nicho?',
    a: 'Para qualquer nicho baseado em conteúdo informativo ou de autoridade: saúde, negócios, educação, finanças, emagrecimento, espiritualidade, vendas, empreendedorismo. Se você explica algo pra câmera, o Mapa funciona.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim. Não existe fidelidade. Você cancela pelo painel a qualquer momento, sem multa e sem precisar falar com ninguém. E ainda tem a garantia de 7 dias — se não curtiu, devolvemos o dinheiro.',
  },
  {
    q: 'O que é o modo Premium e o modo Busca?',
    a: 'O modo Padrão gera roteiros rápidos com GPT-4o Mini. O modo Premium usa Claude Sonnet ou GPT-4o — roteiros mais ricos e detalhados. O modo Busca grunda o roteiro em dados reais do Google — ótimo para temas que exigem dados atuais.',
  },
]

export function LandingFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="max-w-3xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9] mb-3">Dúvidas</p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
          Perguntas frequentes
        </h2>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div
            key={i}
            className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-colors"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 p-6 text-left"
            >
              <span className="text-sm font-bold text-white">{faq.q}</span>
              <ChevronDown
                size={16}
                className={`text-white/30 shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
              />
            </button>
            {open === i && (
              <div className="px-6 pb-6">
                <p className="text-sm text-white/55 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
