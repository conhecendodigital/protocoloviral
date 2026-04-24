'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PROFILE_FIELDS } from '@/types/profile'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ArrowRight, Brain, Check, CheckCircle, Hand, Pencil, Sparkles } from 'lucide-react'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

const supabase = createClient()

interface OnboardingModalProps {
  userId: string
  onComplete: () => void
  updateField: (field: string, value: string) => void
  initialAnswers?: Record<string, string> // para modo edição (perfil já preenchido)
  editMode?: boolean // quando true: pula intro, mostra 'Salvar' no final
}

const SECTION_LABELS: Record<string, { icon: string; label: string; color: string }> = {
  sobre: { icon: 'person', label: 'Sobre Você', color: '#0ea5e9' },
  publico: { icon: 'groups', label: 'Seu Público', color: '#8b5cf6' },
  objetivos: { icon: 'rocket_launch', label: 'Seus Objetivos', color: '#10b981' },
}

// ── Campos OPCIONAIS — exibem badge "Opcional" e podem ser pulados sem culpa
const OPTIONAL_FIELDS = new Set(['formacoes', 'diferencial', 'concorrentes', 'naoquer'])

// ── Contexto "por que isso importa" — mostrado abaixo da pergunta
const FIELD_WHY: Record<string, string> = {
  nicho:        'A IA usa isso para personalizar 100% do conteúdo gerado para você.',
  assunto:      'Quanto mais específico, mais poderosos serão seus roteiros e ideias.',
  formacoes:    'Sua experiência vira credibilidade nos seus conteúdos. (opcional)',
  resultado:    'Resultados reais são o melhor gancho para atrair seu público.',
  diferencial:  'O que te faz único é o que vai fazer as pessoas escolherem você. (opcional)',
  publico:      'A IA cria personas e roteiros direcionados exatamente para essa pessoa.',
  dor:          'Conteúdo que toca na dor real converte 3x mais que conteúdo genérico.',
  tentou:       'Saber o que NÃO funcionou evita conteúdo batido e repetitivo.',
  concorrentes: 'A IA analisa o que funciona no seu nicho para te diferenciar. (opcional)',
  proposito:    'Seu objetivo define a estratégia inteira de conteúdo e vendas.',
  receio:       'A IA vai te ajudar a superar exatamente esses bloqueios.',
  tempo:        'Com isso a IA monta uma estratégia real para a sua rotina.',
  naoquer:      'Esses limites serão respeitados em todos os conteúdos gerados. (opcional)',
}

type CardOption = { emoji: string; label: string; desc: string; value: string }

