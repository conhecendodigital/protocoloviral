const TESTIMONIALS = [
  {
    name: 'Ana Clara S.',
    role: 'Coach de Emagrecimento · 18k seguidores',
    avatar: 'AC',
    color: '#0ea5e9',
    text: 'Passei meses travada na frente da câmera sem saber o que falar. Em uma semana usando o Mapa, gravei 12 vídeos com roteiro. Meu engajamento dobrou.',
    stars: 5,
  },
  {
    name: 'Rafael M.',
    role: 'Empreendedor Digital · 42k seguidores',
    avatar: 'RM',
    color: '#a78bfa',
    text: 'O que me surpreendeu foi o tom de voz. O roteiro sai como se eu tivesse escrito. Meus seguidores não percebem que é IA — e isso é o que importa.',
    stars: 5,
  },
  {
    name: 'Juliana K.',
    role: 'Personal Trainer · 8k seguidores',
    avatar: 'JK',
    color: '#34d399',
    text: 'Antes gastava 2 horas por vídeo pensando no roteiro. Hoje levo 15 minutos do início ao fim. Sobrou tempo pra gravar mais. Simples assim.',
    stars: 5,
  },
  {
    name: 'Bruno T.',
    role: 'Especialista em Vendas · 31k seguidores',
    avatar: 'BT',
    color: '#fb923c',
    text: 'O Banco de Ganchos sozinho já vale o plano. Nunca mais fiquei na dúvida de como abrir o vídeo. Tenho 100 opções prontas pra qualquer tema.',
    stars: 5,
  },
  {
    name: 'Camila R.',
    role: 'Nutricionista · 5k seguidores',
    avatar: 'CR',
    color: '#f472b6',
    text: 'Comecei no plano grátis com os 5 roteiros por dia. Em 3 dias percebi que precisava do Pro. O ROI foi imediato — meu primeiro vídeo com o Mapa viralizou.',
    stars: 5,
  },
  {
    name: 'Diego F.',
    role: 'Mentor de Negócios · 27k seguidores',
    avatar: 'DF',
    color: '#22d3ee',
    text: 'Uso o modo busca pra deixar os roteiros baseados em tendências reais do Google. Meu conteúdo ficou muito mais atual e relevante pra audiência.',
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
            Criadores que pararam de improvisar.
          </h2>
          <p className="text-white/50 text-lg">
            O que eles têm em comum: usaram o Mapa e nunca voltaram ao modo anterior.
          </p>
        </div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white/[0.04] border border-white/[0.07] rounded-3xl p-7 hover:bg-white/[0.07] transition-colors group">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-sm">★</span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="size-10 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                  style={{ background: `linear-gradient(135deg, ${t.color}40, ${t.color}20)`, border: `1px solid ${t.color}30` }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
