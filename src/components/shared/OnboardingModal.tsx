'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PROFILE_FIELDS } from '@/types/profile'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ArrowRight, Brain, Check, CheckCircle, Hand, RefreshCw, Sparkles } from 'lucide-react'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

interface OnboardingModalProps {
  userId: string
  onComplete: () => void
  updateField: (field: string, value: string) => void
}

const SECTION_LABELS: Record<string, { icon: string; label: string; color: string }> = {
  sobre: { icon: 'person', label: 'Sobre Você', color: '#0ea5e9' },
  publico: { icon: 'groups', label: 'Seu Público', color: '#8b5cf6' },
  objetivos: { icon: 'rocket_launch', label: 'Seus Objetivos', color: '#10b981' },
}
// ── Opções estáticas para campos genéricos
const OPTIONS_STATIC: Record<string, { emoji: string; label: string; desc: string; value: string }[]> = {
  resultado: [
    { emoji: '📱', label: '10k+ seguidores', desc: 'Cresci de 0 para mais de 10 mil seguidores', value: 'Cresci de 0 para mais de 10 mil seguidores' },
    { emoji: '💰', label: 'Primeiros clientes', desc: 'Fechei os primeiros clientes pelas redes', value: 'Fechei meus primeiros clientes pelas redes sociais' },
    { emoji: '🏆', label: 'Virei referência', desc: 'Me tornei referência reconhecida no nicho', value: 'Me tornei referência no meu nicho local' },
    { emoji: '🚀', label: 'Largue o emprego', desc: 'Vivo 100% do meu negócio online', value: 'Consegui viver 100% do meu negócio online' },
    { emoji: '🌱', label: 'Ainda construindo', desc: 'Estou dando os primeiros passos agora', value: 'Ainda estou construindo meus primeiros resultados' },
  ],
  publico: [
    { emoji: '🎯', label: 'Iniciantes', desc: 'Pessoas começando completamente do zero', value: 'Iniciantes que estão começando do zero' },
    { emoji: '📈', label: 'Intermediários', desc: 'Estagnados no meio, não conseguem escalar', value: 'Pessoas no nível intermediário que não conseguem escalar' },
    { emoji: '👩‍👧', label: 'Mães sem tempo', desc: 'Mães ou quem tem rotina corrida', value: 'Mães ou pessoas com rotina corrida e pouco tempo livre' },
    { emoji: '💼', label: 'Empreendedores', desc: 'Donos de negócio buscando mais clientes', value: 'Empreendedores e donos de negócio que querem mais clientes' },
    { emoji: '🔄', label: 'Transição de carreira', desc: 'Profissionais mudando de área', value: 'Profissionais buscando transição de carreira' },
    { emoji: '🏥', label: 'Liberal / especialista', desc: 'Médico, advogado, coach, consultor...', value: 'Profissionais liberais que querem atrair clientes pelo digital' },
  ],
  dor: [
    { emoji: '🤯', label: 'Overdose de info', desc: 'Consome muito, mas não executa nada', value: 'Consome muito conteúdo mas não consegue colocar em prática' },
    { emoji: '⏳', label: 'Falta de tempo', desc: 'Rotina intensa impede a consistência', value: 'Falta de tempo e consistência para criar conteúdo' },
    { emoji: '📉', label: 'Sem vendas', desc: 'Seguidores que nunca compram nada', value: 'Não sabe como transformar seguidores em clientes pagantes' },
    { emoji: '😨', label: 'Medo de aparecer', desc: 'Vergonha e medo do julgamento alheio', value: 'Medo de se expor e ser julgado pelas pessoas que conhece' },
    { emoji: '😵', label: 'Sem direção', desc: 'Perdido, sem saber o próximo passo', value: 'Perdido, sem saber qual o próximo passo concreto' },
  ],
  tentou: [
    { emoji: '📚', label: 'Cursos teóricos', desc: 'Comprou, empolgou, parou no meio', value: 'Comprou cursos, começou empolgado e parou no meio' },
    { emoji: '🗓️', label: 'Métodos antigos', desc: 'Estratégias que não funcionam mais', value: 'Tentou métodos que já não funcionam mais no algoritmo atual' },
    { emoji: '📺', label: 'Conteúdo gratuito', desc: 'YouTube e redes sem resultado concreto', value: 'Consumiu muito conteúdo gratuito no YouTube sem resultado concreto' },
    { emoji: '🏢', label: 'Agência / terceiros', desc: 'Pagou profissional e não teve retorno', value: 'Pagou agência ou freelancer e não teve retorno' },
  ],
  proposito: [
    { emoji: '🛒', label: 'Vender produto', desc: 'Produto ou serviço pelas redes sociais', value: 'Vender meu produto ou serviço pelas redes sociais' },
    { emoji: '🎓', label: 'Lançar curso', desc: 'Curso ou mentoria online', value: 'Lançar um curso ou mentoria online' },
    { emoji: '📞', label: 'Atrair clientes', desc: 'Clientes para negócio físico ou online', value: 'Atrair novos clientes para meu negócio físico ou online' },
    { emoji: '👑', label: 'Construir autoridade', desc: 'Ser referência e ganhar reconhecimento', value: 'Construir autoridade e reconhecimento no meu nicho' },
    { emoji: '🌱', label: 'Audiência + renda futura', desc: 'Crescer audiência e monetizar depois', value: 'Crescer uma audiência e monetizar no futuro' },
  ],
  receio: [
    { emoji: '🎥', label: 'Vergonha da câmera', desc: 'Fico travado(a) na frente da câmera', value: 'Sinto vergonha de aparecer na câmera' },
    { emoji: '👀', label: 'Medo de julgamento', desc: 'O que pessoas próximas vão achar', value: 'Medo de ser julgado(a) pelas pessoas que me conhecem' },
    { emoji: '🤔', label: 'Não sei o que falar', desc: 'Não tenho clareza do que comunicar', value: 'Não sei o que falar nem como me comunicar nos vídeos' },
    { emoji: '📅', label: 'Consistência', desc: 'Começo e não consigo manter o ritmo', value: 'Medo de começar e não conseguir manter a consistência' },
    { emoji: '✅', label: 'Nenhum receio', desc: 'Estou pronto(a), só quero melhorar', value: 'Não tenho receios, quero apenas melhorar meu conteúdo' },
  ],
  tempo: [
    { emoji: '⚡', label: '15 a 30 min', desc: 'Poucos minutos por dia', value: '15 a 30 minutos por dia' },
    { emoji: '🕐', label: '1 hora/dia', desc: 'Uma hora bem focada por dia', value: 'Cerca de 1 hora por dia' },
    { emoji: '🕑', label: '2 horas/dia', desc: 'Bom tempo para criar com calma', value: 'Cerca de 2 horas por dia' },
    { emoji: '📅', label: 'Fins de semana', desc: 'Só tenho tempo livre no final de semana', value: 'Apenas nos finais de semana' },
    { emoji: '🔥', label: 'Full time (3h+)', desc: 'Dedicado(a) de verdade nisso', value: 'Mais de 3 horas por dia, estou 100% focado nisso' },
  ],
  naoquer: [
    { emoji: '🚫', label: 'Política e religião', desc: 'Esses temas ficam fora do meu conteúdo', value: 'Política e religião' },
    { emoji: '💊', label: 'Promessas milagrosas', desc: 'Não vendo ilusão de dinheiro fácil', value: 'Promessas de dinheiro fácil ou resultado sem esforço' },
    { emoji: '🔒', label: 'Vida pessoal / família', desc: 'Minha vida privada fica fora da internet', value: 'Expor minha vida pessoal ou minha família' },
    { emoji: '🥊', label: 'Atacar concorrentes', desc: 'Não entro em brigas ou polêmicas', value: 'Atacar concorrentes ou me envolver em polêmicas' },
    { emoji: '✅', label: 'Sem restrições', desc: 'Faço o que precisar para crescer', value: 'Não tenho restrições, falo o que precisar' },
  ],
}

