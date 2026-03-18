export interface Gancho {
  cat: string
  txt: string
  emoji: string
}

export const GANCHOS_VIRAIS: Gancho[] = [
  // CURIOSIDADE (10)
  { cat: 'Curiosidade', txt: 'O erro que 90% dos criadores cometem (e como evitar)', emoji: '🤔' },
  { cat: 'Curiosidade', txt: 'Ninguém te conta isso sobre o algoritmo do Instagram', emoji: '🔍' },
  { cat: 'Curiosidade', txt: 'Por que seus reels não viralizam? A resposta te choca', emoji: '😱' },
  { cat: 'Curiosidade', txt: 'O que aprendi analisando 1000 posts virais', emoji: '📊' },
  { cat: 'Curiosidade', txt: 'A verdade sobre comprar seguidores que ninguém fala', emoji: '🚫' },
  { cat: 'Curiosidade', txt: 'Descobri isso por acidente e mudou tudo', emoji: '💡' },
  { cat: 'Curiosidade', txt: 'O segredo que os grandes criadores escondem', emoji: '🤫' },
  { cat: 'Curiosidade', txt: 'Fiz um teste e o resultado me surpreendeu', emoji: '🧪' },
  { cat: 'Curiosidade', txt: 'Isso explica por que você não cresce', emoji: '🎯' },
  { cat: 'Curiosidade', txt: 'A única coisa que separa quem cresce de quem estagna', emoji: '📈' },
  // AUTORIDADE (10)
  { cat: 'Autoridade', txt: 'Depois de 10 mil seguidores, descobri que...', emoji: '📈' },
  { cat: 'Autoridade', txt: 'Como fui de 0 a 50k em 90 dias (passo a passo)', emoji: '🎯' },
  { cat: 'Autoridade', txt: '7 anos criando conteúdo me ensinaram isso', emoji: '🏆' },
  { cat: 'Autoridade', txt: 'Essa estratégia me gerou R$100k em 6 meses', emoji: '💰' },
  { cat: 'Autoridade', txt: 'O método que usei para viralizar 23 vezes seguidas', emoji: '🔥' },
  { cat: 'Autoridade', txt: 'Atendi 500 clientes e percebi um padrão', emoji: '👥' },
  { cat: 'Autoridade', txt: 'Meus primeiros 10k me ensinaram mais que qualquer curso', emoji: '📚' },
  { cat: 'Autoridade', txt: 'Já testei tudo. Só isso funciona de verdade:', emoji: '✅' },
  { cat: 'Autoridade', txt: 'O framework que uso em todas as minhas vendas', emoji: '🛠️' },
  { cat: 'Autoridade', txt: 'Analisei meus 100 melhores posts. Todos tinham isso:', emoji: '🔬' },
  // VULNERABILIDADE (8)
  { cat: 'Vulnerabilidade', txt: 'Perdi 50 mil reais aprendendo isso. Aqui está de graça:', emoji: '💔' },
  { cat: 'Vulnerabilidade', txt: 'Quando meu perfil zerou, aprendi a lição mais importante', emoji: '😢' },
  { cat: 'Vulnerabilidade', txt: 'O dia que quase desisti das redes sociais', emoji: '🥺' },
  { cat: 'Vulnerabilidade', txt: 'Meu maior fracasso me ensinou mais que 100 sucessos', emoji: '😔' },
  { cat: 'Vulnerabilidade', txt: 'Estava fazendo tudo errado até descobrir isso', emoji: '🤦' },
  { cat: 'Vulnerabilidade', txt: 'Fui humilhado nos comentários. Aqui está o que aprendi:', emoji: '💪' },
  { cat: 'Vulnerabilidade', txt: 'Travei por 6 meses. Isso me desbloqueou:', emoji: '🔓' },
  { cat: 'Vulnerabilidade', txt: 'Conteúdo que me deu vergonha de postar viralizou', emoji: '😳' },
  // CONTRAINTUITIVO (7)
  { cat: 'Contraintuitivo', txt: 'Pare de postar todo dia. Faça isso em vez disso:', emoji: '🚫' },
  { cat: 'Contraintuitivo', txt: 'Quanto menos você vender, mais você vende. Paradoxo real.', emoji: '🤯' },
  { cat: 'Contraintuitivo', txt: 'Ignorar métricas me fez crescer 300%. Entenda:', emoji: '📉' },
  { cat: 'Contraintuitivo', txt: 'O segredo não é criar mais, é criar menos (mas melhor)', emoji: '✂️' },
  { cat: 'Contraintuitivo', txt: 'Copiar seus concorrentes é o pior erro. Faça o oposto:', emoji: '🔄' },
  { cat: 'Contraintuitivo', txt: 'Parei de usar hashtags e cresci mais', emoji: '🏷️' },
  { cat: 'Contraintuitivo', txt: 'Não responda todos os comentários. Faça isso:', emoji: '💬' },
  // URGÊNCIA (5)
  { cat: 'Urgência', txt: 'Isso vai mudar em 2025. Se prepare agora:', emoji: '⚠️' },
  { cat: 'Urgência', txt: 'Você tem 30 dias antes do algoritmo mudar tudo', emoji: '⏰' },
  { cat: 'Urgência', txt: 'Se não fizer isso hoje, vai se arrepender amanhã', emoji: '🚨' },
  { cat: 'Urgência', txt: 'Última chamada: essa janela fecha em breve', emoji: '⌛' },
  { cat: 'Urgência', txt: 'Agora ou nunca: o momento é agora', emoji: '⚡' },
  // PROVA SOCIAL (5)
  { cat: 'Prova Social', txt: '387 alunos fizeram isso e cresceram. Você é o próximo?', emoji: '👥' },
  { cat: 'Prova Social', txt: 'Caso real: de 500 para 50k fazendo exatamente isso', emoji: '📱' },
  { cat: 'Prova Social', txt: 'O que 1000+ criadores têm em comum (spoiler: não é sorte)', emoji: '🌟' },
  { cat: 'Prova Social', txt: 'Resultados reais de quem aplicou esse método', emoji: '✅' },
  { cat: 'Prova Social', txt: '9 em cada 10 creators que fazem isso crescem 5x', emoji: '📊' },
  // LISTA/NÚMERO (5)
  { cat: 'Lista', txt: '5 sinais de que seu conteúdo vai viralizar (checklist)', emoji: '📝' },
  { cat: 'Lista', txt: '3 coisas que todo viral tem (e você ignora)', emoji: '3️⃣' },
  { cat: 'Lista', txt: '7 erros que matam seu engajamento (pare agora)', emoji: '⛔' },
  { cat: 'Lista', txt: '10 gatilhos mentais que aumentam views em 400%', emoji: '🧠' },
  { cat: 'Lista', txt: 'As 4 únicas métricas que importam (esqueça o resto)', emoji: '📈' },
]

export interface CategoriaGancho {
  id: string
  nome: string
  emoji: string
}

export const CATEGORIAS_GANCHOS: CategoriaGancho[] = [
  { id: 'all', nome: 'Todos', emoji: '📚' },
  { id: 'Curiosidade', nome: 'Curiosidade', emoji: '🤔' },
  { id: 'Autoridade', nome: 'Autoridade', emoji: '🏆' },
  { id: 'Vulnerabilidade', nome: 'Vulnerabilidade', emoji: '💔' },
  { id: 'Contraintuitivo', nome: 'Contraintuitivo', emoji: '🤯' },
  { id: 'Urgência', nome: 'Urgência', emoji: '⚡' },
  { id: 'Prova Social', nome: 'Prova Social', emoji: '👥' },
  { id: 'Lista', nome: 'Listas', emoji: '📝' },
]
