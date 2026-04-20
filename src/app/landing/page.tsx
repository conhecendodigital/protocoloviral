import Link from 'next/link'
import {
  Anchor, ArrowRight, Bot, CheckCircle, Clapperboard,
  FileEdit, Star, TrendingUp, Video, Zap,
} from 'lucide-react'

/* ── Depoimentos ── */
const TESTIMONIALS = [
  {
    name: 'Luiz Pabst',
    handle: '@luizpabst',
    text: 'Não para de chegar seguidores, absurdo... saí de 67 para 115 mil.',
    result: '+48k seguidores',
    color: '#0ea5e9',
  },
  {
    name: 'Arthur M.',
    handle: '@arthurm',
    text: 'Consegui vender 40K em mentoria usando os roteiros da IA. Obrigado!',
    result: '40K em vendas',
    color: '#10b981',
  },
  {
    name: 'Vanessa R.',
    handle: '@vanessareis',
    text: 'Antes eu travava pra escrever os roteiros, agora estou produzindo vídeo novo todo dia.',
    result: 'Conteúdo diário',
    color: '#8b5cf6',
  },
  {
    name: 'Marcos T.',
    handle: '@marcostv',
    text: 'Em 3 semanas meu Reels passou de 2 mil para 180 mil visualizações. A estrutura funciona.',
    result: '180k views',
    color: '#f59e0b',
  },
]

/* ── Features ── */
const FEATURES = [
  {
    icon: Video,
    title: 'Analisador de Vídeos Virais',
    desc: 'Cole o link de qualquer Reels ou TikTok que bombou e a IA disseca a estrutura: gancho, ritmo, CTA e por que o algoritmo amou.',
    color: '#0ea5e9',
  },
  {
    icon: FileEdit,
    title: 'Roteirista com IA',
    desc: 'Gera roteiros completos na sua voz com gancho validado, desenvolvimento e CTA — prontos pra gravar em minutos.',
    color: '#8b5cf6',
  },
  {
    icon: Anchor,
    title: '100 Ganchos Virais',
    desc: 'Banco de 100 templates de abertura testados e validados pelo mercado. Categorize por tipo e copie diretamente pro roteiro.',
    color: '#06b6d4',
  },
  {
    icon: Clapperboard,
    title: 'Biblioteca de Formatos',
    desc: 'Escolha entre dezenas de formatos de conteúdo analisados por desempenho. Cada formato tem estrutura, gancho e exemplos.',
    color: '#f59e0b',
  },
  {
    icon: Bot,
    title: 'Escritório de Agentes IA',
    desc: 'Agentes especializados em posicionamento, bio, tom de voz e estratégia. Cada um treinado para uma função específica.',
    color: '#10b981',
  },
  {
    icon: TrendingUp,
    title: 'Calculadora de Engajamento',
    desc: 'Descubra o potencial real de cada formato e compare as suas métricas com os benchmarks do mercado.',
    color: '#ef4444',
  },
]

/* ── Planos ── */
const PLANS = [
  {
    id: 'mensal',
    label: 'Mensal',
    price: 'R$ 97',
    period: '/mês',
    badge: 'Sem compromisso',
    badgeColor: '#64748b',
    highlight: false,
    perDay: 'R$ 3,23/dia',
    cta: 'Começar agora',
  },
  {
    id: 'trimestral',
    label: 'Trimestral',
    price: 'R$ 197',
    period: '/3 meses',
    badge: 'Economize 32%',
    badgeColor: '#0ea5e9',
    highlight: false,
    perDay: 'R$ 2,19/dia',
    cta: 'Escolher trimestral',
  },
  {
    id: 'semestral',
    label: 'Semestral',
    price: 'R$ 297',
    period: '/6 meses',
    badge: '🔥 Melhor custo-benefício',
    badgeColor: '#f59e0b',
    highlight: true,
    perDay: 'R$ 1,65/dia',
    saving: 'Economize 49%',
    cta: 'Quero o melhor plano',
  },
]

