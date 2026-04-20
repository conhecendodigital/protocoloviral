import Link from 'next/link'
import {
  Anchor, ArrowRight, Bot, CheckCircle, Clapperboard,
  FileEdit, Flame, Lock, Shield, Star, TrendingUp, Video, Zap,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: 'Luiz Pabst',
    handle: '@luizpabst',
    text: 'Não para de chegar seguidores, absurdo... saí de 67 para 115 mil em 3 meses usando as estruturas.',
    result: '+48k seguidores',
    color: '#0ea5e9',
    avatar: 'LP',
  },
  {
    name: 'Arthur M.',
    handle: '@arthurm.ofic',
    text: 'Consegui vender 40K em mentoria usando os roteiros gerados pela IA. Simplesmente absurdo.',
    result: 'R$ 40k vendido',
    color: '#10b981',
    avatar: 'AM',
  },
  {
    name: 'Vanessa Reis',
    handle: '@vanessareis',
    text: 'Antes eu travava pra escrever roteiros. Agora estou produzindo vídeo novo todo dia, com consistência.',
    result: 'Conteúdo diário',
    color: '#8b5cf6',
    avatar: 'VR',
  },
  {
    name: 'Marcos T.',
    handle: '@marcostv_br',
    text: 'Em 3 semanas meu Reels saiu de 2 mil para 180 mil visualizações. A estrutura de gancho muda tudo.',
    result: '180k views',
    color: '#f59e0b',
    avatar: 'MT',
  },
]

const FEATURES = [
  {
    icon: Video,
    title: 'Analisador de Vídeos Virais',
    desc: 'Cole o link de qualquer Reels ou TikTok viral. A IA disseca gancho, ritmo, CTA e por que o algoritmo amou.',
    color: '#0ea5e9',
    hot: true,
  },
  {
    icon: FileEdit,
    title: 'Roteirista com IA',
    desc: 'Roteiros completos com gancho, desenvolvimento e CTA — na sua voz, prontos pra gravar em minutos.',
    color: '#8b5cf6',
    hot: true,
  },
  {
    icon: Anchor,
    title: '100 Ganchos Virais',
    desc: 'Banco de 100 templates de abertura testados e validados pelo mercado. Copie direto pro roteiro.',
    color: '#06b6d4',
    hot: false,
  },
  {
    icon: Clapperboard,
    title: 'Biblioteca de Formatos',
    desc: 'Formatos curados por desempenho — cada um com estrutura, gancho e exemplos prontos.',
    color: '#f59e0b',
    hot: false,
  },
  {
    icon: Bot,
    title: 'Agentes de IA Especializados',
    desc: 'Agentes treinados para posicionamento, bio, tom de voz e estratégia de conteúdo.',
    color: '#10b981',
    hot: false,
  },
  {
    icon: TrendingUp,
    title: 'Calculadora de Engajamento',
    desc: 'Compare suas métricas com os benchmarks do mercado e descubra o que ajustar.',
    color: '#ef4444',
    hot: false,
  },
]

const PLANS = [
  {
    id: 'mensal',
    label: 'Mensal',
    price: 'R$ 97',
    period: '/mês',
    badge: 'Sem compromisso',
    highlight: false,
    perDay: 'R$ 3,23 por dia',
    cta: 'Começar agora',
    ctaHref: '/login?plan=mensal&mode=signup',
  },
  {
    id: 'trimestral',
    label: 'Trimestral',
    price: 'R$ 197',
    period: '/3 meses',
    badge: 'Economize 32%',
    highlight: false,
    perDay: 'R$ 2,19 por dia',
    cta: 'Quero o trimestral',
    ctaHref: '/login?plan=trimestral&mode=signup',
  },
  {
    id: 'semestral',
    label: 'Semestral',
    price: 'R$ 297',
    period: '/6 meses',
    badge: 'Melhor valor',
    highlight: true,
    perDay: 'R$ 1,65 por dia',
    saving: 'Você economiza 49%',
    cta: 'Quero o melhor plano',
    ctaHref: '/login?plan=semestral&mode=signup',
  },
]

const PLAN_FEATURES = [
  'Roteirista com IA ilimitado',
  'Banco de 100 ganchos virais',
  'Analisador de vídeos virais',
  'Biblioteca de formatos',
  'Agentes IA especializados',
  'Calculadora de engajamento',
  'Suporte dedicado',
]

