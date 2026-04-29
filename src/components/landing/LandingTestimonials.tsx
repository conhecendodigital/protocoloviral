// Depoimentos focados em resultado de venda, não em "facilidade de uso"
const TESTIMONIALS = [
  {
    name: 'Ana Clara S.',
    role: 'Coach de Emagrecimento · 18k seguidores',
    avatar: 'AC',
    color: '#0ea5e9',
    result: '+R$4.200 em 30 dias',
    text: 'Passei meses postando todo dia sem vender nada. Quando entendi que o problema era a estrutura do vídeo — não a frequência — tudo mudou. Meu último lançamento gerou R$4.200 em 30 dias usando os roteiros do Mapa.',
    stars: 5,
  },
  {
    name: 'Rafael M.',
    role: 'Mentor de Negócios · 42k seguidores',
    avatar: 'RM',
    color: '#a78bfa',
    result: '3x mais DMs de clientes',
    text: 'Antes eu postava conteúdo de valor e ficava esperando. Depois que comecei a usar o CTA certo no lugar certo, os DMs triplicaram. A diferença é a intenção dentro do vídeo — e o Mapa me ensinou a colocar isso.',
    stars: 5,
  },
  {
    name: 'Juliana K.',
    role: 'Personal Trainer · 8k seguidores',
    avatar: 'JK',
    color: '#34d399',
    result: 'Primeira venda em 72h',
    text: 'Fiz minha primeira venda de programa online em 72 horas depois que comecei a usar o Mapa. Nunca tinha conseguido vender pelo conteúdo antes. O gancho que a IA me deu parou o scroll e trouxe o cliente certo.',
    stars: 5,
  },
  {
    name: 'Bruno T.',
    role: 'Especialista em Vendas · 31k seguidores',
    avatar: 'BT',
    color: '#fb923c',
    result: 'Taxa de conversão dobrou',
    text: 'Minha taxa de conversão de visualização pra consulta dobrou. Não porque cresci em seguidores — porque o conteúdo parou de ser informativo e virou estratégico. Falo com o cliente certo, do jeito certo.',
    stars: 5,
  },
  {
    name: 'Camila R.',
    role: 'Nutricionista · 5k seguidores',
    avatar: 'CR',
    color: '#f472b6',
    result: 'Vendeu com 5k seguidores',
    text: 'Todo mundo me dizia que precisava ter mais seguidores pra vender. Com 5k, usando a estrutura do Mapa, fiz minha melhor semana de vendas. Não é sobre tamanho de audiência. É sobre a mensagem certa.',
    stars: 5,
  },
  {
    name: 'Diego F.',
    role: 'Infoprodutor · 27k seguidores',
    avatar: 'DF',
    color: '#22d3ee',
    result: '+R$12k no lançamento',
    text: 'Usei o Mapa pra estruturar toda a sequência de conteúdo do meu lançamento. Cada vídeo tinha função: atrair, qualificar, quebrar objeção, converter. O lançamento fez R$12k. Nunca tinha chegado perto disso antes.',
    stars: 5,
  },
]

export function LandingTestimonials() {
  return (
    <section id="depoimentos" className="relative border-y border-white/[0.05] bg-white/[0.02] py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-600/4 via-transparent to-[#0ea5e9]/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9] mb-3">Resultados reais</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">
            Eles pararam de criar pra existir.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">Começaram a criar pra vender.</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Números reais. Não de seguidores — de receita.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white/[0.04] border border-white/[0.07] rounded-3xl p-7 hover:bg-white/[0.07] transition-colors flex flex-col">
              {/* Result highlight */}
              <div className="inline-flex items-center gap-2 mb-5 self-start">
                <span
                  className="text-xs font-black px-3 py-1.5 rounded-full border"
                  style={{ color: t.color, background: `${t.color}15`, borderColor: `${t.color}30` }}
                >
                  {t.result}
                </span>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-sm">★</span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-white/65 text-sm leading-relaxed mb-6 flex-1">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-white/[0.06]">
                <div
                  className="size-10 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                  style={{ background: `linear-gradient(135deg, ${t.color}40, ${t.color}20)`, border: `1px solid ${t.color}30` }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-xs text-white/35">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
