export interface Profile {
  id: string
  email: string
  nicho: string | null
  assunto: string | null
  formacoes: string | null
  resultado: string | null
  diferencial: string | null
  publico: string | null
  dor: string | null
  tentou: string | null
  concorrentes: string | null
  proposito: string | null
  receio: string | null
  tempo: string | null
  naoquer: string | null
  resposta1: string | null
  resposta2: string | null
  resposta3: string | null
  resposta4: string | null
  resposta5: string | null
  ideia_roteiro: string | null
  produto_venda: string | null
  xp: number
  nivel: number
  onboarding_completed: boolean
  conquistas: string[]
  created_at: string
  updated_at: string
}

export interface ProfileField {
  id: keyof Profile
  label: string
  placeholder: string
  type: 'input' | 'textarea'
  section: 'sobre' | 'publico' | 'objetivos'
}

export const PROFILE_FIELDS: ProfileField[] = [
  { id: 'nicho', label: 'Qual é o seu nicho/área de atuação?', placeholder: 'Ex: Marketing Digital, Finanças, Saúde...', type: 'input', section: 'sobre' },
  { id: 'assunto', label: 'Qual assunto específico você domina?', placeholder: 'Ex: Instagram para negócios locais...', type: 'input', section: 'sobre' },
  { id: 'formacoes', label: 'Quais são suas formações e experiências?', placeholder: 'Cursos, certificações, vivências profissionais...', type: 'textarea', section: 'sobre' },
  { id: 'resultado', label: 'Qual resultado você já conquistou?', placeholder: 'Ex: Ganhei 10k seguidores, Vendi R$50k...', type: 'input', section: 'sobre' },
  { id: 'diferencial', label: 'O que te diferencia dos outros?', placeholder: 'Sua história, método único, forma de comunicar...', type: 'textarea', section: 'sobre' },
  { id: 'publico', label: 'Para quem você quer falar?', placeholder: 'Descreva idade, gênero, profissão, momento de vida...', type: 'textarea', section: 'publico' },
  { id: 'dor', label: 'Qual a maior dor/problema dessa pessoa?', placeholder: 'O que tira o sono dela? O que ela quer resolver urgente?', type: 'textarea', section: 'publico' },
  { id: 'tentou', label: 'O que essa pessoa já tentou e não funcionou?', placeholder: 'Cursos, métodos, estratégias que ela já testou...', type: 'textarea', section: 'publico' },
  { id: 'concorrentes', label: 'Liste 5 concorrentes/referências do seu nicho', placeholder: 'Pessoas que falam do mesmo assunto e já têm resultado', type: 'textarea', section: 'publico' },
  { id: 'proposito', label: 'Qual seu propósito em crescer nas redes?', placeholder: 'Vender curso, atrair clientes, construir autoridade...', type: 'input', section: 'objetivos' },
  { id: 'receio', label: 'Tem algum receio em gravar/aparecer?', placeholder: 'Vergonha, medo de julgamento, não saber o que falar...', type: 'textarea', section: 'objetivos' },
  { id: 'tempo', label: 'Quanto tempo por dia pode dedicar?', placeholder: '30 min, 1 hora, 2 horas...', type: 'input', section: 'objetivos' },
  { id: 'naoquer', label: 'O que você NÃO quer falar?', placeholder: 'Temas proibidos por princípio...', type: 'input', section: 'objetivos' },
]