// ── Opções dinâmicas por nicho — adapta publico, dor e resultado
function getDynamicOptions(fieldId: string, nicho: string): { emoji: string; label: string; desc: string; value: string }[] | null {
  const n = nicho.toLowerCase()

  // Nicho: Fitness / Saúde / Emagrecimento
  if (n.match(/fit|saúde|saude|emagre|nutri|treino|academia|corpo|magr/)) {
    if (fieldId === 'publico') return [
      { emoji: '🏋️', label: 'Sedentários', desc: 'Quem quer começar mas não sabe por onde', value: 'Pessoas sedentárias que querem começar a se exercitar mas não sabem por onde começar' },
      { emoji: '🍽️', label: 'Quem quer emagrecer', desc: 'Buscam emagrecimento saudável e definitivo', value: 'Pessoas que querem emagrecer de forma saudável e definitiva' },
      { emoji: '💪', label: 'Iniciantes na academia', desc: 'Começaram mas estão perdidos nos treinos', value: 'Iniciantes na academia que estão perdidos nos treinos e alimentação' },
      { emoji: '👩', label: 'Mulheres 30-50 anos', desc: 'Querem qualidade de vida e autoestima', value: 'Mulheres entre 30 e 50 anos buscando qualidade de vida e autoestima' },
      { emoji: '🏃', label: 'Atletas amadores', desc: 'Querem melhorar performance esportiva', value: 'Atletas amadores que querem melhorar performance e evitar lesões' },
    ]
    if (fieldId === 'dor') return [
      { emoji: '🔄', label: 'Efeito sanfona', desc: 'Perde e engorda, não consegue manter', value: 'Sofre com o efeito sanfona, sempre voltando ao peso inicial' },
      { emoji: '⏰', label: 'Sem tempo para treinar', desc: 'Rotina intensa, sem conseguir ser consistente', value: 'Não consegue ser consistente por falta de tempo na rotina' },
      { emoji: '🍕', label: 'Ansiedade e comida', desc: 'Come por emoção, sabota a dieta', value: 'Come por ansiedade e sabota a própria dieta constantemente' },
      { emoji: '😔', label: 'Baixa autoestima', desc: 'Vergonha do próprio corpo', value: 'Tem vergonha do próprio corpo e baixa autoestima' },
      { emoji: '💸', label: 'Gastou com soluções', desc: 'Remédios, dietas milagrosas sem resultado', value: 'Já gastou muito dinheiro com dietas milagrosas e remédios sem resultado' },
    ]
  }

  // Nicho: Finanças / Investimentos / Renda extra
  if (n.match(/finan|invest|renda|dinheiro|econom|aposentad|bolsa|cripto|patrimônio/)) {
    if (fieldId === 'publico') return [
      { emoji: '💳', label: 'Endividados', desc: 'Querem sair das dívidas e do vermelho', value: 'Pessoas endividadas que querem sair do vermelho e reorganizar as finanças' },
      { emoji: '📊', label: 'Iniciantes em investimentos', desc: 'Nunca investiram e não sabem começar', value: 'Pessoas que nunca investiram e não sabem por onde começar' },
      { emoji: '💼', label: 'Assalariados', desc: 'Querem renda extra além do salário', value: 'Assalariados que querem criar fontes de renda extra além do salário' },
      { emoji: '👨‍👩‍👧', label: 'Pais de família', desc: 'Querem segurança financeira para família', value: 'Pais de família buscando segurança financeira e futuro para os filhos' },
      { emoji: '🎓', label: 'Jovens adultos', desc: 'Começando a vida financeira do zero', value: 'Jovens adultos começando a construir o patrimônio do zero' },
    ]
    if (fieldId === 'dor') return [
      { emoji: '💸', label: 'Dinheiro some', desc: 'Sempre termina o mês no vermelho', value: 'O dinheiro some antes do fim do mês e não sabe para onde vai' },
      { emoji: '😱', label: 'Medo de investir', desc: 'Tem medo de perder o pouco que tem', value: 'Tem medo de perder dinheiro e não sabe em quem confiar para investir' },
      { emoji: '🏦', label: 'Sem reserva', desc: 'Qualquer imprevisto causa crise', value: 'Não tem reserva de emergência e qualquer imprevisto vira crise' },
      { emoji: '📉', label: 'Compras por impulso', desc: 'Gasta mais do que ganha consistentemente', value: 'Gasta por impulso e não consegue economizar mesmo querendo' },
      { emoji: '⏳', label: 'Aposentadoria incerta', desc: 'Não sabe se vai conseguir se aposentar', value: 'Não sabe se vai conseguir se aposentar com qualidade de vida' },
    ]
  }

  // Nicho: Marketing Digital / Redes Sociais / Infoprodutos
  if (n.match(/market|digital|redes|social|instagram|tiktok|youtube|content|criador|influenc|infoprod/)) {
    if (fieldId === 'publico') return [
      { emoji: '🏪', label: 'Negócios locais', desc: 'Lojas e serviços querendo mais clientes', value: 'Donos de negócios locais que querem usar o digital para atrair mais clientes' },
      { emoji: '🎓', label: 'Especialistas sem audiência', desc: 'Sabem muito mas ninguém conhece', value: 'Especialistas e profissionais que têm expertise mas não sabem se posicionar online' },
      { emoji: '💼', label: 'Autônomos e freelancers', desc: 'Querem clientes via redes sociais', value: 'Autônomos e freelancers que querem atrair clientes pelas redes sociais' },
      { emoji: '🌱', label: 'Iniciantes no digital', desc: 'Nunca criaram conteúdo antes', value: 'Pessoas que nunca criaram conteúdo e não sabem por onde começar' },
      { emoji: '🔄', label: 'Já criam mas sem resultado', desc: 'Postam mas não crescem nem vendem', value: 'Criadores que já postam há meses mas não conseguem crescer nem vender' },
    ]
    if (fieldId === 'dor') return [
      { emoji: '🤷', label: 'Não sabe o que postar', desc: 'Fica travado sem ideias de conteúdo', value: 'Fica travado sem saber o que postar e fica dias sem publicar' },
      { emoji: '👻', label: 'Vídeos sem views', desc: 'Produz mas ninguém assiste', value: 'Produz conteúdo mas os vídeos não chegam a ninguém' },
      { emoji: '📉', label: 'Seguidores que não compram', desc: 'Tem audiência mas zero vendas', value: 'Acumulou seguidores mas não consegue converter nenhum em cliente' },
      { emoji: '🔁', label: 'Sem consistência', desc: 'Para e começa, nunca mantém o ritmo', value: 'Começa motivado, para na segunda semana e recomeça do zero' },
      { emoji: '😵', label: 'Sem posicionamento', desc: 'Não sabe qual é seu diferencial', value: 'Não sabe qual é seu diferencial e se perde no meio de tantos criadores' },
    ]
  }

  // Nicho: Moda / Beleza / Estética / Lifestyle
  if (n.match(/moda|beleza|estet|look|make|maqu|fashion|style|lifestyle|pele|cabelo/)) {
    if (fieldId === 'publico') return [
      { emoji: '👗', label: 'Mulheres que querem se vestir bem', desc: 'Buscam estilo sem gastar muito', value: 'Mulheres que querem se vestir bem e com estilo sem gastar muito' },
      { emoji: '🪞', label: 'Quem quer transformar a autoestima', desc: 'Usam a beleza para ganhar confiança', value: 'Pessoas que buscam transformar a própria autoestima através da imagem' },
      { emoji: '📸', label: 'Quem quer aparecer online', desc: 'Querem criar conteúdo de moda/beleza', value: 'Pessoas que querem criar conteúdo de moda e beleza para as redes sociais' },
      { emoji: '💍', label: 'Mulheres 25-45', desc: 'Querem se vestir bem para o dia a dia', value: 'Mulheres entre 25 e 45 anos que querem se sentir bonitas no dia a dia' },
      { emoji: '💼', label: 'Profissionais que querem imagem', desc: 'Querem projetar autoridade pela aparência', value: 'Profissionais que querem projetar autoridade e confiança pela imagem pessoal' },
    ]
    if (fieldId === 'dor') return [
      { emoji: '🤷‍♀️', label: 'Não sabe se vestir', desc: 'Tem roupas mas não sabe combinar', value: 'Tem um guarda-roupa cheio mas não sabe montar looks bonitos' },
      { emoji: '💸', label: 'Gasta e não usa', desc: 'Compra por impulso e se arrepende', value: 'Gasta dinheiro em roupas por impulso mas nunca usa a maioria' },
      { emoji: '😔', label: 'Baixa autoestima visual', desc: 'Não gosta da própria imagem', value: 'Não gosta da própria imagem e evita aparecer em fotos e vídeos' },
      { emoji: '📏', label: 'Dificuldade com o corpo', desc: 'Não encontra roupas para o seu tipo físico', value: 'Tem dificuldade de encontrar roupas que valorizem seu tipo de corpo' },
      { emoji: '❓', label: 'Não sabe qual estilo é seu', desc: 'Perdida sem uma identidade visual clara', value: 'Não sabe qual é seu estilo e fica copiando tendências sem identidade própria' },
    ]
  }

  return null // usa opções padrão
}