// ── Opções estáticas padrão (nichos não mapeados) — expert-level rewrite
const OPTIONS_STATIC: Record<string, CardOption[]> = {
  resultado: [
    { emoji: '🌱', label: 'Ainda no começo', desc: 'Primeiros passos, construindo a base', value: 'Ainda estou nos primeiros passos, construindo minha presença digital do zero' },
    { emoji: '📈', label: 'Crescimento inicial', desc: 'Tive avanços, mas ainda pequenos', value: 'Tive crescimento inicial com alguns seguidores e engajamento, mas ainda pequeno' },
    { emoji: '💰', label: 'Primeiras vendas', desc: 'Já fechei clientes pelas redes', value: 'Já consegui fechar meus primeiros clientes ou vendas pelas redes sociais' },
    { emoji: '🏆', label: 'Referência no nicho', desc: 'Pessoas me reconhecem como autoridade', value: 'Me tornei referência reconhecida no meu nicho com audiência engajada' },
    { emoji: '🚀', label: 'Vivo do digital', desc: '100% da renda vem do conteúdo/digital', value: 'Já vivo 100% do meu negócio digital, com renda consistente online' },
    { emoji: '✏️', label: 'Outro resultado', desc: 'Descreva com suas palavras', value: '__outro__' },
  ],
  publico: [
    { emoji: '🎯', label: 'Quem quer começar', desc: 'Zero a um — começando completamente do zero', value: 'Pessoas que ainda estão no zero e não sabem por onde começar' },
    { emoji: '😤', label: 'Estagnados no meio', desc: 'Têm base mas travaram no crescimento', value: 'Pessoas que já começaram mas estagnaram e não conseguem dar o próximo passo' },
    { emoji: '💼', label: 'Empreendedores', desc: 'Donos de negócio querendo mais clientes', value: 'Empreendedores e donos de negócio que querem usar o digital para atrair mais clientes' },
    { emoji: '🏥', label: 'Profissionais liberais', desc: 'Médico, advogado, coach, consultor...', value: 'Profissionais liberais como médicos, advogados, coaches e consultores que querem autoridade online' },
    { emoji: '🔄', label: 'Em transição', desc: 'Mudando de área ou criando nova fonte de renda', value: 'Profissionais em transição de carreira ou buscando criar uma nova fonte de renda' },
    { emoji: '✏️', label: 'Outro público', desc: 'Descreva com suas palavras', value: '__outro__' },
  ],
  dor: [
    { emoji: '🧊', label: 'Paralisia total', desc: 'Sabe o que fazer mas não executa nada', value: 'Sofre de paralisia por análise — consome muito conteúdo mas não consegue colocar nada em prática' },
    { emoji: '🔁', label: 'Inconsistência crônica', desc: 'Começa cheio de energia, some em 2 semanas', value: 'Começa motivado mas para inevitavelmente — não consegue manter consistência por mais de 2 semanas' },
    { emoji: '👻', label: 'Invisibilidade online', desc: 'Publica mas ninguém vê, curte ou comenta', value: 'Publica conteúdo mas não alcança ninguém — posts sem visualizações, sem engajamento, sem resultado' },
    { emoji: '📉', label: 'Não converte', desc: 'Tem seguidores mas nenhum vira cliente', value: 'Tem seguidores mas nenhum vira cliente — não sabe como usar o conteúdo para vender' },
    { emoji: '🌫️', label: 'Falta de clareza', desc: 'Não sabe o que falar, para quem ou como', value: 'Não tem clareza sobre o que falar, para quem falar ou como se posicionar no seu nicho' },
    { emoji: '✏️', label: 'Outra dor', desc: 'Descreva com suas palavras', value: '__outro__' },
  ],
  tentou: [
    { emoji: '📚', label: 'Cursos teóricos', desc: 'Comprou, empolgou, parou no módulo 3', value: 'Comprou cursos online, começou empolgado e parou no meio sem implementar nada' },
    { emoji: '🐑', label: 'Copiar outros', desc: 'Imitou concorrentes e não saiu do lugar', value: 'Tentou copiar estratégias de outros criadores e não teve nenhum resultado' },
    { emoji: '📅', label: 'Postar sempre', desc: 'Volume sem estratégia — publicou muito, cresceu pouco', value: 'Postou muito sem estratégia e ficou exausto sem ver crescimento' },
    { emoji: '🏢', label: 'Contratar alguém', desc: 'Pagou agência ou editor, não teve retorno', value: 'Pagou agência, gestor ou editor de conteúdo e o investimento não gerou resultado' },
    { emoji: '✏️', label: 'Outra tentativa', desc: 'Descreva com suas palavras', value: '__outro__' },
  ],
  proposito: [
    { emoji: '🛒', label: 'Vender produto/serviço', desc: 'Usar conteúdo como canal de vendas diretas', value: 'Usar o conteúdo para vender meu produto ou serviço e gerar receita direta' },
    { emoji: '🎓', label: 'Lançar curso/mentoria', desc: 'Criar e vender um infoproduto online', value: 'Lançar um curso, mentoria ou programa online e viver disso' },
    { emoji: '📞', label: 'Atrair clientes', desc: 'Conteúdo gerando leads para o negócio', value: 'Usar o conteúdo para atrair leads e novos clientes para meu negócio' },
    { emoji: '👑', label: 'Construir autoridade', desc: 'Ser a referência número 1 do nicho', value: 'Me tornar referência reconhecida no meu nicho e construir autoridade sólida' },
    { emoji: '🌱', label: 'Audiência primeiro', desc: 'Crescer agora, monetizar depois', value: 'Primeiro construir uma audiência engajada e depois monetizar de forma sustentável' },
    { emoji: '✏️', label: 'Outro objetivo', desc: 'Descreva com suas palavras', value: '__outro__' },
  ],
  receio: [
    { emoji: '🎥', label: 'Câmera me paralisa', desc: 'Trava só de pensar em gravar', value: 'Sinto bloqueio total na frente da câmera, fico tenso e sem saber o que fazer' },
    { emoji: '😰', label: 'Medo de julgamento', desc: 'Preocupação com o que conhecidos vão pensar', value: 'Medo intenso de ser julgado pelas pessoas que me conhecem pessoalmente' },
    { emoji: '🤔', label: 'Não sei o que falar', desc: 'Não tenho clareza da mensagem', value: 'Não tenho clareza sobre o que falar, qual mensagem passar ou como me comunicar' },
    { emoji: '📅', label: 'Medo de não manter', desc: 'E se eu começar e não aguentar o ritmo?', value: 'Tenho medo de começar, criar expectativa e depois não conseguir manter a consistência' },
    { emoji: '✅', label: 'Sem receios', desc: 'Estou pronto, só quero melhorar os resultados', value: 'Não tenho receios — estou pronto para criar e só quero melhorar minha estratégia' },
  ],
  tempo: [
    { emoji: '⚡', label: '15 a 30 min/dia', desc: 'Rotina corrida — só tenho alguns minutos', value: '15 a 30 minutos por dia — tenho rotina muito intensa' },
    { emoji: '⏱️', label: '1 hora/dia', desc: 'Uma hora focada por dia', value: 'Cerca de 1 hora por dia dedicada exclusivamente ao conteúdo' },
    { emoji: '⏰', label: '2 horas/dia', desc: 'Bom tempo para criar com qualidade', value: 'Cerca de 2 horas por dia para criação de conteúdo' },
    { emoji: '📅', label: 'Só fins de semana', desc: 'Semana lotada, só tenho o final de semana livre', value: 'Apenas nos finais de semana — minha semana é completamente tomada' },
    { emoji: '🔥', label: 'Full time (3h+)', desc: 'Dedicação total — isso é minha prioridade número 1', value: 'Mais de 3 horas por dia — o digital é minha prioridade máxima agora' },
  ],
  naoquer: [
    { emoji: '🚫', label: 'Política e religião', desc: 'Esses temas ficam totalmente fora', value: 'Política e religião — não quero abordar esses temas em nenhuma circunstância' },
    { emoji: '💊', label: 'Promessas milagrosas', desc: 'Sem "fique rico rápido" ou resultados impossíveis', value: 'Promessas de enriquecimento rápido ou resultados sem esforço real' },
    { emoji: '🔒', label: 'Vida pessoal/família', desc: 'Privacidade total da vida fora do trabalho', value: 'Exposição da minha vida pessoal, família ou relacionamentos íntimos' },
    { emoji: '🥊', label: 'Polêmicas e brigas', desc: 'Zero brigas com concorrentes ou trending topics negativos', value: 'Atacar concorrentes, me envolver em polêmicas ou drama online' },
    { emoji: '✅', label: 'Sem restrições', desc: 'Faço o que for preciso para crescer', value: 'Não tenho restrições — falo o que for necessário para entregar valor' },
    { emoji: '✏️', label: 'Outras restrições', desc: 'Descreva o que não quer abordar', value: '__outro__' },
  ],
}

