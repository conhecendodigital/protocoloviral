export interface StoryStep {
  ordem: number
  tipo: string
  texto: string
  dica: string
}

export interface StoryFramework {
  nome: string
  descricao: string
  icone: string
  stories: StoryStep[]
}

export interface StoriesDica {
  categoria: string
  dica: string
  icone: string
}

export const STORIES_FRAMEWORKS: Record<string, StoryFramework[]> = {
  vendas: [
    {
      nome: 'Sequência Problema → Solução',
      descricao: 'Estrutura clássica de vendas em 5 stories',
      icone: 'Target',
      stories: [
        { ordem: 1, tipo: 'Gancho', texto: '[Problema comum] está destruindo seu [resultado desejado]?', dica: 'Use pergunta provocativa + emoji de pensamento' },
        { ordem: 2, tipo: 'Agitação', texto: 'E o pior é que você [consequência negativa] sem nem perceber...', dica: 'Aprofunde a dor, mostre que você entende' },
        { ordem: 3, tipo: 'Virada', texto: 'Mas e se eu te mostrar um caminho diferente? 👇', dica: 'Use seta para baixo, crie suspense' },
        { ordem: 4, tipo: 'Solução', texto: '[Sua solução] resolve isso porque [benefício único]', dica: 'Seja específico no benefício, use prova' },
        { ordem: 5, tipo: 'CTA', texto: 'Quer saber como? Me manda "EU QUERO" por DM 💬', dica: 'CTA claro e simples, reduza fricção' },
      ],
    },
    {
      nome: 'Sequência de Antecipação',
      descricao: 'Gera desejo antes do lançamento em 6 stories',
      icone: 'Flame',
      stories: [
        { ordem: 1, tipo: 'Teaser', texto: 'Algo grande está chegando... 👀', dica: 'Mistério puro, sem revelar nada' },
        { ordem: 2, tipo: 'Pista', texto: 'Pra quem está cansado de [problema específico]...', dica: 'Conecte com a dor do público' },
        { ordem: 3, tipo: 'Bastidor', texto: 'Estou trabalhando nisso há [tempo] e finalmente...', dica: 'Mostre o processo, humanize' },
        { ordem: 4, tipo: 'Benefício', texto: 'Imagina conseguir [resultado desejado] em [prazo]?', dica: 'Pinte o futuro, seja específico' },
        { ordem: 5, tipo: 'Prova', texto: '[Número] pessoas já estão na lista de espera 🚀', dica: 'Use prova social real ou captação' },
        { ordem: 6, tipo: 'CTA', texto: 'Link na bio pra entrar na lista VIP (vagas limitadas)', dica: 'Escassez real + urgência' },
      ],
    },
    {
      nome: 'Sequência de Prova Social',
      descricao: 'Usa resultados de clientes para vender em 5 stories',
      icone: 'Star',
      stories: [
        { ordem: 1, tipo: 'Resultado', texto: '[Nome] conseguiu [resultado específico] em [tempo]', dica: 'Print do depoimento ou resultado' },
        { ordem: 2, tipo: 'Contexto', texto: 'Ela estava [situação antes] e achava impossível...', dica: 'Mostre o antes para criar identificação' },
        { ordem: 3, tipo: 'Processo', texto: 'O que mudou? Ela seguiu [seu método/produto]', dica: 'Conecte o resultado ao que você oferece' },
        { ordem: 4, tipo: 'Outros', texto: 'E não foi só ela: [nome 2], [nome 3] também...', dica: 'Empilhe provas, crie padrão' },
        { ordem: 5, tipo: 'CTA', texto: 'Quer ser o próximo case de sucesso? Link na bio 💪', dica: 'Convide para fazer parte' },
      ],
    },
    {
      nome: 'Sequência de Objeções',
      descricao: 'Quebra objeções antes da venda em 6 stories',
      icone: 'Unlock',
      stories: [
        { ordem: 1, tipo: 'Gancho', texto: '"Não tenho tempo/dinheiro/experiência" - Você pensa assim?', dica: 'Comece com a objeção mais comum' },
        { ordem: 2, tipo: 'Empatia', texto: 'Eu entendo. [Sua história similar ou de cliente]', dica: 'Mostre que você já pensou assim' },
        { ordem: 3, tipo: 'Reframe', texto: 'Mas pensa comigo: [nova perspectiva sobre a objeção]', dica: 'Mude o ângulo de visão' },
        { ordem: 4, tipo: 'Prova', texto: '[Exemplo real] prova que é possível mesmo [objeção]', dica: 'Use caso específico que quebra a objeção' },
        { ordem: 5, tipo: 'Garantia', texto: 'E pra tirar totalmente seu risco: [garantia]', dica: 'Remova o medo de arriscar' },
        { ordem: 6, tipo: 'CTA', texto: 'Ainda tem dúvidas? Me chama aqui 💬', dica: 'Abra canal de diálogo' },
      ],
    },
  ],
  engajamento: [
    {
      nome: 'Sequência de Enquete Interativa',
      descricao: 'Maximiza views e interações em 4 stories',
      icone: 'BarChart2',
      stories: [
        { ordem: 1, tipo: 'Pergunta', texto: 'Você prefere [Opção A] ou [Opção B]? 🤔', dica: 'Use enquete, perguntas polarizantes funcionam' },
        { ordem: 2, tipo: 'Revelação', texto: '[X%] votou em [opção vencedora]! E eu concordo porque...', dica: 'Mostre resultado + sua opinião' },
        { ordem: 3, tipo: 'Valor', texto: 'Aqui vai uma dica sobre [tema da enquete]:', dica: 'Entregue conteúdo relacionado' },
        { ordem: 4, tipo: 'Próxima', texto: 'Amanhã tem mais! Ativa o sininho 🔔', dica: 'Crie expectativa para voltar' },
      ],
    },
    {
      nome: 'Sequência de Bastidores',
      descricao: 'Humaniza e cria conexão em 5 stories',
      icone: 'Film',
      stories: [
        { ordem: 1, tipo: 'Real', texto: 'Deixa eu te mostrar algo que poucos veem...', dica: 'Crie sensação de exclusividade' },
        { ordem: 2, tipo: 'Processo', texto: '[Mostrando o que você está fazendo/criando]', dica: 'Vídeo real, sem produção' },
        { ordem: 3, tipo: 'Dificuldade', texto: 'A parte difícil que ninguém conta: [desafio real]', dica: 'Seja vulnerável e honesto' },
        { ordem: 4, tipo: 'Aprendizado', texto: 'O que aprendi com isso: [insight valioso]', dica: 'Transforme bastidor em lição' },
        { ordem: 5, tipo: 'Pergunta', texto: 'Vocês passam por isso também? Me conta! 💬', dica: 'Use caixa de perguntas' },
      ],
    },
    {
      nome: 'Sequência Polêmica Controlada',
      descricao: 'Gera debates e muitas views em 4 stories',
      icone: 'Zap',
      stories: [
        { ordem: 1, tipo: 'Gatilho', texto: 'Opinião impopular: [afirmação controversa do nicho]', dica: 'Seja ousado mas não ofensivo' },
        { ordem: 2, tipo: 'Argumento', texto: 'Sei que parece loucura, mas pensa nisso: [argumento]', dica: 'Justifique com lógica' },
        { ordem: 3, tipo: 'Prova', texto: '[Dados/experiência] provam que estou certo', dica: 'Traga evidências concretas' },
        { ordem: 4, tipo: 'Debate', texto: 'Concorda ou discorda? Vota aqui 👇', dica: 'Use enquete: Concordo / Discordo' },
      ],
    },
    {
      nome: 'Sequência Tutorial Rápido',
      descricao: 'Entrega valor e posiciona como expert em 5 stories',
      icone: 'BookOpen',
      stories: [
        { ordem: 1, tipo: 'Promessa', texto: 'Em 30 segundos você vai aprender [habilidade]:', dica: 'Seja específico na promessa' },
        { ordem: 2, tipo: 'Passo 1', texto: 'Primeiro: [ação simples e prática]', dica: 'Comece fácil para gerar confiança' },
        { ordem: 3, tipo: 'Passo 2', texto: 'Depois: [próxima ação com mais detalhes]', dica: 'Aprofunde um pouco' },
        { ordem: 4, tipo: 'Passo 3', texto: 'Por fim: [ação que gera o resultado]', dica: 'Finalize com a transformação' },
        { ordem: 5, tipo: 'Bônus', texto: 'Quer o passo a passo completo? Salva esse story! 💾', dica: 'Incentive save para algoritmo' },
      ],
    },
  ],
  storytelling: [
    {
      nome: 'Jornada do Herói Compacta',
      descricao: 'Conta sua história de transformação em 6 stories',
      icone: 'Shield',
      stories: [
        { ordem: 1, tipo: 'Antes', texto: 'Há [tempo] eu estava [situação ruim específica]', dica: 'Seja específico e emocional' },
        { ordem: 2, tipo: 'Fundo do Poço', texto: 'O momento mais difícil foi quando [evento doloroso]', dica: 'Vulnerabilidade gera conexão' },
        { ordem: 3, tipo: 'Virada', texto: 'Até que [descoberta/decisão que mudou tudo]', dica: 'Mostre o ponto de mudança' },
        { ordem: 4, tipo: 'Processo', texto: 'Não foi fácil. Passei por [desafios superados]', dica: 'Seja realista, não venda facilidade' },
        { ordem: 5, tipo: 'Depois', texto: 'Hoje eu [situação atual incrível + prova]', dica: 'Contraste claro com o antes' },
        { ordem: 6, tipo: 'Você', texto: 'E você também pode. [CTA ou mensagem]', dica: 'Conecte sua história ao público' },
      ],
    },
    {
      nome: 'Case de Sucesso Narrativo',
      descricao: 'Transforma depoimento em história em 5 stories',
      icone: 'Trophy',
      stories: [
        { ordem: 1, tipo: 'Contexto', texto: 'Preciso te contar sobre [nome do cliente]...', dica: 'Comece como se fosse um segredo' },
        { ordem: 2, tipo: 'Problema', texto: 'Quando ela chegou, estava [problema específico]', dica: 'Descreva a dor em detalhes' },
        { ordem: 3, tipo: 'Jornada', texto: 'Em [tempo] aplicando [seu método], ela [primeiros sinais]', dica: 'Mostre o processo' },
        { ordem: 4, tipo: 'Resultado', texto: 'Resultado final: [número/transformação concreta] 🎉', dica: 'Print/foto/vídeo do resultado' },
        { ordem: 5, tipo: 'Ponte', texto: 'Se ela conseguiu, você também consegue. Bora?', dica: 'Transfira a possibilidade' },
      ],
    },
  ],
  lancamento: [
    {
      nome: 'Contagem Regressiva',
      descricao: 'Cria urgência nos últimos dias em 5 stories',
      icone: 'Timer',
      stories: [
        { ordem: 1, tipo: 'Aviso', texto: 'ATENÇÃO: Faltam apenas [X] horas ⚠️', dica: 'Use cores vibrantes e timer' },
        { ordem: 2, tipo: 'Recap', texto: 'Resumo do que você leva: [lista de benefícios]', dica: 'Bullet points visuais' },
        { ordem: 3, tipo: 'Bônus', texto: 'Pra quem entrar agora: [bônus exclusivo]', dica: 'Adicione incentivo extra' },
        { ordem: 4, tipo: 'Depoimento', texto: '[Print de cliente satisfeito]', dica: 'Prova social de última hora' },
        { ordem: 5, tipo: 'Último CTA', texto: 'É agora ou nunca. Link na bio 🔗', dica: 'CTA direto e urgente' },
      ],
    },
    {
      nome: 'Abertura de Carrinho',
      descricao: 'Anuncia disponibilidade com impacto em 6 stories',
      icone: 'ShoppingCart',
      stories: [
        { ordem: 1, tipo: 'Alerta', texto: '🚨 CHEGOU A HORA 🚨', dica: 'Visual impactante, cores quentes' },
        { ordem: 2, tipo: 'Novidade', texto: '[Nome do produto/serviço] está ABERTO!', dica: 'Logo ou mockup bonito' },
        { ordem: 3, tipo: 'Pra quem', texto: 'Isso é pra você que quer [resultado específico]', dica: 'Segmente claramente' },
        { ordem: 4, tipo: 'Diferencial', texto: 'O que torna diferente: [proposta única]', dica: 'Destaque o que só você tem' },
        { ordem: 5, tipo: 'Garantia', texto: 'Risco zero: [garantia] ou seu dinheiro de volta', dica: 'Remova objeção de risco' },
        { ordem: 6, tipo: 'Ação', texto: 'Garanta sua vaga: link na bio ⬆️', dica: 'Múltiplos CTAs no dia' },
      ],
    },
    {
      nome: 'Pré-Lançamento (Esquente a Audiência)',
      descricao: 'Prepara audiência 7 dias antes de abrir vendas em 7 stories',
      icone: 'Flame',
      stories: [
        { ordem: 1, tipo: 'Problema', texto: 'Percebi que muita gente tá passando por [problema comum]...', dica: 'Conecte com dor real da audiência' },
        { ordem: 2, tipo: 'Validação', texto: 'Você também sente isso? Vota aqui 👇', dica: 'Use enquete: Sim / Demais!' },
        { ordem: 3, tipo: 'Segredo', texto: 'Tô trabalhando em algo que vai resolver isso...', dica: 'Crie mistério, não revele ainda' },
        { ordem: 4, tipo: 'Bastidor', texto: '[Mostre parte do processo de criação]', dica: 'Foto ou vídeo dos bastidores' },
        { ordem: 5, tipo: 'Resultado', texto: 'Olha o que [aluno beta/teste] conseguiu...', dica: 'Prova social antecipada' },
        { ordem: 6, tipo: 'Escassez', texto: 'Vai ter pouquíssimas vagas. Quer ser avisado primeiro?', dica: 'Crie lista VIP com sticker de link' },
        { ordem: 7, tipo: 'Contagem', texto: 'Em [X] dias eu conto tudo. Fica de olho 👀', dica: 'Use sticker de contagem regressiva' },
      ],
    },
    {
      nome: 'FAQ de Vendas',
      descricao: 'Responde objeções e perguntas comuns em 6 stories',
      icone: 'HelpCircle',
      stories: [
        { ordem: 1, tipo: 'Intro', texto: 'Vocês perguntaram, eu respondo! Vem nas próximas ➡️', dica: 'Tom leve e acessível' },
        { ordem: 2, tipo: 'Pergunta 1', texto: '"Funciona pra quem [objeção comum]?" - Resposta: SIM, porque...', dica: 'Quebre a objeção mais comum' },
        { ordem: 3, tipo: 'Pergunta 2', texto: '"Quanto tempo leva pra ver resultado?" - Resposta: ...', dica: 'Seja honesto sobre expectativas' },
        { ordem: 4, tipo: 'Pergunta 3', texto: '"E se não funcionar pra mim?" - Resposta: ...', dica: 'Fale da garantia e suporte' },
        { ordem: 5, tipo: 'Prova', texto: 'Como [cliente específico] fez: [resultado]', dica: 'Case real que responde dúvidas' },
        { ordem: 6, tipo: 'Dúvida Extra', texto: 'Ficou com alguma dúvida? Me manda aqui 👇', dica: 'Use caixa de perguntas' },
      ],
    },
  ],
}

