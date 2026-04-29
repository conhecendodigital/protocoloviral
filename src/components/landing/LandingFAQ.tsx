'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: 'Isso funciona mesmo sem ter muitos seguidores?',
    a: 'Sim. Esse é um dos maiores mitos do marketing de conteúdo. Criadores com 3k seguidores vendem mais do que criadores com 100k — quando o conteúdo tem a mensagem certa pra pessoa certa. O Mapa te ajuda a construir exatamente isso: especificidade, não volume.',
  },
  {
    q: 'Qual a diferença pra um ChatGPT comum?',
    a: 'O ChatGPT é genérico. Ele não sabe quem é seu cliente, qual é o objetivo do vídeo (atrair, qualificar ou converter), nem qual estrutura viral funciona pro seu nicho. O Mapa foi construído especificamente pra isso — com os formatos certos, as estruturas certas e o seu tom de voz. O resultado não parece IA. Parece você.',
  },
  {
    q: 'Quanto tempo leva pra ver resultado?',
    a: 'Depende de como você usa. Mas criadores que aplicam a estrutura certa já no primeiro vídeo relatam DMs de clientes em menos de 72 horas. O sistema funciona a partir do primeiro conteúdo estratégico que você publica.',
  },
  {
    q: 'Funciona pra qual tipo de negócio?',
    a: 'Para qualquer negócio baseado em expertise: coaches, consultores, terapeutas, nutricionistas, personal trainers, infoprodutores, mentores, profissionais de saúde. Se você ensina algo e quer vender com conteúdo, o Mapa é pra você.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim, sem burocracia. Você cancela pelo painel, sem precisar falar com ninguém, sem multa. E ainda tem a garantia de 7 dias — se em 7 dias você achar que não valeu, devolvemos 100%. Sem perguntas.',
  },
  {
    q: 'Precisa de cartão pra começar?',
    a: 'Não precisa pra criar a conta e testar. Mas o plano gratuito tem limite de uso. Quando você ver o potencial do sistema e quiser usar sem restrição — que é quando os resultados aparecem de verdade — aí você escolhe o plano.',
  },
]

export function LandingFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="max-w-3xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9] mb-3">Suas dúvidas</p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
          Antes de decidir, leia isso.
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
