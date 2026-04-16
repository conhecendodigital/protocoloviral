export type OptionData = {
  id: string
  label: string
  description?: string
  icon?: string
}

export type WizardQuestion = {
  id: string
  title: string
  subtitle?: string
  options: OptionData[]
  allowCustom: boolean
  multiple?: boolean
}

export type WizardSection = {
  id: 'sobre' | 'publico' | 'objetivos'
  title: string
  icon: string
  questions: WizardQuestion[]
}

export const WIZARD_SECTIONS: WizardSection[] = [
  {
    id: 'sobre',
    title: 'Sobre Você',
    icon: 'person',
    questions: [
      {
        id: 'nicho',
        title: 'Qual é o seu nicho ou área de atuação?',
        options: [
          { id: 'Marketing & Vendas', label: 'Marketing & Vendas', icon: 'storefront' },
          { id: 'Finanças & Investimentos', label: 'Finanças & Investimentos', icon: 'trending_up' },
          { id: 'Saúde & Bem-estar', label: 'Saúde & Bem-estar', icon: 'health_and_safety' },
          { id: 'Desenvolvimento Pessoal', label: 'Desenvolvimento Pessoal', icon: 'self_improvement' },
          { id: 'Tecnologia & Programação', label: 'Tecnologia & Programação', icon: 'developer_mode' },
          { id: 'Educação & Idiomas', label: 'Educação & Idiomas', icon: 'school' },
        ],
        allowCustom: true,
      },
      {
        id: 'assunto',
        title: 'Qual assunto específico você domina?',
        options: [
          { id: 'Vendas no Instagram', label: 'Vendas no Instagram' },
          { id: 'Tráfego Pago', label: 'Tráfego Pago' },
          { id: 'Emagrecimento', label: 'Emagrecimento' },
          { id: 'Produtividade / Organização', label: 'Produtividade e Organização' },
          { id: 'Mentoria / Coaching', label: 'Mentoria e Coaching' },
        ],
        allowCustom: true,
      },
      {
        id: 'formacoes',
        title: 'Quais são suas formações e experiências?',
        options: [
          { id: 'Graduado na área com especializações', label: 'Graduado na área com especializações' },
          { id: 'Anos de experiência prática de mercado', label: 'Anos de experiência prática de mercado' },
          { id: 'Centenas de horas em cursos e imersões', label: 'Centenas de horas em cursos/imersões' },
          { id: 'Autodidata com resultados práticos', label: 'Autodidata com resultados práticos' },
        ],
        allowCustom: true,
      },
      {
        id: 'resultado',
        title: 'Qual resultado você já conquistou?',
        options: [
          { id: 'Faturamento alto (Múltiplos 6 ou 7 dígitos)', label: 'Faturamento alto (Múltiplos 6 ou 7 dígitos)' },
          { id: 'Mais de 1000 alunos transformados', label: 'Milhares de alunos transformados' },
          { id: 'Reconhecimento no meio de trabalho', label: 'Reconhecimento e prestígio no mercado' },
          { id: 'Liberdade financeira e geográfica', label: 'Liberdade financeira/geográfica' },
        ],
        allowCustom: true,
      },
      {
        id: 'diferencial',
        title: 'O que te diferencia dos outros?',
        options: [
          { id: 'Meu método próprio validado', label: 'Meu método próprio validado' },
          { id: 'Minha história de superação real', label: 'Minha história de superação real' },
          { id: 'Minha comunicação muito acessível', label: 'Minha comunicação acessível e direta' },
          { id: 'Transparência, sem falsa promessa', label: 'Transparência, foco na verdade' },
          { id: 'Atendimento e suporte próximo', label: 'Atendimento e suporte imbatíveis' },
        ],
        allowCustom: true,
      }
    ]
  },
  {
    id: 'publico',
    title: 'Seu Público',
    icon: 'groups',
    questions: [
      {
        id: 'publico',
        title: 'Para quem você quer falar prioritariamente?',
        options: [
          { id: 'Iniciantes absolutos que começam do zero', label: 'Iniciantes começando do zero' },
          { id: 'Pessoas travadas no nível intermediário', label: 'Intermediários que não conseguem escalar' },
          { id: 'Mães e pessoas sem muito tempo livre', label: 'Mães ou pessoas sem tempo' },
          { id: 'Profissionais em transição de carreira', label: 'Profissionais buscando transição' },
          { id: 'Empreendedores querendo mais clientes', label: 'Empreendedores e donos de negócio' },
        ],
        allowCustom: true,
      },
      {
        id: 'dor',
        title: 'Qual a maior dor (problema) dessa pessoa?',
        options: [
          { id: 'Overdose de informação sem conseguir executar', label: 'Overdose de informação (estuda mas não aplica)' },
          { id: 'Falta de disciplina ou falta de tempo', label: 'Falta de disciplina e tempo limpo' },
          { id: 'Instabilidade financeira, falta de vendas', label: 'Falta de previsibilidade / não saber vender' },
          { id: 'Medo exagerado de se expor / julgamento', label: 'Medo exagerado do julgamento / exposição' },
          { id: 'Falta de motivação / clareza do próximo passo', label: 'Estão perdidos sem clareza do que fazer' },
        ],
        allowCustom: true,
      },
      {
        id: 'tentou',
        title: 'O que ela já tentou e não funcionou?',
        options: [
          { id: 'Comprou cursos muito teóricos e desistiu', label: 'Comprou cursos e parou no meio' },
          { id: 'Tentou métodos confusos e ultrapassados', label: 'Aplicou métodos que já não funcionam mais' },
          { id: 'Consumiu conteúdo gratuito pingado sem resultado', label: 'Tentou de forma gratuita sem sucesso' },
          { id: 'Pagou terceiros (como agências) ruins', label: 'Pagou profissionais terceirizados sem resultado' },
        ],
        allowCustom: true,
      },
      {
        id: 'concorrentes',
        title: 'Liste 5 concorrentes / referências no seu radar',
        subtitle: 'Adicione até 5 nomes/perfis que te inspiram ou são referências no seu nicho.',
        options: [],
        allowCustom: true,
      }
    ]
  },
  {
    id: 'objetivos',
    title: 'Seus Objetivos',
    icon: 'rocket_launch',
    questions: [
      {
        id: 'proposito',
        title: 'Qual o seu propósito em crescer nas redes?',
        options: [
          { id: 'Vender produtos / serviços ganhando escala', label: 'Vender meus produtos com mais escala' },
          { id: 'Construir autoridade e virar referência', label: 'Construir nome forte e autoridade' },
          { id: 'Ajudar e impactar as pessoas acima do lucro', label: 'Ajudar e impactar em larga escala' },
          { id: 'Conseguir patrocínios e publis (lifestyle)', label: 'Atrair patrocinadores empresariais' },
        ],
        allowCustom: true,
      },
      {
        id: 'receio',
        title: 'Você tem algum receio em gravar / aparecer?',
        options: [
          { id: 'Nenhum, não tenho vergonha e estou pronto', label: 'Nenhum, estou super pronto(a) para começar' },
          { id: 'Sinto vergonha do julgamento de parentes/amigos', label: 'Vergonha ou medo do que as pessoas vão falar' },
          { id: 'Não sei como destravar na hora de falar para a câmera', label: 'Não saber me comunicar e travar no vídeo' },
          { id: 'Tenho receio de ficar amador sem bons equipamentos', label: 'Medo de ficar amador pela falta de equipamentos' },
        ],
        allowCustom: true,
      },
      {
        id: 'tempo',
        title: 'Quanto tempo por dia pode se dedicar?',
        options: [
          { id: 'Menos de 1 hora por dia (Rotina corrida)', label: 'Menos de 1h/dia' },
          { id: 'De 1 a 2 horas focadas por dia', label: 'De 1 a 2h/dia' },
          { id: 'Meio período (Cerca de 4h)', label: 'Meio período (4h)' },
          { id: 'Estou focado full-time', label: 'Tempo Integral (8h+)' },
        ],
        allowCustom: true,
        multiple: false,
      },
      {
        id: 'naoquer',
        title: 'O que você definitivamente NÃO quer falar ou fazer?',
        options: [
          { id: 'Não falso sobre promessas milagrosas', label: 'Mentir dados ou fazer promessas de ganho fácil irreal' },
          { id: 'Não divulgo absolutamente nada de vida pessoal/família', label: 'Mostrar vida íntima/pessoal na internet' },
          { id: 'Não toco no nome e nem ataco os concorrentes', label: 'Atacar concorrentes ou se envolver em fofocas' },
          { id: 'Não abordo nenhum tema político, de forma estrita', label: 'Entrar de maneira alguma em política ou religião' },
          { id: 'Nenhuma restrição pesada, eu faço o que precisar pra escalar', label: 'Nada grave, faço o que precisa pra crescer e engajar' },
        ],
        allowCustom: true,
      }
    ]
  }
]
