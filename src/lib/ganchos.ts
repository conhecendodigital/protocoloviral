// ═══════════════════════════════════════════════════════════
// 100 GANCHOS VIRAIS — Banco de templates para roteiros
// Fonte: Ebook "100 Ganchos" — adaptado para uso da IA
// ═══════════════════════════════════════════════════════════

export interface Gancho {
  id: number
  template: string        // Template com [VARIÁVEIS] para preencher
  categoria: string       // Categoria do gancho
  gatilho: string         // Gatilho psicológico principal
  visual: string          // Sugestão de gancho visual
}

export const CATEGORIAS_GANCHOS = [
  'Número + Segredo',
  'Erro / Armadilha',
  'Verdade Chocante',
  'Antes e Depois',
  'Pergunta Provocativa',
  'Promessa Direta',
] as const

export type CategoriaGancho = typeof CATEGORIAS_GANCHOS[number]

export const BANCO_DE_GANCHOS: Gancho[] = [
  // ── NÚMERO + SEGREDO ──────────────────────────────────────
  { id: 1,  template: '[NÚMERO] coisas que eu nunca te contei sobre [ASSUNTO].',            categoria: 'Número + Segredo',   gatilho: 'Curiosidade',  visual: 'Lista animada com cada item surgindo' },
  { id: 2,  template: '[NÚMERO] dicas que vão mudar sua vida em [ÁREA].',                   categoria: 'Número + Segredo',   gatilho: 'Promessa',     visual: 'Contador numérico descendo' },
  { id: 3,  template: 'Os [NÚMERO] principais segredos para [SUCESSO EM ALGO].',            categoria: 'Número + Segredo',   gatilho: 'Exclusividade',visual: 'Animação de lista enumerada' },
  { id: 4,  template: 'Os [NÚMERO] hacks para economizar tempo em [ATIVIDADE].',            categoria: 'Número + Segredo',   gatilho: 'Eficiência',   visual: 'Ícones de relógio com setas rápidas' },
  { id: 5,  template: 'Os [NÚMERO] passos simples que você precisa para [OBJETIVO].',       categoria: 'Número + Segredo',   gatilho: 'Simplicidade', visual: 'Passos sendo completados' },
  { id: 6,  template: 'Os [NÚMERO] segredos que ninguém compartilha sobre [TÓPICO].',      categoria: 'Número + Segredo',   gatilho: 'Exclusividade',visual: 'Cofre com segredos numerados saindo' },
  { id: 7,  template: '[NÚMERO]% das pessoas erram nisso — e você pode estar entre elas.',  categoria: 'Número + Segredo',   gatilho: 'Medo de errar',visual: 'Gráfico circular destacando a porcentagem' },
  { id: 8,  template: 'Os [NÚMERO] mitos mais comuns sobre [ASSUNTO] desmascarados.',       categoria: 'Número + Segredo',   gatilho: 'Revelação',    visual: 'Balão estourando com "MITO" escrito' },

  // ── ERRO / ARMADILHA ──────────────────────────────────────
  { id: 9,  template: 'O maior erro que você está cometendo em [ATIVIDADE].',               categoria: 'Erro / Armadilha',   gatilho: 'Medo de errar',visual: 'Zoom no erro com alerta visual' },
  { id: 10, template: 'Nunca mais cometa este erro em [ATIVIDADE].',                         categoria: 'Erro / Armadilha',   gatilho: 'Urgência',     visual: 'Mão apontando para o erro com aviso' },
  { id: 11, template: 'Como evitar os [NÚMERO] maiores erros em [ATIVIDADE].',              categoria: 'Erro / Armadilha',   gatilho: 'Proteção',     visual: 'Lista com ícones de alerta' },
  { id: 12, template: 'Evite essas armadilhas ao tentar [OBJETIVO].',                        categoria: 'Erro / Armadilha',   gatilho: 'Proteção',     visual: 'Armadilha com etiqueta dizendo ERRO' },
  { id: 13, template: 'Você está fazendo isso errado e nem sabia!',                          categoria: 'Erro / Armadilha',   gatilho: 'Choque',       visual: 'X vermelho e depois ✔ verde na correção' },
  { id: 14, template: 'O erro que está custando [TEMPO/DINHEIRO/RESULTADOS] pra você.',     categoria: 'Erro / Armadilha',   gatilho: 'Dor financeira',visual: 'Cofre sendo esvaziado' },
  { id: 15, template: 'Os [NÚMERO] erros que você não pode cometer em [ÁREA].',             categoria: 'Erro / Armadilha',   gatilho: 'Medo de errar',visual: 'Lista com alertas vermelhos' },
  { id: 16, template: 'Você está sabotando seu próprio sucesso sem perceber.',               categoria: 'Erro / Armadilha',   gatilho: 'Identificação',visual: 'Pessoa tropeçando em algo invisível' },
  { id: 17, template: 'Nunca mais desperdice seu dinheiro com [MÉTODO COMUM].',             categoria: 'Erro / Armadilha',   gatilho: 'Dor financeira',visual: 'Carteira sendo esvaziada, depois alternativa' },
  { id: 18, template: 'Você está perdendo tempo tentando [ATIVIDADE] assim?',               categoria: 'Erro / Armadilha',   gatilho: 'Urgência',     visual: 'Relógio girando rapidamente' },
  { id: 19, template: 'Você está ignorando [FATOR IMPORTANTE] e isso pode custar caro.',    categoria: 'Erro / Armadilha',   gatilho: 'Medo de perda',visual: 'Conta alta com expressão de surpresa' },
  { id: 20, template: 'Você está focando na coisa errada para alcançar [RESULTADO].',        categoria: 'Erro / Armadilha',   gatilho: 'Revelação',    visual: 'Pessoa olhando direção oposta do alvo' },

  // ── VERDADE CHOCANTE ──────────────────────────────────────
  { id: 21, template: 'A verdade que ninguém te contou sobre [ASSUNTO].',                    categoria: 'Verdade Chocante',   gatilho: 'Curiosidade',  visual: 'Rosto confuso se transformando em AHA!' },
  { id: 22, template: 'Por que ninguém fala sobre isso em [ÁREA ESPECÍFICA]?',               categoria: 'Verdade Chocante',   gatilho: 'Exclusividade',visual: 'Balão com ponto de interrogação grande' },
  { id: 23, template: 'A verdade chocante por trás de [ASSUNTO].',                            categoria: 'Verdade Chocante',   gatilho: 'Choque',       visual: 'Close-up de olhos arregalados' },
  { id: 24, template: 'Você nunca mais vai olhar para [ASSUNTO] da mesma forma.',             categoria: 'Verdade Chocante',   gatilho: 'Transformação',visual: 'Algo comum sendo transformado em surpreendente' },
  { id: 25, template: 'Por que ninguém fala sobre esta solução para [PROBLEMA].',             categoria: 'Verdade Chocante',   gatilho: 'Exclusividade',visual: 'Boca com zíper (segredo)' },
  { id: 26, template: 'Descubra por que [AÇÃO COMUM] pode ser prejudicial.',                  categoria: 'Verdade Chocante',   gatilho: 'Choque',       visual: 'Símbolo de perigo associado à ação' },
  { id: 27, template: 'A verdade brutal sobre [ASSUNTO].',                                    categoria: 'Verdade Chocante',   gatilho: 'Autoridade',   visual: 'Rachadura revelando o que está por trás' },
  { id: 28, template: 'Por que [TÁTICA POPULAR] pode não ser a melhor solução.',             categoria: 'Verdade Chocante',   gatilho: 'Revelação',    visual: 'X em algo convencional, nova abordagem' },
  { id: 29, template: 'Por que o jeito tradicional de [ATIVIDADE] está ultrapassado.',       categoria: 'Verdade Chocante',   gatilho: 'Urgência',     visual: 'Item antigo sendo substituído por moderno' },
  { id: 30, template: 'Descubra por que tantas pessoas estão falhando em [ATIVIDADE].',      categoria: 'Verdade Chocante',   gatilho: 'Identificação',visual: 'Marcador de falha em vermelho piscando' },

  // ── ANTES E DEPOIS ────────────────────────────────────────
  { id: 31, template: 'Como [FAMOSO OU ESPECIALISTA] alcançou [REALIZAÇÃO]?',                categoria: 'Antes e Depois',     gatilho: 'Prova social',  visual: 'Imagem ou ilustração do especialista' },
  { id: 32, template: 'Como eu consegui [RESULTADO] em apenas [TEMPO CURTO].',              categoria: 'Antes e Depois',     gatilho: 'Prova pessoal', visual: 'Linha de tempo antes e depois' },
  { id: 33, template: 'Como eu saí de [SITUAÇÃO RUIM] para [RESULTADO INCRÍVEL].',          categoria: 'Antes e Depois',     gatilho: 'Identificação', visual: 'Jornada visual de transformação' },
  { id: 34, template: 'Como [ATIVIDADE] pode melhorar sua vida em [NÚMERO] dias.',          categoria: 'Antes e Depois',     gatilho: 'Velocidade',    visual: 'Calendário com dias sendo marcados' },
  { id: 35, template: 'A dica que mudou completamente meu jeito de [ATIVIDADE].',           categoria: 'Antes e Depois',     gatilho: 'Curiosidade',   visual: 'Lâmpada acendendo (ideia brilhante)' },
  { id: 36, template: '[RESULTADO] em [TEMPO CURTO] pode ser possível pra você.',           categoria: 'Antes e Depois',     gatilho: 'Velocidade',    visual: 'Cronômetro ou linha do tempo acelerada' },
  { id: 37, template: 'Como [PRODUTO OU SERVIÇO] pode mudar sua vida.',                     categoria: 'Antes e Depois',     gatilho: 'Promessa',      visual: 'Pessoa feliz após usar o produto' },
  { id: 38, template: 'A técnica secreta que os especialistas usam em [CAMPO].',             categoria: 'Antes e Depois',     gatilho: 'Exclusividade', visual: 'Cofre se abrindo revelando a técnica' },

  // ── PERGUNTA PROVOCATIVA ──────────────────────────────────
  { id: 39, template: 'Você sabia que [FATO SURPREENDENTE]?',                                categoria: 'Pergunta Provocativa', gatilho: 'Curiosidade',  visual: 'Expressão de surpresa ou ponto de interrogação' },
  { id: 40, template: 'Você está perdendo [BENEFÍCIO] por não saber disso.',                 categoria: 'Pergunta Provocativa', gatilho: 'Medo de perda',visual: 'Expressão de frustração/decepção' },
  { id: 41, template: 'Você está subestimando o poder de [FERRAMENTA OU MÉTODO].',          categoria: 'Pergunta Provocativa', gatilho: 'Revelação',    visual: 'Lupa ampliando a ferramenta' },
  { id: 42, template: 'Você está preparado para [EVENTO OU MUDANÇA IMINENTE]?',             categoria: 'Pergunta Provocativa', gatilho: 'Urgência',     visual: 'Relógio em contagem regressiva' },
  { id: 43, template: 'Você está fazendo mais esforço do que precisa para [ATIVIDADE]?',    categoria: 'Pergunta Provocativa', gatilho: 'Eficiência',   visual: 'Comparação lado a lado de abordagens' },
  { id: 44, template: 'Você sabia que pode [RESULTADO] sem [OBJEÇÃO COMUM]?',               categoria: 'Pergunta Provocativa', gatilho: 'Remoção de barreira', visual: 'Ícone de proibido em algo difícil' },
  { id: 45, template: 'Você já tentou isso? Pode mudar completamente seu [RESULTADO].',     categoria: 'Pergunta Provocativa', gatilho: 'Curiosidade',  visual: 'Antes e depois com foco no impacto positivo' },
  { id: 46, template: 'Você já se perguntou por que [RESULTADO] é tão difícil de alcançar?',categoria: 'Pergunta Provocativa', gatilho: 'Identificação',visual: 'Montanha difícil de escalar com solução no topo' },
  { id: 47, template: 'Você já percebeu que [FATO CURIOSO] pode te ajudar a [RESULTADO]?', categoria: 'Pergunta Provocativa', gatilho: 'Curiosidade',  visual: 'Algo inusitado sendo usado de forma útil' },
  { id: 48, template: 'Você já tentou [ESTRATÉGIA] para [OBJETIVO]?',                       categoria: 'Pergunta Provocativa', gatilho: 'Curiosidade',  visual: 'Interrogação gigante aparecendo' },
  { id: 49, template: 'Você está pronto para [RESULTADO INCRÍVEL]?',                         categoria: 'Pergunta Provocativa', gatilho: 'Antecipação',  visual: 'Botão de START ou PRONTO' },
  { id: 50, template: 'Apenas [NÚMERO]% das pessoas fazem isso certo. Você está nesse grupo?', categoria: 'Pergunta Provocativa', gatilho: 'Identidade', visual: 'Gráfico circular destacando a porcentagem' },
  { id: 51, template: 'Você está subestimando o impacto de [AÇÃO PEQUENA]?',                categoria: 'Pergunta Provocativa', gatilho: 'Revelação',    visual: 'Faísca virando fogo' },

  // ── PROMESSA DIRETA ───────────────────────────────────────
  { id: 52, template: 'A solução definitiva para [PROBLEMA COMUM].',                         categoria: 'Promessa Direta',    gatilho: 'Promessa',     visual: 'Quebra-cabeça sendo completado' },
  { id: 53, template: 'Como [ATIVIDADE] pode economizar seu tempo e dinheiro.',              categoria: 'Promessa Direta',    gatilho: 'Eficiência',   visual: 'Relógio e notas lado a lado' },
  { id: 54, template: 'O guia definitivo para [TÓPICO ESPECÍFICO].',                         categoria: 'Promessa Direta',    gatilho: 'Completude',   visual: 'Livro intitulado com o tópico' },
  { id: 55, template: 'O método simples que ninguém está te contando para [RESULTADO].',    categoria: 'Promessa Direta',    gatilho: 'Exclusividade',visual: 'Papel com MÉTODO sendo rasgado' },
  { id: 56, template: 'A maneira mais rápida de [ALCANÇAR UM OBJETIVO].',                   categoria: 'Promessa Direta',    gatilho: 'Velocidade',   visual: 'Estrada reta e livre' },
  { id: 57, template: 'O que você precisa saber antes de [FAZER ALGO].',                    categoria: 'Promessa Direta',    gatilho: 'Proteção',     visual: 'Sinal de ATENÇÃO ou AVISO' },
  { id: 58, template: 'Como você pode começar a [ATIVIDADE] hoje mesmo.',                   categoria: 'Promessa Direta',    gatilho: 'Urgência',     visual: 'Lista de passos fáceis com checkmarks' },
  { id: 59, template: 'Descubra como [ATIVIDADE] pode ser feita de maneira simples.',       categoria: 'Promessa Direta',    gatilho: 'Simplicidade', visual: 'Comparação abordagem complicada vs simples' },
  { id: 60, template: 'Por que [RESULTADO DESEJADO] é mais fácil do que parece.',           categoria: 'Promessa Direta',    gatilho: 'Esperança',    visual: 'Escada simples ou gráfico de progresso' },
  { id: 61, template: 'A única coisa que você precisa para começar [ATIVIDADE].',           categoria: 'Promessa Direta',    gatilho: 'Simplicidade', visual: 'Ferramenta ou recurso essencial em destaque' },
  { id: 62, template: 'Como [ATIVIDADE] pode transformar sua [VIDA/CARREIRA/NEGÓCIO].',     categoria: 'Promessa Direta',    gatilho: 'Transformação',visual: 'Pessoa dando salto de sucesso' },
  { id: 63, template: 'Descubra como evitar [PROBLEMA] de uma vez por todas.',              categoria: 'Promessa Direta',    gatilho: 'Alívio',       visual: 'Cadeado sendo fechado' },
  { id: 64, template: 'Como transformar [PROBLEMA] em uma oportunidade.',                    categoria: 'Promessa Direta',    gatilho: 'Reframe',      visual: 'Seta virando 180°' },
  { id: 65, template: 'A fórmula que me ajudou a [RESULTADO DESEJADO].',                    categoria: 'Promessa Direta',    gatilho: 'Sistematização',visual: 'Quadro com fórmula sendo escrita' },
  { id: 66, template: 'O atalho que pode mudar sua maneira de [ATIVIDADE].',                categoria: 'Promessa Direta',    gatilho: 'Eficiência',   visual: 'Caminho tortuoso substituído por estrada reta' },
  { id: 67, template: 'Descubra como [RESULTADO DESEJADO] é mais simples do que você pensa.', categoria: 'Promessa Direta', gatilho: 'Esperança',    visual: 'Complexidade sendo reduzida visualmente' },
  { id: 68, template: 'Pare de acreditar que [OBJEÇÃO COMUM] te impede de [RESULTADO].',   categoria: 'Promessa Direta',    gatilho: 'Remoção de barreira', visual: 'Objeção sendo apagada ou destruída' },
  { id: 69, template: 'Como evitar [PROBLEMA] mesmo que você esteja começando agora.',      categoria: 'Promessa Direta',    gatilho: 'Inclusão',     visual: 'Mapa com X marcando perigo e rota alternativa' },
  { id: 70, template: 'Como superar [DESAFIO COMUM] sem [OBJEÇÃO].',                        categoria: 'Promessa Direta',    gatilho: 'Superação',    visual: 'Escada sobre um buraco' },
  { id: 71, template: 'O truque que transforma [ATIVIDADE] em algo fácil.',                 categoria: 'Promessa Direta',    gatilho: 'Magia/Facilidade', visual: 'Varinha mágica fazendo antes e depois' },
  { id: 72, template: 'Descubra como pequenas mudanças podem gerar grandes resultados em [ÁREA].', categoria: 'Promessa Direta', gatilho: 'Esperança', visual: 'Efeito dominó começando com algo pequeno' },
  { id: 73, template: 'Descubra como pequenos ajustes podem gerar um impacto gigante.',     categoria: 'Promessa Direta',    gatilho: 'Esperança',    visual: 'Parafuso sendo apertado ativando máquina' },
  { id: 74, template: 'A mudança simples que pode gerar grandes resultados.',                categoria: 'Promessa Direta',    gatilho: 'Simplicidade', visual: 'Engrenagem pequena acionando grande mecanismo' },
  { id: 75, template: 'O método que funciona, mesmo quando tudo parece dar errado.',        categoria: 'Promessa Direta',    gatilho: 'Resiliência',  visual: 'Lâmpada se acendendo no escuro' },
  { id: 76, template: 'Por que você não precisa de [ALGO COMUM] para alcançar [OBJETIVO].', categoria: 'Promessa Direta',   gatilho: 'Remoção de barreira', visual: 'Algo sendo riscado e substituído' },
  { id: 77, template: 'Como transformar [RECURSO LIMITADO] em [GRANDE VANTAGEM].',          categoria: 'Promessa Direta',    gatilho: 'Criatividade', visual: 'Algo pequeno se expandindo para algo grandioso' },
  { id: 78, template: 'Como [ATIVIDADE] pode ser divertida e produtiva ao mesmo tempo.',    categoria: 'Promessa Direta',    gatilho: 'Prazer',       visual: 'Pessoas sorrindo enquanto trabalham' },
  { id: 79, template: 'Por que [SOLUÇÃO INESPERADA] funciona melhor do que [SOLUÇÃO COMUM].', categoria: 'Promessa Direta', gatilho: 'Revelação',    visual: 'Gráfico comparando as duas soluções' },
  { id: 80, template: 'Por que você não precisa mais de [SOLUÇÃO COMUM] para [RESULTADO].', categoria: 'Promessa Direta',    gatilho: 'Libertação',   visual: 'Balde furado sendo substituído por funcional' },

  // ── EXTRAS ────────────────────────────────────────────────
  { id: 81, template: 'Você está subestimando o poder de [FERRAMENTA].',                    categoria: 'Pergunta Provocativa', gatilho: 'Revelação',  visual: 'Lupa ampliando a ferramenta' },
  { id: 82, template: 'Pare de acreditar nesses mitos sobre [TÓPICO].',                     categoria: 'Verdade Chocante',   gatilho: 'Desconstrução',visual: 'Balões com mitos estourando' },
  { id: 83, template: 'A solução que você nunca imaginou para [PROBLEMA].',                  categoria: 'Promessa Direta',    gatilho: 'Surpresa',     visual: 'Objeto inusitado sendo apresentado como resposta' },
  { id: 84, template: 'O segredo que apenas os melhores conhecem sobre [ATIVIDADE].',       categoria: 'Número + Segredo',   gatilho: 'Exclusividade',visual: 'Cadeado se abrindo' },
  { id: 85, template: 'Por que [TÓPICO] está sendo ignorado, mas não deveria.',             categoria: 'Verdade Chocante',   gatilho: 'Urgência',     visual: 'Alerta vermelho piscando com IMPORTANTE' },
  { id: 86, template: 'O que você pode aprender com [EXEMPLO DE SUCESSO].',                 categoria: 'Antes e Depois',     gatilho: 'Prova social',  visual: 'Troféu ou medalha' },
  { id: 87, template: 'O que diferencia os melhores em [ÁREA].',                             categoria: 'Número + Segredo',   gatilho: 'Aspiração',    visual: 'Pessoa destacada em um grupo' },
  { id: 88, template: 'A diferença entre sucesso e fracasso em [ATIVIDADE].',               categoria: 'Verdade Chocante',   gatilho: 'Contraste',    visual: 'Balança mostrando sucesso vs fracasso' },
  { id: 89, template: 'Como [ATIVIDADE] pode mudar a forma como você vê [ASSUNTO].',        categoria: 'Antes e Depois',     gatilho: 'Transformação',visual: 'Lente ou binóculo ajustando o foco' },
  { id: 90, template: 'O que [REFERÊNCIA FAMOSA] faz diferente que você pode aplicar.',     categoria: 'Antes e Depois',     gatilho: 'Prova social',  visual: 'Ícone de aprendizado imitando outra pessoa' },
  { id: 91, template: 'Descubra como [RESULTADO INCRÍVEL] pode ser possível.',               categoria: 'Promessa Direta',    gatilho: 'Esperança',    visual: 'Porta se abrindo para um horizonte' },
  { id: 92, template: 'Por que [ATIVIDADE] nunca funcionou para você (até agora).',         categoria: 'Erro / Armadilha',   gatilho: 'Identificação',visual: 'Frustrado e depois sorrindo ao encontrar solução' },
  { id: 93, template: 'O erro que [NÚMERO] de [NICHO] cometem toda semana.',                categoria: 'Erro / Armadilha',   gatilho: 'Identificação',visual: 'Pessoa reconhecendo o próprio erro' },
  { id: 94, template: 'Como [RESULTADO] em [TEMPO CURTO] ainda é possível hoje.',           categoria: 'Promessa Direta',    gatilho: 'Urgência',     visual: 'Calendário com destaque na data' },
  { id: 95, template: 'A técnica de [ÁREA] que está tomando conta de [PLATAFORMA].',        categoria: 'Verdade Chocante',   gatilho: 'Tendência',    visual: 'Gráfico de crescimento explosivo' },
  { id: 96, template: 'Você sabia que [DADO IMPRESSIONANTE] sobre [NICHO]?',                categoria: 'Pergunta Provocativa', gatilho: 'Choque',     visual: 'Número grande aparecendo na tela' },
  { id: 97, template: 'A razão pela qual 90% de [NICHO] nunca consegue [RESULTADO].',       categoria: 'Verdade Chocante',   gatilho: 'Autoridade',   visual: 'Porcentagem em gráfico com destaque' },
  { id: 98, template: 'Faça isso antes de postar qualquer [CONTEÚDO] amanhã.',              categoria: 'Promessa Direta',    gatilho: 'Urgência',     visual: 'Relógio com contagem regressiva' },
  { id: 99, template: 'Ninguém te contou isso porque não querem que você [RESULTADO].',     categoria: 'Verdade Chocante',   gatilho: 'Conspiração',  visual: 'Boca tapada com a mão' },
  { id: 100,template: 'Descubra como [PEQUENO ESFORÇO] pode gerar [GRANDE RESULTADO].',    categoria: 'Promessa Direta',    gatilho: 'Esperança',    visual: 'Algo pequeno explodindo em algo grandioso' },
]