const STEPS = [
  {
    n: '01',
    icon: Video,
    title: 'Analise o que já funciona',
    desc: 'Cole o link de um vídeo viral e a IA desvenda a estrutura exata que fez ele explodir.',
    color: '#0ea5e9',
  },
  {
    n: '02',
    icon: FileEdit,
    title: 'Gere seu roteiro',
    desc: 'A IA cria ganchos, desenvolvimento e CTA validados pelo mercado — mas com a sua voz.',
    color: '#8b5cf6',
  },
  {
    n: '03',
    icon: TrendingUp,
    title: 'Poste e multiplique',
    desc: 'Publique com consistência. Conteúdo estruturado todo dia faz o algoritmo trabalhar por você.',
    color: '#10b981',
  },
]

const BEFORE_AFTER = [
  { before: 'Fica olhando para a tela sem saber o que falar', after: 'Roteiro completo em menos de 3 minutos com IA' },
  { before: 'Copia o que viu funcionar pra outra pessoa', after: 'Estrutura adaptada para sua voz e seu nicho' },
  { before: 'Vídeos que não chegam em ninguém novo', after: 'Ganchos validados que prendem nos primeiros 3 segundos' },
  { before: 'Fica meses sem consistência no conteúdo', after: 'Conteúdo novo todo dia sem travar' },
]