const PLAN_FEATURES = [
  'Roteirista com IA ilimitado',
  'Banco de 100 ganchos virais',
  'Analisador de vídeos virais',
  'Biblioteca de formatos',
  'Escritório de agentes IA',
  'Calculadora de engajamento',
  'Suporte por e-mail',
]

/* ── Steps ── */
const STEPS = [
  {
    n: '01',
    icon: Video,
    title: 'Analise o que já funciona',
    desc: 'Cole o link de um Reels ou TikTok viral e deixe a IA dissecar a estrutura que fez o vídeo explodir.',
    color: '#0ea5e9',
  },
  {
    n: '02',
    icon: FileEdit,
    title: 'Gere seu roteiro',
    desc: 'A IA cria ganchos, corpo e CTA baseado em estruturas validadas pelo mercado, mas com a sua voz.',
    color: '#8b5cf6',
  },
  {
    n: '03',
    icon: TrendingUp,
    title: 'Poste e multiplique',
    desc: 'Publique no seu ritmo. Com conteúdo estruturado todos os dias, o algoritmo trabalha por você.',
    color: '#10b981',
  },
]

const STATS = [
  { value: '1.400+', label: 'Roteiros gerados' },
  { value: '430+',   label: 'Vídeos analisados' },
  { value: '500+',   label: 'Criadores ativos' },
  { value: '100+',   label: 'Ganchos virais' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 bg-[#0ea5e9] rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#0ea5e9]/30">
              <Zap size={16} />
            </div>
            <span className="font-black text-sm tracking-tight">Protocolo Viral</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors hidden sm:block">
              Entrar
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-sm font-bold text-white shimmer-btn shadow-lg shadow-[#0ea5e9]/20"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 px-4 sm:px-6 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#0ea5e9]/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9] animate-pulse" />
            <span className="text-xs font-bold text-[#0ea5e9] tracking-wide">Usado por +500 criadores brasileiros</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.0] mb-6 text-slate-900 dark:text-white">
            Roube a fórmula dos{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600">
              vídeos que viralizam
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Analise qualquer vídeo viral, descubra o que funciona e gere roteiros
            prontos com IA — tudo com a sua voz e estilo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-black text-white shimmer-btn shadow-xl shadow-[#0ea5e9]/30 hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Começar agora <ArrowRight size={18} />
            </Link>
            <Link
              href="#planos"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/80 hover:border-slate-300 dark:hover:border-white/20 transition-all"
            >
              Ver planos
            </Link>
          </div>

          {/* Stats bar */}
          <div className="inline-flex flex-wrap justify-center gap-8 sm:gap-12 px-8 py-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
            {STATS.map(s => (
              <div key={s.label} className="flex flex-col items-center gap-0.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</span>
                <span className="text-xs text-slate-500 dark:text-white/40 font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="py-20 px-4 sm:px-6 bg-[#0ea5e9] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0284c7] to-[#6d28d9] opacity-90" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-3">Como funciona</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Três passos. Conteúdo que converte.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={step.n} className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-10 -right-3 z-10">
                      <ArrowRight size={20} className="text-white/40" />
                    </div>
                  )}
                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-4">
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className="text-5xl font-black text-white/10 absolute top-4 right-5">{step.n}</span>
                  <h3 className="text-lg font-black text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-blue-100/80 leading-relaxed">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#0ea5e9] text-xs font-black uppercase tracking-widest mb-3">Ferramentas</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
              Tudo que você precisa para{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">crescer no digital</span>
            </h2>
            <p className="text-slate-500 dark:text-white/50 text-base max-w-xl mx-auto">
              Cada ferramenta foi construída para resolver um problema real de criadores de conteúdo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="group bg-white dark:bg-white/[0.03] rounded-3xl p-6 border border-slate-200 dark:border-white/8 hover:border-slate-300 dark:hover:border-white/15 transition-all hover:shadow-lg dark:hover:shadow-none"
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${f.color}15`, color: f.color }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-white/45 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section className="py-20 px-4 sm:px-6 bg-slate-100 dark:bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#0ea5e9] text-xs font-black uppercase tracking-widest mb-3">Resultados reais</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Criadores que já estão crescendo
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-white dark:bg-white/[0.04] rounded-3xl p-5 border border-slate-200 dark:border-white/8 flex flex-col gap-4"
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 dark:text-white/80 leading-relaxed flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-400 dark:text-white/30">{t.handle}</p>
                  </div>
                  <span
                    className="text-xs font-black px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: `${t.color}15`, color: t.color }}
                  >
                    {t.result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#0ea5e9] text-xs font-black uppercase tracking-widest mb-3">Planos</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
              Invista menos que um café por dia
            </h2>
            <p className="text-slate-500 dark:text-white/50 text-base">
              Sem pegadinhas. Cancele quando quiser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 border flex flex-col transition-all ${
                  plan.highlight
                    ? 'bg-[#0ea5e9] border-[#0ea5e9] shadow-2xl shadow-[#0ea5e9]/20 scale-[1.02]'
                    : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                {plan.saving && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-black px-3 py-1 rounded-full bg-amber-400 text-slate-900">
                    {plan.saving}
                  </span>
                )}
                <span
                  className={`self-start text-[11px] font-black px-2.5 py-1 rounded-full mb-5 ${
                    plan.highlight
                      ? 'bg-white/20 text-white'
                      : 'text-slate-500 dark:text-white/50 bg-slate-100 dark:bg-white/5'
                  }`}
                >
                  {plan.badge}
                </span>

                <p className={`text-sm font-bold mb-1 ${plan.highlight ? 'text-blue-100' : 'text-slate-600 dark:text-white/50'}`}>
                  {plan.label}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm pb-1 ${plan.highlight ? 'text-blue-100' : 'text-slate-500 dark:text-white/40'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-xs font-bold mb-6 ${plan.highlight ? 'text-blue-100' : 'text-slate-400 dark:text-white/30'}`}>
                  💡 {plan.perDay}
                </p>

                <ul className="space-y-2 mb-8 flex-1">
                  {PLAN_FEATURES.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-xs ${plan.highlight ? 'text-blue-50' : 'text-slate-600 dark:text-white/60'}`}>
                      <CheckCircle size={14} className={plan.highlight ? 'text-white' : 'text-emerald-500'} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className={`w-full py-3.5 rounded-2xl text-sm font-black text-center transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    plan.highlight
                      ? 'bg-white text-[#0ea5e9] shadow-lg'
                      : 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-400 dark:text-white/25 font-medium">
            Pagamento seguro via Hotmart · Acesso imediato · Garantia de 7 dias
          </p>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-20 px-4 sm:px-6 bg-[#0ea5e9] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0284c7] to-[#6d28d9]" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-violet-500/20 rounded-full blur-[80px]" />

        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Pronto para criar conteúdo que vende?
          </h2>
          <p className="text-blue-100 text-lg mb-10 leading-relaxed">
            Junte-se a centenas de criadores que já estão usando IA para crescer mais rápido,
            com menos esforço e mais resultado.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-black bg-white text-[#0ea5e9] shadow-2xl hover:scale-[1.03] active:scale-[0.98] transition-transform"
          >
            Criar minha conta grátis <ArrowRight size={18} />
          </Link>
          <p className="text-blue-200/60 text-xs mt-5">Sem cartão de crédito para começar</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-4 sm:px-6 border-t border-slate-200 dark:border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="size-7 bg-[#0ea5e9] rounded-lg flex items-center justify-center">
              <Zap size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-white/70">Protocolo Viral</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-white/25 text-center">
            © 2025 Protocolo Viral · Todos os direitos reservados
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-white/25">
            <Link href="/login" className="hover:text-slate-600 dark:hover:text-white/60 transition-colors">Entrar</Link>
            <span>·</span>
            <a href="mailto:suporte@protocoloviral.com.br" className="hover:text-slate-600 dark:hover:text-white/60 transition-colors">Suporte</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