export function OnboardingModal({ userId, onComplete, updateField }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(-1) // -1 = intro screen
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward
  const [isCompleting, setIsCompleting] = useState(false)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const supabase = useMemo(() => createClient(), [])
  const totalSteps = PROFILE_FIELDS.length
  const currentField = currentStep >= 0 ? PROFILE_FIELDS[currentStep] : null
  const progress = currentStep >= 0 ? ((currentStep + 1) / totalSteps) * 100 : 0

  const currentSection = currentField ? SECTION_LABELS[currentField.section] : null

  const handleAnswer = useCallback((value: string) => {
    if (!currentField) return
    setAnswers(prev => ({ ...prev, [currentField.id]: value }))
  }, [currentField])

  const handleNext = useCallback(async () => {
    if (!currentField) return
    // Save current answer
    const value = answers[currentField.id] || ''
    if (value.trim()) {
      updateField(currentField.id, value)
    }

    if (currentStep < totalSteps - 1) {
      setDirection(1)
      setCurrentStep(prev => prev + 1)
    } else {
      // Last step — save + generate insights
      setIsCompleting(true)
      if (value.trim()) updateField(currentField.id, value)

      // Build full profile from answers
      const fullProfile = { ...answers }
      if (value.trim()) fullProfile[currentField.id] = value

      // Mark onboarding as completed
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', userId)

      setShowSuccess(true)
      setIsGeneratingInsights(true)

      // Generate Clareza + Persona in background
      try {
        await fetch('/api/gerar-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: fullProfile }),
        })
      } catch (e) {
        console.error('[onboarding] gerar-insights failed:', e)
      } finally {
        setIsGeneratingInsights(false)
      }

      setTimeout(() => { onComplete() }, 2500)
    }
  }, [currentStep, totalSteps, currentField, answers, updateField, userId, supabase, onComplete])

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep(prev => prev - 1)
    } else if (currentStep === 0) {
      setDirection(-1)
      setCurrentStep(-1) // Go back to intro
    }
  }, [currentStep])

  const handleSkip = useCallback(async () => {
    if (currentStep < totalSteps - 1) {
      setDirection(1)
      setCurrentStep(prev => prev + 1)
    } else {
      setIsCompleting(true)
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', userId)
      setShowSuccess(true)
      setTimeout(() => {
        onComplete()
      }, 2500)
    }
  }, [currentStep, totalSteps, supabase, userId, onComplete])

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  }

  // Success screen
  if (showSuccess) {
    return (
      <div className="onboarding-overlay dark">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center text-center px-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="size-24 rounded-full bg-gradient-to-br from-emerald-400 to-[#0ea5e9] flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(16,185,129,0.4)]"
          >
            <CheckCircle size={48} className="text-[48px] text-slate-900 dark:text-white" />
          </motion.div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Perfil Completo!</h2>
          <p className="text-lg text-slate-800 dark:text-white/90 max-w-md">
            Estamos personalizando sua experiência com Inteligência Artificial.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 space-y-2 flex flex-col items-center"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-[#0ea5e9] uppercase tracking-widest">
              <Brain size={16} className="animate-pulse" />
              Gerando sua Clareza de Nicho...
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-violet-400 uppercase tracking-widest">
              <Sparkles size={16} className="animate-pulse" />
              Criando sua Persona de Público...
            </div>
            <p className="text-xs text-slate-600 dark:text-white/50 mt-2">Isso leva alguns segundos</p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // Intro welcome screen
  if (currentStep === -1) {
    return (
      <div className="onboarding-overlay dark">
        <div className="w-full max-w-2xl mx-auto px-6 flex flex-col items-center justify-center min-h-screen py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="size-20 bg-gradient-to-br from-[#0ea5e9] to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(14,165,233,0.3)]"
            >
              <Hand size={40} className="text-[40px] text-slate-900 dark:text-white" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
              Antes de começar,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">preciso te conhecer melhor!</span>
            </h2>

            <p className="text-base text-slate-800 dark:text-white/90 max-w-lg mx-auto mb-4 leading-relaxed">
              Vou te fazer algumas perguntas rápidas sobre você, seu público e seus objetivos.
            </p>

            <p className="text-base text-slate-800 dark:text-white/90 max-w-lg mx-auto mb-4 leading-relaxed">
              Essas respostas vão alimentar diretamente a <span className="font-bold text-slate-900 dark:text-white">Inteligência Artificial</span> que gera seus prompts, roteiros, ideias de conteúdo e estratégias de vendas.
            </p>

            <p className="text-sm text-slate-700 dark:text-white/90 max-w-lg mx-auto mb-10 leading-relaxed">
              Quanto mais detalhado você for, <span className="font-bold text-[#0ea5e9]">mais personalizados e poderosos</span> serão os conteúdos gerados para o seu nicho. Sem essas informações, a IA não tem contexto suficiente.
            </p>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => {
                setDirection(1)
                setCurrentStep(0)
              }}
              className="onboarding-next-btn inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-slate-900 dark:text-white font-bold text-base transition-all active:scale-[0.97]"
            >
              <span>Vamos começar</span>
              <ArrowRight size={20} className="text-xl" />
            </motion.button>

            <button
              onClick={onComplete}
              className="block mx-auto mt-6 text-sm font-medium text-slate-800 dark:text-white/90 hover:text-slate-800 dark:text-white/90 transition-colors"
            >
              Preencher depois
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  // Main question flow
  if (!currentField) return null

  return (
    <div className="onboarding-overlay dark">
      <div className="w-full max-w-2xl mx-auto px-6 flex flex-col items-center justify-center min-h-screen py-12">

        {/* Top: Logo + Progress */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-12"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="size-10 bg-[#0ea5e9] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.4)]">
              <svg className="text-slate-900 dark:text-white w-6 h-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
              </svg>
            </div>
            <span className="text-slate-900 dark:text-white font-bold text-lg tracking-tight">Mapa do Engajamento</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-white/90 uppercase tracking-widest">
                Pergunta {currentStep + 1} de {totalSteps}
              </span>
              <span className="text-xs font-black text-[#0ea5e9]">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#0ea5e9] to-violet-500 shadow-[0_0_15px_rgba(14,165,233,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </motion.div>

        {/* Section Badge */}
        {currentSection && (
          <motion.div
            key={currentField.section}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 mb-6"
          >
            <div
              className="size-8 rounded-lg flex items-center justify-center border"
              style={{
                backgroundColor: `${currentSection.color}15`,
                borderColor: `${currentSection.color}30`,
              }}
            >
              <DynamicIcon name={currentSection.icon} size={16} style={{ color: currentSection.color }} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: currentSection.color }}>
              {currentSection.label}
            </span>
          </motion.div>
        )}

        {/* Question Card */}
        <div className="w-full relative" style={{ minHeight: '280px' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <div className="onboarding-card p-8 md:p-10 rounded-3xl">
                {/* Question Label */}
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3 leading-tight">
                  {currentField.label}
                </h2>
                <p className="text-sm text-slate-700 dark:text-white/90 mb-8">
                  {currentField.placeholder}
                </p>

                {/* Renderização: cards clicaveis OU texto livre — nunca os dois */}
                {(() => {
                  const nicho = answers['nicho'] || ''
                  const dynamicOpts = getDynamicOptions(currentField.id, nicho)
                  const opts = dynamicOpts || OPTIONS_STATIC[currentField.id]
                  return opts ? (
                    // ── Cards clicaveis (igual Tom de Voz) ──
                    <div className="grid grid-cols-2 gap-3">
                      {opts.map((opt) => {
                        const isSelected = answers[currentField.id] === opt.value
                        return (
                          <motion.button
                            key={opt.value}
                            type="button"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleAnswer(opt.value)}
                            className={`relative flex flex-col items-start gap-1.5 p-4 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? 'bg-[#0ea5e9]/10 border-[#0ea5e9] shadow-[0_0_16px_rgba(14,165,233,0.2)]'
                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-[#0ea5e9]/50 hover:bg-[#0ea5e9]/5'
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute top-3 right-3 size-5 rounded-full bg-[#0ea5e9] flex items-center justify-center">
                                <Check size={11} className="text-white" />
                              </span>
                            )}
                            <span className="text-2xl leading-none">{opt.emoji}</span>
                            <span className={`text-sm font-bold leading-tight ${
                              isSelected ? 'text-[#0ea5e9]' : 'text-slate-900 dark:text-white'
                            }`}>{opt.label}</span>
                            <span className="text-xs text-slate-500 dark:text-white/50 leading-snug">{opt.desc}</span>
                          </motion.button>
                        )
                      })}
                    </div>
                  ) : (
                  // ── Texto livre ──
                  currentField.type === 'textarea' ? (
                    <textarea
                      value={answers[currentField.id] || ''}
                      onChange={(e) => handleAnswer(e.target.value)}
                      placeholder="Digite sua resposta aqui..."
                      className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none focus:border-[#0ea5e9] transition-all resize-none text-base leading-relaxed min-h-[160px] shadow-sm"
                      rows={5}
                      autoFocus
                    />
                  ) : (
                    <input
                      type="text"
                      value={answers[currentField.id] || ''}
                      onChange={(e) => handleAnswer(e.target.value)}
                      placeholder="Digite sua resposta aqui..."
                      className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none focus:border-[#0ea5e9] transition-all text-base shadow-sm"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') handleNext() }}
                    />
                  )
                })()}

              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full flex items-center justify-between mt-8 gap-4"
        >
          {/* Back */}
          <button
            onClick={handleBack}
            disabled={currentStep < 0}
            className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-white/90 hover:text-slate-900 dark:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none px-4 py-3"
          >
            <ArrowLeft size={20} className="text-xl" />
            Voltar
          </button>

          <div className="flex items-center gap-3">
            {/* Skip */}
            <button
              onClick={handleSkip}
              className="text-sm font-medium text-slate-800 dark:text-white/90 hover:text-slate-800 dark:text-white/90 transition-colors px-4 py-3"
            >
              Pular
            </button>

            {/* Next / Complete */}
            <button
              onClick={handleNext}
              disabled={isCompleting}
              className="onboarding-next-btn flex items-center gap-2 px-8 py-4 rounded-2xl text-slate-900 dark:text-white font-bold text-sm transition-all active:scale-[0.97] disabled:opacity-70"
            >
              {currentStep === totalSteps - 1 ? (
                <>
                  <span>Concluir</span>
                  <Check size={20} className="text-xl" />
                </>
              ) : (
                <>
                  <span>Próximo</span>
                  <ArrowRight size={20} className="text-xl" />
                </>
              )}
            </button>
          </div>
        </motion.div>
        {/* Step Dots */}
        <div className="flex items-center gap-1.5 mt-8">
          {PROFILE_FIELDS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-6 bg-[#0ea5e9] shadow-[0_0_8px_rgba(14,165,233,0.5)]'
                  : i < currentStep
                  ? 'w-1.5 bg-[#0ea5e9]/50'
                  : 'w-1.5 bg-black/10 dark:bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