const STATS = [
  { value: '1.400+', label: 'Roteiros gerados' },
  { value: '430+',   label: 'Vídeos analisados' },
  { value: '500+',   label: 'Criadores ativos' },
  { value: '100+',   label: 'Ganchos virais' },
]

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050810] text-slate-900 dark:text-white overflow-x-hidden">

      {/* ══ NAV ══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#050810]/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 bg-gradient-to-br from-[#0ea5e9] to-[#6d28d9] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#0ea5e9]/30">
              <Zap size={15} />
            </div>
            <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white">Mapa do Engajamento</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-colors">
              Entrar
            </Link>
            <Link href="/login" className="px-4 py-2 rounded-xl text-sm font-black text-white bg-gradient-to-r from-[#0ea5e9] to-[#6d28d9] shadow-lg shadow-[#0ea5e9]/20 hover:opacity-90 transition-opacity">
              Começar grátis →
            </Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="relative pt-36 pb-24 px-5 sm:px-8 overflow-hidden">
        {/* BG glows */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0ea5e9]/10 to-transparent rounded-full blur-[100px]" />
        </div>
        <div className="pointer-events-none absolute top-32 right-0 w-[400px] h-[400px] bg-violet-500/8 rounded-full blur-[80px]" />

        <div className="relative max-w-4xl mx-auto text-center">

          {/* Social proof badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/[0.07] border border-slate-200 dark:border-white/10 mb-8">
            <div className="flex -space-x-1.5">
              {['LP','AM','VR'].map(i => (
                <div key={i} className="size-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border-2 border-white dark:border-[#050810] flex items-center justify-center text-[8px] font-black text-white">{i[0]}</div>
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-white/70">+500 criadores já usam</span>
            <div className="flex gap-0.5 ml-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-amber-400 text-amber-400" />)}
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.0] mb-6">
            <span className="text-slate-900 dark:text-white">Roube a fórmula dos</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-[#0ea5e9] to-violet-500">
              vídeos que viralizam
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 dark:text-white/55 max-w-xl mx-auto mb-10 leading-relaxed">
            Analise vídeos virais com IA, descubra o que funciona e gere
            roteiros prontos — na sua voz, em minutos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-black text-white bg-gradient-to-r from-[#0ea5e9] to-[#6d28d9] shadow-2xl shadow-[#0ea5e9]/30 hover:shadow-[#0ea5e9]/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Começar agora — é grátis
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="#planos" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/80 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
              Ver planos
            </Link>
          </div>

          {/* Stats */}
          <div className="inline-flex flex-wrap justify-center divide-x divide-slate-200 dark:divide-white/10 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/8 rounded-2xl overflow-hidden shadow-sm">
            {STATS.map(s => (
              <div key={s.label} className="px-6 py-4 flex flex-col items-center">
                <span className="text-xl font-black text-slate-900 dark:text-white">{s.value}</span>
                <span className="text-[11px] text-slate-400 dark:text-white/35 font-medium mt-0.5 whitespace-nowrap">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ANTES vs DEPOIS ══ */}
      <section className="py-20 px-5 sm:px-8 bg-slate-50 dark:bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#0ea5e9] text-xs font-black uppercase tracking-widest mb-3">A transformação</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Pare de adivinhar. Comece a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">criar com estratégia</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-3xl p-6 bg-red-50 dark:bg-red-500/[0.06] border border-red-200 dark:border-red-500/20">
              <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px]">✕</span>
                Sem o Mapa do Engajamento
              </p>
              <ul className="space-y-3">
                {BEFORE_AFTER.map(b => (
                  <li key={b.before} className="flex items-start gap-3 text-sm text-slate-600 dark:text-white/60">
                    <span className="text-red-400 shrink-0 mt-0.5">✕</span>
                    {b.before}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl p-6 bg-emerald-50 dark:bg-emerald-500/[0.06] border border-emerald-200 dark:border-emerald-500/20">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px]">✓</span>
                Com o Mapa do Engajamento
              </p>
              <ul className="space-y-3">
                {BEFORE_AFTER.map(b => (
                  <li key={b.after} className="flex items-start gap-3 text-sm text-slate-700 dark:text-white/80 font-medium">
                    <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    {b.after}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══ COMO FUNCIONA ══ */}
      <section className="py-20 px-5 sm:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0284c7] via-[#0ea5e9] to-[#7c3aed]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-900/30 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-cyan-200 text-xs font-black uppercase tracking-widest mb-3">Como funciona</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Três passos. Conteúdo que converte.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={step.n} className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-7 border border-white/15 hover:bg-white/15 transition-colors">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                      <Icon size={18} className="text-white" />
                    </div>
                    <span className="text-4xl font-black text-white/15 leading-none">{step.n}</span>
                  </div>
                  <h3 className="text-lg font-black text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-blue-100/75 leading-relaxed">{step.desc}</p>
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 items-center justify-center">
                      <ArrowRight size={16} className="text-white/30" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-10 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-black bg-white text-[#0ea5e9] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
              Quero testar agora <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className="py-20 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#0ea5e9] text-xs font-black uppercase tracking-widest mb-3">Ferramentas</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Tudo que você precisa para{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">crescer no digital</span>
            </h2>
            <p className="text-slate-500 dark:text-white/45 text-base max-w-lg mx-auto">
              Cada ferramenta resolve um problema real que criadores enfrentam todo dia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className={`group relative rounded-3xl p-6 border transition-all ${
                    f.hot
                      ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-white/10 dark:from-white/[0.07] dark:to-white/[0.03] dark:border-white/10'
                      : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/8 hover:border-slate-300 dark:hover:border-white/15 hover:shadow-lg dark:hover:shadow-none'
                  }`}
                >
                  {f.hot && (
                    <span className="absolute top-4 right-4 text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                      Popular
                    </span>
                  )}
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${f.color}20`, color: f.color }}>
                    <Icon size={22} />
                  </div>
                  <h3 className={`text-base font-black mb-2 ${f.hot ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{f.title}</h3>
                  <p className={`text-sm leading-relaxed ${f.hot ? 'text-white/60' : 'text-slate-500 dark:text-white/45'}`}>{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ DEPOIMENTOS ══ */}
      <section className="py-20 px-5 sm:px-8 bg-slate-50 dark:bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#0ea5e9] text-xs font-black uppercase tracking-widest mb-3">Resultados reais</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Criadores que já estão crescendo
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white dark:bg-white/[0.05] rounded-3xl p-5 border border-slate-200 dark:border-white/8 flex flex-col gap-4 hover:shadow-md dark:hover:shadow-none hover:border-slate-300 dark:hover:border-white/15 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ backgroundColor: `${t.color}15`, color: t.color }}>
                    {t.result}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-white/75 leading-relaxed flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-white/5">
                  <div className="size-8 rounded-full bg-gradient-to-br from-[#0ea5e9] to-violet-600 flex items-center justify-center text-[11px] font-black text-white shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{t.name}</p>
                    <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">{t.handle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PLANOS ══ */}
      <section id="planos" className="py-20 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#0ea5e9] text-xs font-black uppercase tracking-widest mb-3">Planos</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              Invista menos que um café por dia
            </h2>
            <p className="text-slate-500 dark:text-white/45 text-base">Sem contrato. Cancele quando quiser.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start mb-8">
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className={`relative rounded-3xl border flex flex-col transition-all ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-[#0ea5e9] to-[#0369a1] border-[#0ea5e9] shadow-2xl shadow-[#0ea5e9]/25 md:-mt-4'
                    : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/10'
                }`}
              >
                {plan.saving && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black px-3 py-1.5 rounded-full bg-amber-400 text-slate-900 shadow-lg">
                      <Flame size={11} /> {plan.saving}
                    </span>
                  </div>
                )}

                <div className={`p-6 rounded-t-3xl ${plan.highlight ? '' : ''}`}>
                  <span className={`inline-block text-[11px] font-black px-2.5 py-1 rounded-full mb-4 ${
                    plan.highlight ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/50'
                  }`}>
                    {plan.badge}
                  </span>
                  <p className={`text-sm font-bold mb-1 ${plan.highlight ? 'text-blue-100' : 'text-slate-500 dark:text-white/50'}`}>{plan.label}</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.price}</span>
                    <span className={`text-sm pb-1.5 ${plan.highlight ? 'text-blue-100' : 'text-slate-400 dark:text-white/35'}`}>{plan.period}</span>
                  </div>
                  <p className={`text-xs font-bold ${plan.highlight ? 'text-blue-100/80' : 'text-slate-400 dark:text-white/30'}`}>
                    💡 {plan.perDay}
                  </p>
                </div>

                <div className={`px-6 pb-6 flex-1 flex flex-col ${plan.highlight ? 'border-t border-white/20' : 'border-t border-slate-100 dark:border-white/5'}`}>
                  <ul className="space-y-2.5 py-5 flex-1">
                    {PLAN_FEATURES.map(f => (
                      <li key={f} className={`flex items-center gap-2.5 text-xs ${plan.highlight ? 'text-blue-50' : 'text-slate-600 dark:text-white/65'}`}>
                        <CheckCircle size={14} className={plan.highlight ? 'text-cyan-200 shrink-0' : 'text-emerald-500 shrink-0'} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.ctaHref}
                    className={`block w-full py-3.5 rounded-2xl text-sm font-black text-center transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      plan.highlight
                        ? 'bg-white text-[#0ea5e9] shadow-xl'
                        : 'bg-gradient-to-r from-[#0ea5e9] to-[#6d28d9] text-white shadow-lg shadow-[#0ea5e9]/20'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Garantias */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 dark:text-white/30">
            <span className="flex items-center gap-1.5"><Shield size={13} className="text-emerald-500" /> Garantia de 7 dias</span>
            <span className="flex items-center gap-1.5"><Lock size={13} className="text-[#0ea5e9]" /> Pagamento seguro via Hotmart</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={13} className="text-violet-500" /> Acesso imediato</span>
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section className="py-24 px-5 sm:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0284c7] via-[#0ea5e9] to-[#7c3aed]" />
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] bg-violet-900/40 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-bold text-white/90">Acesso imediato ao criar conta</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-5">
            Pronto para criar conteúdo
            <br />que realmente vende?
          </h2>
          <p className="text-blue-100/80 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Mais de 500 criadores já usam o Mapa do Engajamento para crescer mais rápido,
            com mais consistência e muito menos esforço.
          </p>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl text-base font-black bg-white text-[#0ea5e9] shadow-2xl hover:scale-[1.03] active:scale-[0.98] transition-transform"
          >
            Criar minha conta grátis <ArrowRight size={18} />
          </Link>
          <p className="text-blue-200/50 text-xs mt-5 font-medium">Sem cartão de crédito necessário</p>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="py-8 px-5 sm:px-8 border-t border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#050810]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="size-7 bg-gradient-to-br from-[#0ea5e9] to-[#6d28d9] rounded-lg flex items-center justify-center">
              <Zap size={13} className="text-white" />
            </div>
            <span className="text-sm font-black text-slate-700 dark:text-white/70">Mapa do Engajamento</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-white/25">© 2025 Mapa do Engajamento · Todos os direitos reservados</p>
          <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-white/25">
            <Link href="/login" className="hover:text-slate-700 dark:hover:text-white/60 transition-colors">Entrar</Link>
            <span>·</span>
            <a href="mailto:suporte@protocoloviral.com.br" className="hover:text-slate-700 dark:hover:text-white/60 transition-colors">Suporte</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