export const STORIES_DICAS: StoriesDica[] = [
  { categoria: 'Visual', dica: 'Use 80% de tela com texto grande e legível (mínimo 24px)', icone: 'Eye' },
  { categoria: 'Visual', dica: 'Cores contrastantes: fundo escuro + texto claro ou vice-versa', icone: 'Palette' },
  { categoria: 'Visual', dica: 'Rostos humanos aumentam retenção em 38%', icone: 'User' },
  { categoria: 'Visual', dica: 'Movimento nos 2 primeiros segundos prende atenção', icone: 'Film' },
  { categoria: 'Texto', dica: 'Máximo 3 linhas por story - menos é mais', icone: 'PenLine' },
  { categoria: 'Texto', dica: 'Comece com verbo de ação ou pergunta', icone: 'HelpCircle' },
  { categoria: 'Texto', dica: 'Use números específicos: "7 dias" > "poucos dias"', icone: 'Hash' },
  { categoria: 'Texto', dica: 'Primeira palavra em CAPS prende o olhar', icone: 'Megaphone' },
  { categoria: 'Timing', dica: 'Poste entre 7-9h, 12-14h ou 19-21h', icone: 'Timer' },
  { categoria: 'Timing', dica: 'Sequências de 5-7 stories têm melhor retenção', icone: 'BarChart2' },
  { categoria: 'Timing', dica: 'Use stickers interativos nos 3 primeiros stories', icone: 'Flame' },
  { categoria: 'Timing', dica: 'Poste stories todos os dias - consistência ganha', icone: '📅' },
  { categoria: 'Conversão', dica: 'CTA no máximo a cada 3-4 stories', icone: 'Target' },
  { categoria: 'Conversão', dica: 'Ofereça algo em troca do clique: "Ganhe X ao clicar"', icone: 'Gift' },
  { categoria: 'Conversão', dica: 'Use prova social antes do CTA', icone: 'Star' },
  { categoria: 'Conversão', dica: 'Repita o CTA de formas diferentes ao longo do dia', icone: 'RefreshCw' },
  { categoria: 'Engajamento', dica: 'Enquetes aumentam alcance em 20%', icone: 'BarChart2' },
  { categoria: 'Engajamento', dica: 'Responda TODA mensagem de DM vinda de story', icone: 'MessageCircle' },
  { categoria: 'Engajamento', dica: 'Perguntas abertas geram 3x mais respostas', icone: 'HelpCircle' },
]

export const CATEGORIAS_STORIES = [
  { id: 'vendas', nome: 'Vendas', icone: 'DollarSign', descricao: 'Sequências que convertem' },
  { id: 'engajamento', nome: 'Engajamento', icone: 'BarChart2', descricao: 'Maximize views e interação' },
  { id: 'storytelling', nome: 'Storytelling', icone: 'Drama', descricao: 'Conte histórias que conectam' },
  { id: 'lancamento', nome: 'Lançamento', icone: 'Rocket', descricao: 'Estratégias para lançar produtos' },
]
