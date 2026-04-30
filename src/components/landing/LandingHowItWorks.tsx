import { Play, BookOpen, Sparkles, ArrowRight } from 'lucide-react'

const STEPS = [
  {
    n: '01',
    Icon: Play,
    color: '#0ea5e9',
    title: 'A equipe estuda os vídeos que viralizaram',
    desc: 'Cada formato na biblioteca veio de um vídeo real que viralizou em algum nicho. A estrutura foi desmontada, documentada e catalogada. Gancho, desenvolvimento, CTA. Tudo mapeado.',
    tag: 'Trabalho feito pra você',
  },
  {
    n: '02',
    Icon: BookOpen,
    color: '#7c3aed',
    title: 'Você escolhe o formato que quer usar',
    desc: 'Navega pela biblioteca, vê qual formato faz sentido pro tema do dia. Storytelling, Lista Chocante, Problema e Solução, Bastidores, Curiosidade. Cada um com exemplos e explicação de por que funciona.',
    tag: null,
  },
  {
    n: '03',
    Icon: Sparkles,
    color: '#a78bfa',
    title: 'A IA escreve no formato escolhido, no seu tom',
    desc: 'Você descreve o tema. A IA aplica o formato que você escolheu e escreve o roteiro no seu tom de voz. Em 30 segundos você tem gancho, desenvolvimento e CTA prontos. Você grava.',
    tag: '30 segundos',
  },
]

export function LandingHowItWorks() {
  return (
    <section id="como-funciona" className="relative border-y border-white/[0.05] bg-white/[0.02] py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0ea5e9]/4 via-transparent to-violet-600/4 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9] mb-4">Como funciona</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">
            Estudo feito. Você só executa.
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            O trabalho mais difícil já foi feito. Estudamos centenas de vídeos virais, extraímos as estruturas e documentamos tudo. Você chega e usa.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-16 left-[22%] right-[22%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {STEPS.map((step, i) => (
            <div key={step.n} className="relative bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 hover:bg-white/[0.06] transition-colors">
              <span className="absolute top-6 right-6 text-5xl font-black text-white/[0.06] leading-none select-none">{step.n}</span>

              <div
                className="size-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                style={{ background: `${step.color}20`, border: `1px solid ${step.color}30` }}
              >
                <step.Icon size={22} style={{ color: step.color }} />
              </div>

              {step.tag && (
                <span
                  className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 border"
                  style={{ color: step.color, background: `${step.color}10`, borderColor: `${step.color}25` }}
                >
                  {step.tag}
                </span>
              )}

              <h3 className="text-xl font-black text-white mb-3">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>

              {i < STEPS.length - 1 && (
                <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight size={16} className="text-white/20" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Viral formats preview */}
        <div className="mt-12 p-8 rounded-3xl bg-white/[0.03] border border-white/[0.06]">
          <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-5 text-center">Alguns formatos da biblioteca</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              'Ancoragem e Storytelling',
              'Lista Chocante',
              'Problema e Solução',
              'Bastidores e Comparação',
              'Curiosidade',
              'Dica Útil do Dia',
              'Ensino Oculto',
              'Tutorial Passo a Passo',
              'Reação e Análise',
              'Preguiçoso (Sem Esforço)',
              'Perguntas e Respostas',
              'Curiosidade e Notícia',
              'Desmistificação',
              'React e Análise',
              'Geral (Tutorial Rápido)',
            ].map(f => (
              <span key={f} className="text-xs font-bold text-white/50 bg-white/[0.04] border border-white/[0.07] px-3 py-1.5 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