// ── Helpers ──────────────────────────────────────────────────

export function getGanchosByCategoria(categoria: string): Gancho[] {
  return BANCO_DE_GANCHOS.filter(g => g.categoria === categoria)
}

export function getGanchoById(id: number): Gancho | undefined {
  return BANCO_DE_GANCHOS.find(g => g.id === id)
}

export function getRandomGancho(categoria?: string): Gancho {
  const pool = categoria
    ? getGanchosByCategoria(categoria)
    : BANCO_DE_GANCHOS
  return pool[Math.floor(Math.random() * pool.length)]
}

// ── Prompt string para injeção no sistema da IA ──────────────
export const GANCHOS_PARA_PROMPT = `
=== BANCO DE GANCHOS VIRAIS — REFERÊNCIA OBRIGATÓRIA ===

REGRAS CRÍTICAS PARA O BLOCO [GANCHO]:
1. MÁXIMO 12 palavras. Uma frase. Impacto total.
2. NUNCA use [VARIÁVEL] literalmente — adapte ao nicho REAL do criador.
3. Use número real, ação concreta, ou dado chocante — NUNCA vago.
4. Proibido começar com: "Hoje", "Bem", "Olá", "Vou te mostrar", "Neste vídeo".
5. O gancho deve causar uma REAÇÃO FÍSICA de parar o scroll.

--- EXEMPLOS CONCRETOS PRONTOS (modele neste nível de especificidade) ---

ERRO / ARMADILHA — use quando o público tem um comportamento errado comum:
× genérico: "O erro que você está cometendo nas redes sociais."
✓ viral: "Você está postando todo dia e não cresce porque faz isso num minuto de vídeo."
✓ viral: "90% dos criadores apagam posts que iriam viralizar por esse motivo."
✓ viral: "Você está perdendo seguidores toda semana por não desativar esse botão."

VERDADE CHOCANTE — use quando vai quebrar uma crença popular:
× genérico: "A verdade sobre crescer no Instagram."
✓ viral: "Ter mais seguidores não aumenta seu faturamento — e vou provar isso agora."
✓ viral: "O algoritmo não recompensa quem posta mais. Recompensa quem faz isso."
✓ viral: "Ninguém te contou que consistência sem estratégia é só cansaço."

PERGUNTA PROVOCATIVA — use quando quer identificação imediata:
× genérico: "Você sabia que pode crescer nas redes sem gastar nada?"
✓ viral: "Você tem menos de 10k seguidores? Então você está cometendo esse erro."
✓ viral: "Por que pessoas com metade do seu esforço faturam 3x mais que você?"
✓ viral: "Você posta todo dia e sente que ninguém vê — é isso mesmo?"

NÚMERO + SEGREDO — use quando tem lista ou dado numérico forte:
× genérico: "3 dicas para melhorar seu conteúdo."
✓ viral: "Esses 3 segundos iniciais determinam se seu vídeo vai a 100 ou 100 mil pessoas."
✓ viral: "Fiz 47 vídeos antes de ter o primeiro com 1 milhão de views — aprendi isso."
✓ viral: "A taxa de retenção de 60% no terceiro segundo é o que separa viral de invisível."

ANTES E DEPOIS — use quando tem transformação real para mostrar:
× genérico: "Como passei de 0 a 10k seguidores."
✓ viral: "Há 6 meses eu tinha 300 seguidores. Hoje são 40 mil. Mudei uma coisa só."
✓ viral: "Usei essa estrutura de roteiro e saí de 2% para 18% de engajamento em 30 dias."

PROMESSA DIRETA — use quando a solução é clara e imediata:
× genérico: "A fórmula para criar conteúdo viral."
✓ viral: "Copie essa estrutura de 3 blocos e seu próximo post vai durar 40% mais tempo."
✓ viral: "Em 60 segundos você vai entender por que seus vídeos param de crescer no dia 2."

--- REGRA DE OURO ---
O gancho é um anzol emocional. Se o criador pode ler sem sentir nada, reescreva.
Uma frase. Dado concreto. Tensão real. Máximo 12 palavras. Sem ponto de reticências no início.
=========================================================
`
