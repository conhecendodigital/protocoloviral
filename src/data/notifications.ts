// Notification types and templates for the platform

export type NotificationType = 
  | 'onboarding' 
  | 'achievement' 
  | 'routine' 
  | 'tip' 
  | 'update' 
  | 'milestone'
  | 'engagement'
  | 'strategy'

export interface Notification {
  id: string
  type: NotificationType
  icon: string
  title: string
  message: string
  href?: string
  read: boolean
  timestamp: number
}

export interface NotificationTemplate {
  type: NotificationType
  icon: string
  title: string
  message: string
  href?: string
  /** Condition function: returns true if this notification should show */
  condition: (ctx: NotificationContext) => boolean
  /** Priority: higher = shows first */
  priority: number
}

export interface NotificationContext {
  completion: number
  jornadaDone: number
  jornadaTotal: number
  dayOfWeek: number // 0=Sunday, 6=Saturday
  hour: number
  hasAvatar: boolean
  userName: string
  onboardingCompleted: boolean
  xp: number
  level: number
  conquistasCount: number
}

// Helper: day names in Portuguese
const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  // ═══════════════════════════════════════════════
  // 🎯 ONBOARDING (Perfil & Primeiro Acesso)
  // ═══════════════════════════════════════════════
  {
    type: 'onboarding',
    icon: 'waving_hand',
    title: 'Bem-vindo à plataforma!',
    message: 'Siga o Mapa de Execução no dashboard para começar a criar conteúdo em minutos.',
    href: '/',
    condition: (ctx) => ctx.completion === 0,
    priority: 100,
  },
  {
    type: 'onboarding',
    icon: 'psychology',
    title: 'Treine sua IA primeiro',
    message: 'Preencha seu perfil para que a IA entenda seu negócio e gere conteúdos personalizados.',
    href: '/perfil',
    condition: (ctx) => ctx.completion < 30,
    priority: 99,
  },
  {
    type: 'onboarding',
    icon: 'trending_up',
    title: 'Perfil em andamento',
    message: `Seu perfil está ${30}% completo. Continue para ativar os geradores de conteúdo.`,
    href: '/perfil',
    condition: (ctx) => ctx.completion >= 30 && ctx.completion < 50,
    priority: 95,
  },
  {
    type: 'onboarding',
    icon: 'speed',
    title: 'Quase lá!',
    message: 'Faltam poucos campos para sua IA ficar 100% treinada. Complete agora.',
    href: '/perfil',
    condition: (ctx) => ctx.completion >= 50 && ctx.completion < 80,
    priority: 93,
  },
  {
    type: 'onboarding',
    icon: 'emoji_events',
    title: 'Últimos detalhes do perfil',
    message: 'Seu perfil está quase completo! Preencha os campos restantes para liberar tudo.',
    href: '/perfil',
    condition: (ctx) => ctx.completion >= 80 && ctx.completion < 100,
    priority: 92,
  },
  {
    type: 'onboarding',
    icon: 'check_circle',
    title: 'IA treinada com sucesso!',
    message: 'Seu perfil está 100% completo. A IA agora conhece seu negócio e está pronta para gerar conteúdos.',
    href: '/perfil',
    condition: (ctx) => ctx.completion === 100,
    priority: 90,
  },
  {
    type: 'onboarding',
    icon: 'add_a_photo',
    title: 'Adicione sua foto de perfil',
    message: 'Uma foto ajuda a personalizar sua experiência. Clique aqui para enviar.',
    href: '/perfil',
    condition: (ctx) => !ctx.hasAvatar && ctx.completion > 0,
    priority: 70,
  },
  {
    type: 'onboarding',
    icon: 'auto_fix_high',
    title: 'Melhore respostas com IA',
    message: 'Depois de preencher o perfil, use o botão "Melhorar Tudo com IA" para enriquecer seus textos.',
    href: '/perfil',
    condition: (ctx) => ctx.completion >= 50 && ctx.completion < 100,
    priority: 85,
  },

  // ═══════════════════════════════════════════════
  // 🗺️ JORNADA DE CONTEÚDO
  // ═══════════════════════════════════════════════
  {
    type: 'milestone',
    icon: 'explore',
    title: 'Comece a Jornada de Conteúdo',
    message: 'São 30 estações com frameworks prontos. Comece pela Estação 01 e siga o mapa.',
    href: '/jornada',
    condition: (ctx) => ctx.completion === 100 && ctx.jornadaDone === 0,
    priority: 88,
  },
  {
    type: 'milestone',
    icon: 'flag',
    title: 'Primeira estação concluída!',
    message: 'Você completou sua primeira estação da Jornada. Continue avançando!',
    href: '/jornada',
    condition: (ctx) => ctx.jornadaDone === 1,
    priority: 80,
  },
  {
    type: 'milestone',
    icon: 'local_fire_department',
    title: '5 estações concluídas!',
    message: 'Você já completou 5 estações. Está pegando o ritmo! Continue assim.',
    href: '/jornada',
    condition: (ctx) => ctx.jornadaDone >= 5 && ctx.jornadaDone < 10,
    priority: 75,
  },
  {
    type: 'milestone',
    icon: 'star',
    title: '10 estações na Jornada!',
    message: 'Metade do caminho! Suas estratégias de conteúdo já estão tomando forma.',
    href: '/jornada',
    condition: (ctx) => ctx.jornadaDone >= 10 && ctx.jornadaDone < 15,
    priority: 74,
  },
  {
    type: 'milestone',
    icon: 'bolt',
    title: '15 estações completas!',
    message: 'Você está na metade da Jornada. Seus conteúdos já devem estar mais estratégicos.',
    href: '/jornada',
    condition: (ctx) => ctx.jornadaDone >= 15 && ctx.jornadaDone < 20,
    priority: 73,
  },
  {
    type: 'milestone',
    icon: 'rocket_launch',
    title: '20 estações concluídas!',
    message: 'Faltam apenas 10 estações para completar toda a Jornada de Conteúdo!',
    href: '/jornada',
    condition: (ctx) => ctx.jornadaDone >= 20 && ctx.jornadaDone < 25,
    priority: 72,
  },
  {
    type: 'milestone',
    icon: 'military_tech',
    title: 'Quase lá na Jornada!',
    message: 'Faltam menos de 5 estações. Você está quase completando toda a jornada!',
    href: '/jornada',
    condition: (ctx) => ctx.jornadaDone >= 25 && ctx.jornadaDone < 30,
    priority: 71,
  },
  {
    type: 'milestone',
    icon: 'workspace_premium',
    title: 'Jornada completa! 🏆',
    message: 'Você completou todas as 30 estações! Agora aplique os frameworks nos seus conteúdos diários.',
    href: '/jornada',
    condition: (ctx) => ctx.jornadaDone >= 30,
    priority: 95,
  },
  {
    type: 'engagement',
    icon: 'replay',
    title: 'Continue a Jornada',
    message: `Você tem ${0} estações pendentes. Que tal avançar mais uma hoje?`,
    href: '/jornada',
    condition: (ctx) => ctx.jornadaDone > 0 && ctx.jornadaDone < 30,
    priority: 60,
  },

  // ═══════════════════════════════════════════════
  // 📅 ROTINA SEMANAL (Por dia)
  // ═══════════════════════════════════════════════
  {
    type: 'routine',
    icon: 'edit_note',
    title: 'Segunda: Dia de criar conteúdo',
    message: 'Comece a semana forte. Gere 2 roteiros usando o Gerador de Prompts.',
    href: '/prompts',
    condition: (ctx) => ctx.dayOfWeek === 1 && ctx.completion === 100,
    priority: 85,
  },
  {
    type: 'routine',
    icon: 'videocam',
    title: 'Terça: Dia de gravar',
    message: 'Use os roteiros que você criou ontem e grave seus vídeos hoje.',
    href: '/rotina',
    condition: (ctx) => ctx.dayOfWeek === 2 && ctx.completion === 100,
    priority: 85,
  },
  {
    type: 'routine',
    icon: 'schedule',
    title: 'Quarta: Dia de agendar',
    message: 'Agende as publicações da semana. Consistência é a chave do crescimento.',
    href: '/rotina',
    condition: (ctx) => ctx.dayOfWeek === 3 && ctx.completion === 100,
    priority: 85,
  },
  {
    type: 'routine',
    icon: 'forum',
    title: 'Quinta: Dia de engajar',
    message: 'Responda comentários, interaja nos Stories e crie conexão com sua audiência.',
    href: '/stories',
    condition: (ctx) => ctx.dayOfWeek === 4 && ctx.completion === 100,
    priority: 85,
  },
  {
    type: 'routine',
    icon: 'analytics',
    title: 'Sexta: Dia de analisar',
    message: 'Revise os resultados da semana. O que funcionou? O que pode melhorar?',
    href: '/rotina',
    condition: (ctx) => ctx.dayOfWeek === 5 && ctx.completion === 100,
    priority: 85,
  },
  {
    type: 'routine',
    icon: 'lightbulb',
    title: 'Sábado: Dia de planejar',
    message: 'Planeje os conteúdos da próxima semana. Escolha temas na Jornada.',
    href: '/jornada',
    condition: (ctx) => ctx.dayOfWeek === 6 && ctx.completion === 100,
    priority: 80,
  },
  {
    type: 'routine',
    icon: 'self_improvement',
    title: 'Domingo: Dia de descanso',
    message: 'Descanse e recarregue. Amanhã a rotina de conteúdo recomeça.',
    href: '/',
    condition: (ctx) => ctx.dayOfWeek === 0 && ctx.completion === 100,
    priority: 75,
  },

  // ═══════════════════════════════════════════════
  // 📅 ROTINA POR HORÁRIO
  // ═══════════════════════════════════════════════
  {
    type: 'routine',
    icon: 'wb_sunny',
    title: 'Bom dia! Hora de criar',
    message: 'A manhã é o melhor horário para criar conteúdo. Sua mente está fresca.',
    href: '/prompts',
    condition: (ctx) => ctx.hour >= 6 && ctx.hour < 10 && ctx.completion === 100,
    priority: 65,
  },
  {
    type: 'routine',
    icon: 'restaurant',
    title: 'Pausa para o almoço?',
    message: 'Use 10 minutos para escolher um gancho viral para o próximo conteúdo.',
    href: '/ganchos',
    condition: (ctx) => ctx.hour >= 11 && ctx.hour < 14 && ctx.completion === 100,
    priority: 50,
  },
  {
    type: 'routine',
    icon: 'nights_stay',
    title: 'Sessão noturna',
    message: 'Que tal planejar o conteúdo de amanhã antes de dormir?',
    href: '/jornada',
    condition: (ctx) => ctx.hour >= 20 && ctx.hour < 24 && ctx.completion === 100,
    priority: 50,
  },

  // ═══════════════════════════════════════════════
  // 🏆 CONQUISTAS E GAMIFICAÇÃO
  // ═══════════════════════════════════════════════
  {
    type: 'achievement',
    icon: 'stars',
    title: 'Primeiros passos',
    message: 'Você começou sua jornada na plataforma! Continue explorando as ferramentas.',
    href: '/',
    condition: (ctx) => ctx.xp > 0 && ctx.xp <= 50,
    priority: 60,
  },
  {
    type: 'achievement',
    icon: 'trending_up',
    title: '100 XP acumulados!',
    message: 'Seu nível está subindo. Continue usando as ferramentas para ganhar mais XP.',
    href: '/',
    condition: (ctx) => ctx.xp >= 100 && ctx.xp < 200,
    priority: 55,
  },
  {
    type: 'achievement',
    icon: 'local_fire_department',
    title: '500 XP! Você está em chamas',
    message: 'Meio caminho andado. Seus conteúdos estão ficando cada vez mais estratégicos.',
    href: '/',
    condition: (ctx) => ctx.xp >= 500 && ctx.xp < 1000,
    priority: 55,
  },
  {
    type: 'achievement',
    icon: 'military_tech',
    title: '1000 XP! Nível expert',
    message: 'Você já domina as ferramentas. Agora é hora de otimizar sua rotina.',
    href: '/',
    condition: (ctx) => ctx.xp >= 1000,
    priority: 55,
  },
  {
    type: 'achievement',
    icon: 'emoji_events',
    title: 'Primeira conquista!',
    message: 'Você desbloqueou sua primeira conquista! Veja todas no seu perfil.',
    href: '/',
    condition: (ctx) => ctx.conquistasCount === 1,
    priority: 78,
  },
  {
    type: 'achievement',
    icon: 'trophy',
    title: '5 conquistas desbloqueadas!',
    message: 'Você já tem 5 conquistas. Continue usando a plataforma para desbloquear mais.',
    href: '/',
    condition: (ctx) => ctx.conquistasCount >= 5 && ctx.conquistasCount < 10,
    priority: 60,
  },

  // ═══════════════════════════════════════════════
  // 💡 DICAS DE CONTEÚDO E ESTRATÉGIA
  // ═══════════════════════════════════════════════
  {
    type: 'tip',
    icon: 'anchor',
    title: 'Use ganchos nos primeiros 3 segundos',
    message: 'Os primeiros 3 segundos definem se a pessoa vai assistir seu vídeo. Use um gancho forte.',
    href: '/ganchos',
    condition: (ctx) => ctx.completion === 100,
    priority: 45,
  },
  {
    type: 'tip',
    icon: 'format_quote',
    title: 'Títulos que geram curiosidade',
    message: 'Títulos como "O erro que 90% comete..." prendem mais atenção que títulos genéricos.',
    href: '/ganchos',
    condition: (ctx) => ctx.completion === 100,
    priority: 40,
  },
  {
    type: 'tip',
    icon: 'visibility',
    title: 'Poste entre 18h e 21h',
    message: 'Esse é o horário de pico do Instagram. Seus conteúdos terão mais alcance.',
    href: '/rotina',
    condition: (ctx) => ctx.completion === 100,
    priority: 35,
  },
  {
    type: 'tip',
    icon: 'psychology',
    title: 'Fale sobre a dor, não a solução',
    message: 'Seu público se conecta mais quando você descreve o problema do que quando apresenta a resposta.',
    href: '/prompts',
    condition: (ctx) => ctx.completion === 100,
    priority: 35,
  },
  {
    type: 'tip',
    icon: 'video_camera_front',
    title: 'Stories vendem, Reels alcançam',
    message: 'Use Reels para atrair novos seguidores e Stories para nutrir e vender.',
    href: '/stories',
    condition: (ctx) => ctx.completion === 100,
    priority: 35,
  },
  {
    type: 'tip',
    icon: 'thumb_up',
    title: 'CTA no final do vídeo',
    message: 'Sempre termine com uma chamada para ação. "Salva esse vídeo" ou "Comenta X".',
    href: '/prompts',
    condition: (ctx) => ctx.completion === 100,
    priority: 30,
  },
  {
    type: 'tip',
    icon: 'repeat',
    title: 'Consistência > Perfeição',
    message: 'É melhor postar 5 vídeos bons por semana do que 1 perfeito por mês.',
    href: '/rotina',
    condition: (ctx) => ctx.completion === 100,
    priority: 30,
  },
  {
    type: 'tip',
    icon: 'groups',
    title: 'Responda todos os comentários',
    message: 'O algoritmo prioriza conteúdos com muita interação. Responda rápido.',
    href: '/rotina',
    condition: (ctx) => ctx.completion === 100,
    priority: 30,
  },
  {
    type: 'tip',
    icon: 'edit',
    title: 'Legendas curtas, diretas',
    message: 'No Instagram, menos é mais. Legendas de 2-3 linhas funcionam melhor que textos longos.',
    href: '/prompts',
    condition: (ctx) => ctx.completion === 100,
    priority: 25,
  },
  {
    type: 'tip',
    icon: 'music_note',
    title: 'Use músicas em alta nos Reels',
    message: 'Áudios trending aumentam o alcance. Fique de olho na aba Reels do Instagram.',
    href: '/rotina',
    condition: (ctx) => ctx.completion === 100,
    priority: 25,
  },
  {
    type: 'tip',
    icon: 'palette',
    title: 'Identidade visual importa',
    message: 'Use as mesmas cores e fontes em todos os conteúdos para criar reconhecimento de marca.',
    href: '/perfil',
    condition: (ctx) => ctx.completion === 100,
    priority: 25,
  },
  {
    type: 'tip',
    icon: 'emoji_objects',
    title: 'Conteúdo de valor gera seguidores',
    message: 'Ensine algo útil em cada post. Pessoas seguem quem resolve problemas.',
    href: '/jornada',
    condition: (ctx) => ctx.completion === 100,
    priority: 25,
  },
  {
    type: 'tip',
    icon: 'share',
    title: 'Peça para compartilhar',
    message: 'Um simples "manda pra alguém que precisa ver isso" aumenta o alcance em até 40%.',
    href: '/ganchos',
    condition: (ctx) => ctx.completion === 100,
    priority: 25,
  },
  {
    type: 'tip',
    icon: 'auto_stories',
    title: 'Conte histórias pessoais',
    message: 'Histórias reais criam conexão emocional. Compartilhe suas experiências.',
    href: '/stories',
    condition: (ctx) => ctx.completion === 100,
    priority: 20,
  },
  {
    type: 'tip',
    icon: 'question_mark',
    title: 'Faça perguntas na legenda',
    message: 'Perguntas incentivam comentários, e comentários alimentam o algoritmo.',
    href: '/prompts',
    condition: (ctx) => ctx.completion === 100,
    priority: 20,
  },
  {
    type: 'tip',
    icon: 'trending_flat',
    title: 'Carrosséis educativos',
    message: 'Posts em carrossel têm o maior engajamento no Instagram. Use para listas e tutoriais.',
    href: '/prompts',
    condition: (ctx) => ctx.completion === 100,
    priority: 20,
  },
  {
    type: 'tip',
    icon: 'tag',
    title: 'Use 5-10 hashtags relevantes',
    message: 'Hashtags muito grandes competem demais. Use hashtags de nicho com menos de 500k posts.',
    href: '/prompts',
    condition: (ctx) => ctx.completion === 100,
    priority: 20,
  },
  {
    type: 'tip',
    icon: 'campaign',
    title: 'Polêmica controlada funciona',
    message: 'Conteúdos que geram debate educado recebem mais comentários e alcance.',
    href: '/ganchos',
    condition: (ctx) => ctx.completion === 100,
    priority: 15,
  },
  {
    type: 'tip',
    icon: 'timer',
    title: 'Reels de 15-30 segundos',
    message: 'Vídeos curtos retêm mais. Se o conteúdo for longo, divida em partes.',
    href: '/prompts',
    condition: (ctx) => ctx.completion === 100,
    priority: 15,
  },
  {
    type: 'tip',
    icon: 'face',
    title: 'Mostre seu rosto',
    message: 'Vídeos com rosto geram até 38% mais engajamento que vídeos sem.',
    href: '/stories',
    condition: (ctx) => ctx.completion === 100,
    priority: 15,
  },

  // ═══════════════════════════════════════════════
  // 🧠 ESTRATÉGIA AVANÇADA
  // ═══════════════════════════════════════════════
  {
    type: 'strategy',
    icon: 'hub',
    title: 'Crie séries de conteúdo',
    message: 'Séries como "Dica #1, #2, #3..." fazem as pessoas voltarem ao seu perfil.',
    href: '/jornada',
    condition: (ctx) => ctx.jornadaDone >= 5,
    priority: 40,
  },
  {
    type: 'strategy',
    icon: 'diversity_3',
    title: 'Colaborações multiplicam alcance',
    message: 'Faça conteúdos com outros criadores do seu nicho para alcançar novos públicos.',
    href: '/ganchos',
    condition: (ctx) => ctx.jornadaDone >= 10,
    priority: 35,
  },
  {
    type: 'strategy',
    icon: 'shopping_bag',
    title: 'Oferta nos Stories',
    message: 'Depois de criar conexão com conteúdo de valor, faça uma oferta direta nos Stories.',
    href: '/stories',
    condition: (ctx) => ctx.jornadaDone >= 5,
    priority: 35,
  },
  {
    type: 'strategy',
    icon: 'monitoring',
    title: 'Analise seu melhor conteúdo',
    message: 'Veja qual foi seu post com mais engajamento e crie variações dele.',
    href: '/rotina',
    condition: (ctx) => ctx.jornadaDone >= 3,
    priority: 30,
  },
  {
    type: 'strategy',
    icon: 'calendar_month',
    title: 'Planeje 7 dias de conteúdo',
    message: 'Reserve 1 hora por semana para planejar todos os conteúdos. Isso evita stress diário.',
    href: '/rotina',
    condition: (ctx) => ctx.completion === 100,
    priority: 30,
  },
  {
    type: 'strategy',
    icon: 'save',
    title: '"Salva posts" são ouro',
    message: 'Conteúdos que geram muitos salvamentos são priorizados pelo algoritmo. Crie posts "salváveis".',
    href: '/prompts',
    condition: (ctx) => ctx.completion === 100,
    priority: 25,
  },
  {
    type: 'strategy',
    icon: 'person_search',
    title: 'Otimize sua bio',
    message: 'Sua bio é a porta de entrada. Use o Analisador de Bio para garantir que está convertendo.',
    href: '/bio-analyzer',
    condition: (ctx) => ctx.completion === 100,
    priority: 50,
  },
  {
    type: 'strategy',
    icon: 'link',
    title: 'Link na bio estratégico',
    message: 'O link da bio deve levar para uma página com CTA claro, não seu site genérico.',
    href: '/bio-analyzer',
    condition: (ctx) => ctx.completion === 100,
    priority: 20,
  },
  {
    type: 'strategy',
    icon: 'psychology_alt',
    title: 'Conheça sua persona',
    message: 'Revise periodicamente as informações do seu público. O mercado muda rápido.',
    href: '/perfil',
    condition: (ctx) => ctx.completion === 100,
    priority: 20,
  },
  {
    type: 'strategy',
    icon: 'published_with_changes',
    title: 'Recicle conteúdo antigo',
    message: 'Pegue posts que funcionaram no passado e refaça com nova abordagem.',
    href: '/prompts',
    condition: (ctx) => ctx.jornadaDone >= 10,
    priority: 20,
  },

  // ═══════════════════════════════════════════════
  // 🔧 FERRAMENTAS DA PLATAFORMA
  // ═══════════════════════════════════════════════
  {
    type: 'update',
    icon: 'anchor',
    title: 'Explore os Ganchos Virais',
    message: 'A biblioteca de ganchos tem frases prontas para abrir seus vídeos com impacto.',
    href: '/ganchos',
    condition: (ctx) => ctx.completion === 100,
    priority: 55,
  },
  {
    type: 'update',
    icon: 'magic_button',
    title: 'Gerador de Prompts disponível',
    message: 'Crie roteiros, defina nicho e gere textos persuasivos com inteligência artificial.',
    href: '/prompts',
    condition: (ctx) => ctx.completion === 100,
    priority: 55,
  },
  {
    type: 'update',
    icon: 'video_camera_front',
    title: 'Roteiros para Stories',
    message: 'Use os frameworks de Stories para criar conexão e preparar sua audiência para vender.',
    href: '/stories',
    condition: (ctx) => ctx.completion === 100,
    priority: 50,
  },
  {
    type: 'update',
    icon: 'calendar_today',
    title: 'Rotina Semanal organizada',
    message: 'Sua checklist de criação está distribuída pela semana. Veja o que fazer hoje.',
    href: '/rotina',
    condition: (ctx) => ctx.completion === 100,
    priority: 50,
  },
  {
    type: 'update',
    icon: 'monitoring',
    title: 'Analisador de Bio',
    message: 'Otimize a descrição do seu perfil no Instagram para converter mais visitantes.',
    href: '/bio-analyzer',
    condition: (ctx) => ctx.completion === 100,
    priority: 45,
  },

  // ═══════════════════════════════════════════════
  // 💪 MOTIVAÇÃO E ENGAJAMENTO
  // ═══════════════════════════════════════════════
  {
    type: 'engagement',
    icon: 'verified',
    title: 'Você está no caminho certo',
    message: 'Cada conteúdo publicado te aproxima do seu objetivo. Continue.',
    href: '/',
    condition: (ctx) => ctx.completion === 100,
    priority: 10,
  },
  {
    type: 'engagement',
    icon: 'timeline',
    title: 'Crescimento leva tempo',
    message: 'Os maiores perfis do Instagram começaram do zero. Consistência é tudo.',
    href: '/',
    condition: (ctx) => ctx.completion === 100,
    priority: 10,
  },
  {
    type: 'engagement',
    icon: 'handshake',
    title: 'Comunidade importa',
    message: 'Conecte-se com outros criadores do seu nicho. Crescer junto é mais rápido.',
    href: '/',
    condition: (ctx) => ctx.completion === 100,
    priority: 10,
  },
  {
    type: 'engagement',
    icon: 'grade',
    title: 'Qualidade > Quantidade',
    message: 'É melhor 3 conteúdos excelentes por semana do que 7 mediocres.',
    href: '/',
    condition: (ctx) => ctx.completion === 100,
    priority: 10,
  },
  {
    type: 'engagement',
    icon: 'eco',
    title: 'Plante hoje, colha amanhã',
    message: 'Os conteúdos que você cria hoje vão trazer resultados nos próximos 30-90 dias.',
    href: '/',
    condition: (ctx) => ctx.completion === 100,
    priority: 10,
  },
  {
    type: 'engagement',
    icon: 'fitness_center',
    title: 'Foco no progresso',
    message: 'Não compare seu começo com o resultado de quem já está há anos. Foco no seu progresso.',
    href: '/',
    condition: (ctx) => ctx.completion === 100,
    priority: 10,
  },
  {
    type: 'engagement',
    icon: 'autorenew',
    title: 'Rotina gera resultado',
    message: 'Os criadores que mais crescem são os que mantêm uma rotina definida. Siga a sua.',
    href: '/rotina',
    condition: (ctx) => ctx.completion === 100,
    priority: 10,
  },
  {
    type: 'engagement',
    icon: 'school',
    title: 'Aprenda com os dados',
    message: 'Sempre que um conteúdo funcionar bem, anote o que fez diferente e replique.',
    href: '/rotina',
    condition: (ctx) => ctx.completion === 100,
    priority: 10,
  },
]

// Icon color by notification type  
export const TYPE_COLORS: Record<NotificationType, string> = {
  onboarding: '#f59e0b',
  achievement: '#10b981',
  routine: '#0ea5e9',
  tip: '#8b5cf6',
  update: '#06b6d4',
  milestone: '#f97316',
  engagement: '#ec4899',
  strategy: '#6366f1',
}

export const TYPE_LABELS: Record<NotificationType, string> = {
  onboarding: 'Perfil',
  achievement: 'Conquista',
  routine: 'Rotina',
  tip: 'Dica',
  update: 'Ferramenta',
  milestone: 'Marco',
  engagement: 'Motivação',
  strategy: 'Estratégia',
}