// ── Opções dinâmicas por nicho (publico + dor)
function getDynamicOptions(fieldId: string, nicho: string): CardOption[] | null {
  const n = nicho.toLowerCase()

  // Fitness / Saúde / Emagrecimento
  if (n.match(/fit|sa[uú]de|emagre|nutri|treino|academia|corpo|magr|dieta|esport/)) {
    if (fieldId === 'publico') return [
      { emoji: '🏋️', label: 'Sedentários querendo começar', desc: 'Sabem que devem mas não conseguem dar o passo', value: 'Pessoas sedentárias que sabem que precisam mudar mas não conseguem começar e manter' },
      { emoji: '🍽️', label: 'Quem luta com o peso', desc: 'Tentaram tudo e não conseguem resultado duradouro', value: 'Pessoas que tentaram várias dietas e métodos mas não conseguem emagrecer de forma definitiva' },
      { emoji: '💪', label: 'Iniciantes na musculação', desc: 'Na academia mas se sentindo perdidos', value: 'Iniciantes na academia que não sabem como treinar corretamente nem o que comer' },
      { emoji: '👩', label: 'Mulheres 30-50 anos', desc: 'Qualidade de vida, autoestima e saúde hormonal', value: 'Mulheres entre 30 e 50 anos que buscam saúde, qualidade de vida e autoestima' },
      { emoji: '🏃', label: 'Atletas amadores', desc: 'Querem melhorar performance e evitar lesões', value: 'Atletas amadores que querem melhorar performance, evitar lesões e ter melhor recuperação' },
      { emoji: '✏️', label: 'Outro público', desc: 'Descreva com suas palavras', value: '__outro__' },
    ]
    if (fieldId === 'dor') return [
      { emoji: '🔄', label: 'Efeito sanfona eterno', desc: 'Emagrece, engorda, emagrece — nunca mantém', value: 'Sofre com efeito sanfona há anos — sempre volta ao peso inicial, sem conseguir manter resultado' },
      { emoji: '⏰', label: 'Falta de tempo e energia', desc: 'Rotina lotada que impossibilita a consistência', value: 'Falta de tempo e energia depois do trabalho para treinar e preparar alimentação saudável' },
      { emoji: '🍕', label: 'Ansiedade e compulsão', desc: 'Come por emoção e sabota a própria dieta', value: 'Come por ansiedade, estresse ou tédio e sabota toda a disciplina que construiu' },
      { emoji: '😔', label: 'Crise de autoestima', desc: 'Corpo gera vergonha, evita espelhos e fotos', value: 'Autoestima destruída pelo corpo atual — evita fotos, espelhos e situações sociais' },
      { emoji: '💸', label: 'Gastou e não resultou', desc: 'Suplementos, remédios, dietas caras sem resultado', value: 'Gastou muito dinheiro com suplementos, remédios e dietas milagrosas sem resultado real' },
      { emoji: '✏️', label: 'Outra dor', desc: 'Descreva com suas palavras', value: '__outro__' },
    ]
  }

  // Finanças / Investimentos / Renda
  if (n.match(/finan|invest|renda|dinheiro|econom|aposentad|bolsa|cripto|patrim/)) {
    if (fieldId === 'publico') return [
      { emoji: '💳', label: 'Endividados e no vermelho', desc: 'Querem sair das dívidas e organizar a vida financeira', value: 'Pessoas endividadas que querem sair do vermelho, quitar dívidas e reorganizar as finanças' },
      { emoji: '📊', label: 'Zero em investimentos', desc: 'Nunca investiram — não sabem nem por onde começar', value: 'Pessoas que nunca investiram na vida e não sabem por onde começar com segurança' },
      { emoji: '💼', label: 'Assalariados estagnados', desc: 'Salário certo, mas não sobra nada no fim do mês', value: 'Assalariados com renda fixa que não conseguem guardar dinheiro e querem criar renda extra' },
      { emoji: '👨‍👩‍👧', label: 'Pais de família', desc: 'Segurança financeira para o futuro dos filhos', value: 'Pais de família que querem construir segurança financeira e garantir o futuro dos filhos' },
      { emoji: '🎓', label: 'Jovens adultos 20-30', desc: 'Começando a vida e querendo construir patrimônio', value: 'Jovens adultos entre 20 e 30 anos que querem começar certo e construir patrimônio desde cedo' },
      { emoji: '✏️', label: 'Outro público', desc: 'Descreva com suas palavras', value: '__outro__' },
    ]
    if (fieldId === 'dor') return [
      { emoji: '💸', label: 'Dinheiro some todo mês', desc: 'Não sabe para onde foi — acorda e o saldo foi', value: 'O dinheiro desaparece antes do fim do mês e nunca sabe exatamente para onde foi' },
      { emoji: '😱', label: 'Medo de investir e perder', desc: 'Querer investir mas ter pavor de perder o pouco que tem', value: 'Tem vontade de investir mas tem medo de perder o dinheiro que levou anos para juntar' },
      { emoji: '🏦', label: 'Sem reserva de emergência', desc: 'Qualquer imprevisto vira catástrofe financeira', value: 'Não tem nenhuma reserva de emergência — qualquer conta inesperada desequilibra tudo' },
      { emoji: '📉', label: 'Compra por impulso', desc: 'Gasta mais do que ganha — cartão sempre travado', value: 'Compra por impulso e emoção, sempre gastando mais do que ganha mesmo querendo economizar' },
      { emoji: '⏳', label: 'Aposentadoria impossível', desc: 'Não consegue imaginar como vai se aposentar', value: 'Não consegue visualizar como vai se aposentar com qualidade de vida no ritmo atual' },
      { emoji: '✏️', label: 'Outra dor', desc: 'Descreva com suas palavras', value: '__outro__' },
    ]
  }

  // Marketing Digital / Criadores de conteúdo
  if (n.match(/market|digital|redes|social|instagram|tiktok|youtube|content|criador|influenc|infoprod/)) {
    if (fieldId === 'publico') return [
      { emoji: '🏪', label: 'Negócios locais', desc: 'Comércios e serviços que querem mais clientes via digital', value: 'Donos de negócios locais que querem usar o Instagram e TikTok para atrair clientes' },
      { emoji: '🎓', label: 'Especialistas invisíveis', desc: 'Sabem muito, mas ninguém conhece eles', value: 'Especialistas com muito conhecimento mas sem presença digital — invisíveis no mercado' },
      { emoji: '💼', label: 'Autônomos e freelancers', desc: 'Vivem de clientes e querem captar pelo digital', value: 'Autônomos e freelancers que querem parar de depender de indicação e captar clientes online' },
      { emoji: '🌱', label: 'Nunca criaram conteúdo', desc: 'Absolute zero — nunca gravaram um vídeo sequer', value: 'Pessoas que nunca criaram nenhum tipo de conteúdo e não sabem nem como começar' },
      { emoji: '🔄', label: 'Criadores sem resultado', desc: 'Postam há meses mas não crescem nem vendem', value: 'Criadores que já postam há bastante tempo mas não conseguem crescimento nem conversão' },
      { emoji: '✏️', label: 'Outro público', desc: 'Descreva com suas palavras', value: '__outro__' },
    ]
    if (fieldId === 'dor') return [
      { emoji: '🤷', label: 'Trava criativa total', desc: 'Fica dias sem saber o que postar', value: 'Fica dias e semanas sem publicar nada porque não sabe o que postar ou o que falar' },
      { emoji: '👻', label: 'Conteúdo que ninguém vê', desc: 'Produz com esforço mas o alcance é zero', value: 'Produz conteúdo com muito esforço mas o alcance orgânico é mínimo — ninguém chega ao perfil' },
      { emoji: '📉', label: 'Seguidores que não compram', desc: 'Audiência existe mas não converte em vendas', value: 'Tem uma base de seguidores razoável mas não consegue converter nenhum em cliente pagante' },
      { emoji: '🔁', label: 'O ciclo de recomeçar', desc: 'Começa, para, some, recome — ciclo infinito', value: 'Entra em ciclo vicioso: começa motivado, para na segunda semana, some do feed, recomeça do zero' },
      { emoji: '😵', label: 'Perdido no mar de criadores', desc: 'Não sabe como ser diferente de todos os outros', value: 'Não sabe qual é seu diferencial real e se sente perdido num mar de criadores fazendo a mesma coisa' },
      { emoji: '✏️', label: 'Outra dor', desc: 'Descreva com suas palavras', value: '__outro__' },
    ]
  }

  // Moda / Beleza / Estética
  if (n.match(/moda|beleza|estet|look|make|maqu|fashion|style|lifestyle|pele|cabelo/)) {
    if (fieldId === 'publico') return [
      { emoji: '👗', label: 'Quem quer se vestir bem', desc: 'Buscam estilo sem gastar uma fortuna', value: 'Mulheres que querem se vestir bem, ter estilo próprio e se sentir confiantes sem gastar muito' },
      { emoji: '🪞', label: 'Batalha com autoestima', desc: 'Usam moda e beleza para se reconectar com si mesmas', value: 'Pessoas que buscam transformar a autoestima e a relação com o próprio corpo através da moda e beleza' },
      { emoji: '📸', label: 'Querem aparecer online', desc: 'Criar conteúdo de moda/beauty e crescer', value: 'Pessoas que querem criar conteúdo de moda ou beleza nas redes sociais e construir audiência' },
      { emoji: '💼', label: 'Imagem profissional', desc: 'Querem projetar autoridade pela aparência', value: 'Profissionais que querem construir uma imagem de autoridade e confiança pela forma como se apresentam' },
      { emoji: '💍', label: 'Mulheres 25-45', desc: 'Querem se sentir bonitas no dia a dia sem drama', value: 'Mulheres entre 25 e 45 anos que querem praticidade, estilo e se sentir bonitas sem complicação' },
      { emoji: '✏️', label: 'Outro público', desc: 'Descreva com suas palavras', value: '__outro__' },
    ]
    if (fieldId === 'dor') return [
      { emoji: '🤷‍♀️', label: 'Guarda-roupa cheio, nada para vestir', desc: 'Muitas roupas mas não sabe combinar', value: 'Tem um guarda-roupa cheio de roupas mas não sabe montar looks e sente que não tem nada para usar' },
      { emoji: '💸', label: 'Compra por impulso e se arrepende', desc: 'Gasta com roupas que nunca usa', value: 'Compra roupas por impulso, se arrepende e elas ficam encostadas com etiqueta no armário' },
      { emoji: '😔', label: 'Não gosta da própria imagem', desc: 'Evita fotos e situações onde vai aparecer', value: 'Não gosta da própria imagem, evita aparecer em fotos e sente vergonha da sua aparência' },
      { emoji: '📏', label: 'Dificuldade com o corpo real', desc: 'Não encontra roupas que valorizem seu tipo físico', value: 'Tem dificuldade de encontrar roupas que valorizem seu tipo físico real — não é modelo de revista' },
      { emoji: '❓', label: 'Sem identidade visual', desc: 'Copia tendências sem ter estilo próprio', value: 'Não tem identidade visual própria — fica copiando tendências e influencers sem desenvolver seu estilo' },
      { emoji: '✏️', label: 'Outra dor', desc: 'Descreva com suas palavras', value: '__outro__' },
    ]
  }

  // Educação / Concursos / Estudos
  if (n.match(/educa|concurs|estud|professor|ensino|aprend|pedagogia/)) {
    if (fieldId === 'publico') return [
      { emoji: '📚', label: 'Concurseiros', desc: 'Estudando para passar em concurso público', value: 'Pessoas estudando para concursos públicos que querem método mais eficiente e aprovação mais rápida' },
      { emoji: '🎓', label: 'Estudantes de graduação', desc: 'Faculdade e vestibular', value: 'Estudantes de graduação ou que preparam para vestibular querendo melhorar desempenho' },
      { emoji: '👩‍💼', label: 'Profissionais se capacitando', desc: 'Querem subir de nível na carreira', value: 'Profissionais que estudam para se qualificar e crescer na carreira' },
      { emoji: '👨‍👩‍👧', label: 'Pais de crianças', desc: 'Querem ajudar os filhos a estudar melhor', value: 'Pais que querem ajudar seus filhos a ter melhor desempenho escolar e hábitos de estudo' },
      { emoji: '✏️', label: 'Outro público', desc: 'Descreva com suas palavras', value: '__outro__' },
    ]
    if (fieldId === 'dor') return [
      { emoji: '😴', label: 'Não consegue absorver', desc: 'Lê mas não fica nada na cabeça', value: 'Estuda horas mas não absorve o conteúdo — tudo parece entrar por um ouvido e sair pelo outro' },
      { emoji: '🔁', label: 'Falta de disciplina', desc: 'Planeja muito mas executa pouco', value: 'Faz mil cronogramas e planos de estudo mas não consegue seguir nenhum por mais de uma semana' },
      { emoji: '😰', label: 'Ansiedade de prova', desc: 'Sabe a matéria mas trava na hora H', value: 'Tem ansiedade intensa na hora das provas — sabe o conteúdo mas trava e não performa' },
      { emoji: '🕐', label: 'Falta de tempo', desc: 'Trabalha, tem família e ainda precisa estudar', value: 'Trabalha ou tem família e não sabe como encaixar o estudo sério na rotina corrida' },
      { emoji: '✏️', label: 'Outra dor', desc: 'Descreva com suas palavras', value: '__outro__' },
    ]
  }

  return null
}

