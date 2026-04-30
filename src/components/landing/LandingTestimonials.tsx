const TESTIMONIALS = [
  {
    name: 'Ana Clara S.',
    role: 'Coach de Emagrecimento, 18k seguidores',
    avatar: 'AC',
    color: '#0ea5e9',
    result: 'Parou de inventar formato',
    text: 'Eu ficava horas pensando em como estruturar o vídeo. Hoje entro na biblioteca, vejo qual formato faz sentido pro tema do dia e adapto. O tempo que eu perdia criando estrutura agora vai pra gravar. Meu volume triplicou.',
    stars: 5,
  },
  {
    name: 'Rafael M.',
    role: 'Mentor de Negócios, 42k seguidores',
    avatar: 'RM',
    color: '#a78bfa',
    result: 'Entendeu o que fazia os vídeos virais',
    text: 'Eu via vídeos virais e não entendia por que funcionavam. Com o Mapa eu parei de tentar adivinhar. A estrutura já está documentada. Você vê o gancho que parou o scroll, o desenvolvimento que segurou a atenção, o CTA que converteu.',
    stars: 5,
  },
  {
    name: 'Juliana K.',
    role: 'Personal Trainer, 8k seguidores',
    avatar: 'JK',
    color: '#34d399',
    result: '2 semanas de conteúdo em 1 tarde',
    text: 'Peguei 7 formatos da biblioteca num domingo, descrevi os temas pra IA e em uma tarde tinha 2 semanas de roteiros prontos. Cada um estruturado de um jeito diferente. Nunca mais trava na frente da câmera.',
    stars: 5,
  },
  {
    name: 'Bruno T.',
    role: 'Especialista em Vendas, 31k seguidores',
    avatar: 'BT',
    color: '#fb923c',
    result: 'Analisou e adaptou o formato de um viral',
    text: 'Vi um vídeo de um americano que fez 2 milhões de views. Colei a URL no Mapa, a IA extraiu a estrutura. Adaptei pro meu nicho. O vídeo que fiz no mesmo formato teve o melhor desempenho do mês. Funciona de verdade.',
    stars: 5,
  },
  {
    name: 'Camila R.',
    role: 'Nutricionista, 5k seguidores',
    avatar: 'CR',
    color: '#f472b6',
    result: 'Primeiro vídeo de 100k views',
    text: 'Usei o formato "Desmistificação" da biblioteca. Estruturei o tema do jeito que o formato manda. O vídeo chegou em 100k visualizações. Era a primeira vez que algo meu chegava perto disso. O formato fez a diferença.',
    stars: 5,
  },
  {
    name: 'Diego F.',
    role: 'Infoprodutor, 27k seguidores',
    avatar: 'DF',
    color: '#22d3ee',
    result: 'Consistência que não tinha antes',
    text: 'O meu problema não era talento. Era consistência. Eu não sabia o que postar toda semana. Com a biblioteca de formatos, o problema sumiu. Tenho estrutura pra qualquer tema. Posta toda semana sem travar.',
    stars: 5,
  },
]

export function LandingTestimonials() {
  return (
    <section id="depoimentos" className="relative border-y border-white/[0.05] bg-white/[0.02] py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-600/4 via-transparent to-[#0ea5e9]/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9] mb-4">Quem usa</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">
            Pararam de inventar.
          </h2>
          <p className="text-white/50 text-xl font-medium">
            Começaram a executar o que funciona.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white/[0.04] border border-white/[0.07] rounded-3xl p-7 hover:bg-white/[0.07] transition-colors flex flex-col">
              <div className="inline-flex items-center gap-2 mb-5 self-start">
                <span
                  className="text-xs font-black px-3 py-1.5 rounded-full border"
                  style={{ color: t.color, background: `${t.color}15`, borderColor: `${t.color}30` }}
                >
                  {t.result}
                </span>
              </div>

              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-sm">★</span>
                ))}
              </div>

              <p className="text-white/65 text-sm leading-relaxed mb-6 flex-1">
                {t.text}
              </p>

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