// ── Valor final da resposta (resolve __outro__ para o texto digitado)
function resolveValue(selected: string, otherText: string): string {
  return selected === '__outro__' ? otherText.trim() : selected
}

export function OnboardingModal({ userId, onComplete, updateField, initialAnswers = {}, editMode = false }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(editMode ? 0 : -1)
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers)
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({})
  const [direction, setDirection] = useState(1)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const totalSteps = PROFILE_FIELDS.length
  const currentField = currentStep >= 0 ? PROFILE_FIELDS[currentStep] : null
  const progress = currentStep >= 0 ? ((currentStep + 1) / totalSteps) * 100 : 0
  const currentSection = currentField ? SECTION_LABELS[currentField.section] : null
  const isOptional = currentField ? OPTIONAL_FIELDS.has(currentField.id) : false

  // Resolve se o step atual tem algum valor válido
  const currentAnswer = currentField ? answers[currentField.id] || '' : ''
  const currentOtherText = currentField ? otherTexts[currentField.id] || '' : ''
  const isOtherSelected = currentAnswer === '__outro__'
  const hasValidAnswer = currentAnswer !== '' && (currentAnswer !== '__outro__' || currentOtherText.trim() !== '')

  const handleAnswer = useCallback((value: string) => {
    if (!currentField) return
    setAnswers(prev => ({ ...prev, [currentField.id]: value }))
  }, [currentField])

  const handleOtherText = useCallback((text: string) => {
    if (!currentField) return
    setOtherTexts(prev => ({ ...prev, [currentField.id]: text }))
  }, [currentField])

  const getFinalAnswers = useCallback(() => {
    const result: Record<string, string> = {}
    for (const key of Object.keys(answers)) {
      const val = answers[key]
      result[key] = val === '__outro__' ? (otherTexts[key] || '').trim() : val
    }
    return result
  }, [answers, otherTexts])

  const saveCurrentField = useCallback(() => {
    if (!currentField) return
    const val = resolveValue(currentAnswer, currentOtherText)
    if (val) updateField(currentField.id, val)
  }, [currentField, currentAnswer, currentOtherText, updateField])

  const handleNext = useCallback(async () => {
    if (!currentField) return
    saveCurrentField()

    if (currentStep < totalSteps - 1) {
      setDirection(1)
      setCurrentStep(prev => prev + 1)
    } else if (editMode) {
      // Modo edição: salva tudo e fecha sem gerar insights
      setIsCompleting(true)
      const finalAnswers = getFinalAnswers()
      // Persiste cada campo diretamente
      for (const [key, val] of Object.entries(finalAnswers)) {
        if (val) updateField(key, val)
      }
      onComplete()
    } else {
      setIsCompleting(true)
      const finalAnswers = getFinalAnswers()

      await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', userId)
      setShowSuccess(true)
      setIsGeneratingInsights(true)

      try {
        await fetch('/api/gerar-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: finalAnswers }),
        })
      } catch (e) {
        console.error('[onboarding] gerar-insights failed:', e)
      } finally {
        setIsGeneratingInsights(false)
      }

      setTimeout(() => { onComplete() }, 2500)
    }
  }, [currentStep, totalSteps, currentField, editMode, saveCurrentField, getFinalAnswers, updateField, userId, supabase, onComplete])

  const handleBack = useCallback(() => {
    if (currentStep > 0) { setDirection(-1); setCurrentStep(prev => prev - 1) }
    else if (currentStep === 0 && editMode) { onComplete() } // fecha modal em modo edição
    else if (currentStep === 0) { setDirection(-1); setCurrentStep(-1) }
  }, [currentStep, editMode, onComplete])

  const handleSkip = useCallback(async () => {
    if (currentStep < totalSteps - 1) {
      setDirection(1)
      setCurrentStep(prev => prev + 1)
    } else {
      setIsCompleting(true)
      await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', userId)
      setShowSuccess(true)
      setIsGeneratingInsights(true)
      try {
        const finalAnswers = getFinalAnswers()
        await fetch('/api/gerar-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: finalAnswers }),
        })
      } catch (e) { console.error('[onboarding] gerar-insights skip failed:', e) }
      finally { setIsGeneratingInsights(false) }
      setTimeout(() => { onComplete() }, 2500)
    }
  }, [currentStep, totalSteps, supabase, userId, onComplete, getFinalAnswers])

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  }

  // ── Success Screen ────────────────────────────────────────
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
            <CheckCircle size={48} className="text-slate-900 dark:text-white" />
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

  // ── Intro Screen ──────────────────────────────────────────
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
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="size-20 bg-gradient-to-br from-[#0ea5e9] to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(14,165,233,0.3)]"
            >
              <Hand size={40} className="text-slate-900 dark:text-white" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
              Antes de começar,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">preciso te conhecer melhor!</span>
            </h2>

            <p className="text-base text-slate-800 dark:text-white/90 max-w-lg mx-auto mb-4 leading-relaxed">
              São <strong>13 perguntas rápidas</strong> — a maioria tem opções clicáveis, dura menos de 3 minutos.
            </p>

            <p className="text-base text-slate-800 dark:text-white/90 max-w-lg mx-auto mb-4 leading-relaxed">
              Suas respostas alimentam a <span className="font-bold text-slate-900 dark:text-white">IA</span> que gera roteiros, ganchos e estratégias <span className="font-bold text-[#0ea5e9]">100% no seu nicho</span>.
            </p>

            <p className="text-sm text-slate-700 dark:text-white/70 max-w-lg mx-auto mb-10 leading-relaxed">
              Campos marcados como <span className="inline-flex items-center gap-1 text-xs font-bold bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white/60 px-2 py-0.5 rounded-full">Opcional</span> podem ser pulados sem problema.
            </p>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => { setDirection(1); setCurrentStep(0) }}
              className="onboarding-next-btn inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-slate-900 dark:text-white font-bold text-base transition-all active:scale-[0.97]"
            >
              <span>Vamos começar</span>
              <ArrowRight size={20} />
            </motion.button>

            <button
              onClick={onComplete}
              className="block mx-auto mt-6 text-sm font-medium text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/70 transition-colors"
            >
              Preencher depois
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!currentField) return null

  // ── Resolve opções para o campo atual ───────────────────
  const nicho = answers['nicho'] || ''
  const dynamicOpts = getDynamicOptions(currentField.id, nicho)
  const opts = dynamicOpts || OPTIONS_STATIC[currentField.id]
  const hasCards = !!opts

  return (
    <div className="onboarding-overlay dark">
      <div className="w-full max-w-2xl mx-auto px-6 flex flex-col items-center justify-center min-h-screen py-12">

        {/* Top: Logo + Progress */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full mb-10">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="size-10 bg-[#0ea5e9] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.4)]">
              <svg className="text-slate-900 dark:text-white w-6 h-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor" />
              </svg>
            </div>
            <span className="text-slate-900 dark:text-white font-bold text-lg tracking-tight">Mapa do Engajamento</span>
          </div>

          <div className="w-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-white/70 uppercase tracking-widest">
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

        {/* Section Badge + Optional Badge */}
        <div className="w-full flex items-center justify-between mb-5">
          {currentSection && (
            <motion.div
              key={currentField.section}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <div
                className="size-8 rounded-lg flex items-center justify-center border"
                style={{ backgroundColor: `${currentSection.color}15`, borderColor: `${currentSection.color}30` }}
              >
                <DynamicIcon name={currentSection.icon} size={16} style={{ color: currentSection.color }} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: currentSection.color }}>
                {currentSection.label}
              </span>
            </motion.div>
          )}

          {isOptional && (
            <span className="text-xs font-bold bg-slate-200/80 dark:bg-white/10 text-slate-500 dark:text-white/50 px-3 py-1 rounded-full">
              Opcional
            </span>
          )}
        </div>

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
                {/* Question */}
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2 leading-tight">
                  {currentField.label}
                </h2>

                {/* Why hint */}
                {FIELD_WHY[currentField.id] && (
                  <p className="text-xs text-[#0ea5e9]/80 font-medium mb-6 italic">
                    💡 {FIELD_WHY[currentField.id]}
                  </p>
                )}

                {/* Cards OR Texto livre */}
                {hasCards && opts ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {opts.map((opt) => {
                        const isSelected = currentAnswer === opt.value
                        return (
                          <motion.button
                            key={opt.value}
                            type="button"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleAnswer(opt.value)}
                            className={`relative flex flex-col items-start gap-1.5 p-4 rounded-2xl border text-left transition-all ${
                              opt.value === '__outro__'
                                ? isSelected
                                  ? 'bg-violet-500/10 border-violet-500 shadow-[0_0_16px_rgba(139,92,246,0.2)]'
                                  : 'bg-white dark:bg-white/5 border-dashed border-slate-300 dark:border-white/20 hover:border-violet-400/60 hover:bg-violet-500/5'
                                : isSelected
                                  ? 'bg-[#0ea5e9]/10 border-[#0ea5e9] shadow-[0_0_16px_rgba(14,165,233,0.2)]'
                                  : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-[#0ea5e9]/50 hover:bg-[#0ea5e9]/5'
                            }`}
                          >
                            {isSelected && opt.value !== '__outro__' && (
                              <span className="absolute top-3 right-3 size-5 rounded-full bg-[#0ea5e9] flex items-center justify-center">
                                <Check size={11} className="text-white" />
                              </span>
                            )}
                            {isSelected && opt.value === '__outro__' && (
                              <span className="absolute top-3 right-3 size-5 rounded-full bg-violet-500 flex items-center justify-center">
                                <Pencil size={10} className="text-white" />
                              </span>
                            )}
                            <span className="text-2xl leading-none">{opt.emoji}</span>
                            <span className={`text-sm font-bold leading-tight ${
                              opt.value === '__outro__'
                                ? isSelected ? 'text-violet-400' : 'text-slate-500 dark:text-white/50'
                                : isSelected ? 'text-[#0ea5e9]' : 'text-slate-900 dark:text-white'
                            }`}>{opt.label}</span>
                            <span className="text-xs text-slate-500 dark:text-white/50 leading-snug">{opt.desc}</span>
                          </motion.button>
                        )
                      })}
                    </div>

                    {/* Expandable text input for "Outro" */}
                    <AnimatePresence>
                      {isOtherSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <textarea
                            value={currentOtherText}
                            onChange={(e) => handleOtherText(e.target.value)}
                            placeholder="Descreva com suas próprias palavras..."
                            autoFocus
                            rows={3}
                            className="w-full bg-white dark:bg-white/5 border border-violet-400/50 rounded-2xl px-5 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-violet-500 transition-all resize-none text-sm leading-relaxed shadow-sm"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  // Texto livre
                  currentField.type === 'textarea' ? (
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => handleAnswer(e.target.value)}
                      placeholder="Digite sua resposta aqui..."
                      className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none focus:border-[#0ea5e9] transition-all resize-none text-base leading-relaxed min-h-[160px] shadow-sm"
                      rows={5}
                      autoFocus
                    />
                  ) : (
                    <input
                      type="text"
                      value={currentAnswer}
                      onChange={(e) => handleAnswer(e.target.value)}
                      placeholder="Digite sua resposta aqui..."
                      className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none focus:border-[#0ea5e9] transition-all text-base shadow-sm"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') handleNext() }}
                    />
                  )
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full flex items-center justify-between mt-8 gap-4"
        >
          <button
            onClick={handleBack}
            disabled={currentStep < 0}
            className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none px-4 py-3"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>

          <div className="flex items-center gap-3">
            {/* Pular — sempre visível, mas mais proeminente em campos opcionais */}
            <button
              onClick={handleSkip}
              className={`text-sm font-medium transition-colors px-4 py-3 rounded-xl ${
                isOptional
                  ? 'text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-white/5'
                  : 'text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/60'
              }`}
            >
              {isOptional ? 'Pular (opcional)' : 'Pular'}
            </button>

            {/* Próximo / Concluir */}
            <button
              onClick={handleNext}
              disabled={isCompleting || (!hasValidAnswer && !isOptional && currentAnswer === '')}
              className="onboarding-next-btn flex items-center gap-2 px-8 py-4 rounded-2xl text-slate-900 dark:text-white font-bold text-sm transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === totalSteps - 1 ? (
                <><span>{editMode ? 'Salvar Alterações' : 'Concluir'}</span><Check size={20} /></>
              ) : (
                <><span>Próximo</span><ArrowRight size={20} /></>
              )}
            </button>
          </div>
        </motion.div>

        {/* Step Dots */}
        <div className="flex items-center gap-1.5 mt-8">
          {PROFILE_FIELDS.map((f, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-6 bg-[#0ea5e9] shadow-[0_0_8px_rgba(14,165,233,0.5)]'
                  : i < currentStep
                  ? 'w-1.5 bg-[#0ea5e9]/50'
                  : OPTIONAL_FIELDS.has(f.id)
                  ? 'w-1.5 bg-black/5 dark:bg-white/5'
                  : 'w-1.5 bg-black/10 dark:bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
