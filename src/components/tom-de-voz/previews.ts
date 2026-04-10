// Templates de preview para o wizard de Tom de Voz
// Atualizados em tempo real conforme o usuário seleciona opções

interface PreviewData {
  gancho: string
  desenvolvimento: string
  cta: string
}

type Relacao = 'professor' | 'amigo' | 'provocador' | 'mentor' | 'comediante' | 'hipeman'
type Registro = 'informal' | 'coloquial' | 'polido'

// Chave: `${relacao}-${registro}`
const PREVIEW_MAP: Record<string, PreviewData> = {
  // PROFESSOR
  'professor-informal': {
    gancho: 'E aí, bora aprender um bagulho que ninguém te ensina por aí? Cola aqui.',
    desenvolvimento: 'Funciona assim ó: primeiro você faz X, depois Y. Simples, mas a maioria erra porque pula o passo do meio. Vou te mostrar direitinho.',
    cta: 'Salva esse vídeo pra não esquecer e manda pro amigo que precisa aprender isso também.',
  },
  'professor-coloquial': {
    gancho: 'Tem um conceito que eu demorei anos pra entender. Vou te explicar em 1 minuto.',
    desenvolvimento: 'O que acontece é o seguinte: a maioria das pessoas foca no resultado, mas esquece do processo. Quando você entende o porquê, o como fica natural.',
    cta: 'Se fez sentido, salva e compartilha com quem precisa ouvir isso.',
  },
  'professor-polido': {
    gancho: 'Existe um princípio fundamental que separa quem consegue resultados de quem fica estagnado.',
    desenvolvimento: 'Permita-me explicar: o verdadeiro diferencial não está na técnica, mas na compreensão profunda do processo. Três etapas são essenciais para dominar esse conceito.',
    cta: 'Salve este conteúdo para referência futura e compartilhe com quem pode se beneficiar.',
  },

  // AMIGO
  'amigo-informal': {
    gancho: 'Mano, cê não vai acreditar no que eu descobri. Para tudo e ouve isso.',
    desenvolvimento: 'Tipo, sabe quando cê tá fazendo de tudo e nada funciona? Então, o problema não é esforço — é direção. Deixa eu te contar o que mudou meu jogo.',
    cta: 'Bora? Se curtiu, manda pros brothers. Nóis junto!',
  },
  'amigo-coloquial': {
    gancho: 'Cara, eu descobri um negócio que mudou completamente meus vídeos. Sério, presta atenção.',
    desenvolvimento: 'Tipo, o que acontece é o seguinte: a galera foca muito em número e esquece do mais importante. A real é que se você se conectar de verdade com quem te assiste, o algoritmo trabalha a seu favor.',
    cta: 'Se isso te ajudou, salva aí e manda pra aquele amigo que precisa ouvir isso.',
  },
  'amigo-polido': {
    gancho: 'Preciso compartilhar algo que mudou minha perspectiva por completo. Vale a pena ouvir.',
    desenvolvimento: 'O que percebi foi que muitas pessoas investem energia na direção errada. A verdade é que quando você ajusta o foco, os resultados aparecem de forma natural.',
    cta: 'Se isso fez sentido pra você, salve e envie para alguém que precisa dessa reflexão.',
  },

  // PROVOCADOR
  'provocador-informal': {
    gancho: 'Parem de fazer isso. Sério, é ridículo. Vou falar na lata.',
    desenvolvimento: 'Cê tá perdendo tempo com besteira que não funciona e sabe disso. O problema é que ninguém tem coragem de te falar. Eu tenho. A real é essa aqui ó...',
    cta: 'Se doeu, é porque era pra você. Comenta aí o que achou — sem mimimi.',
  },
  'provocador-coloquial': {
    gancho: 'Se você ainda faz isso, desculpa, mas você tá ficando pra trás.',
    desenvolvimento: 'Eu sei que dói ouvir, mas alguém precisa falar: essa estratégia que todo mundo usa já morreu. Quem tá crescendo de verdade faz diferente. Deixa eu te mostrar.',
    cta: 'Concorda ou discorda? Comenta aqui embaixo. Quero saber sua opinião de verdade.',
  },
  'provocador-polido': {
    gancho: 'Há um equívoco comum que está sabotando sua estratégia. Permita-me ser direto.',
    desenvolvimento: 'A abordagem convencional que a maioria adota está fundamentalmente ultrapassada. Os profissionais que realmente se destacam operam com uma mentalidade completamente diferente.',
    cta: 'Reflita honestamente: você está inovando ou repetindo padrões que já não funcionam?',
  },

  // MENTOR
  'mentor-informal': {
    gancho: 'Ó, vou te falar uma parada que eu aprendi na marra. Presta atenção.',
    desenvolvimento: 'Já passei por isso que cê tá passando. Errei muito até descobrir que o segredo tá nos detalhes que a gente ignora. Deixa eu te poupar tempo e dor de cabeça.',
    cta: 'Confia no processo. Salva esse vídeo e começa a aplicar HOJE.',
  },
  'mentor-coloquial': {
    gancho: 'Vou compartilhar algo que eu precisei de 5 anos pra aprender. Você pode aprender em 5 minutos.',
    desenvolvimento: 'Quando eu comecei, errei exatamente onde você provavelmente está errando agora. A diferença entre quem cresce e quem estagna é uma coisa só: consistência aplicada na direção certa.',
    cta: 'Primeira ação: escolha uma coisa desse vídeo e aplique hoje. Me conta o resultado.',
  },
  'mentor-polido': {
    gancho: 'Nos meus anos de experiência, identifiquei um padrão que diferencia os que alcançam resultados.',
    desenvolvimento: 'O que a experiência me ensinou é que o sucesso sustentável exige disciplina estratégica. Não se trata de trabalhar mais, mas de trabalhar com inteligência e direção clara.',
    cta: 'Defina sua próxima ação concreta com base nesse aprendizado. Resultados nascem de decisões.',
  },

  // COMEDIANTE
  'comediante-informal': {
    gancho: 'Mano, eu fiz uma coisa tão burra que preciso contar kkk. Cola aí.',
    desenvolvimento: 'Tipo, imagina a cena: eu lá achando que era o rei do conteúdo e aí o algoritmo me deu um tapa na cara. Foi tão feio que eu ri de nervoso. Mas sabe o que eu aprendi?',
    cta: 'Se você já passou vergonha também, comenta aí. Sofremos juntos kkkk',
  },
  'comediante-coloquial': {
    gancho: 'Vocês não estão preparados pro que eu vou contar. É trágico e cômico ao mesmo tempo.',
    desenvolvimento: 'Então, aconteceu uma coisa comigo que é o tipo de situação que você ri pra não chorar. Mas por trás da piada tem uma lição que vale ouro. Olha só...',
    cta: 'Ri, mas aprendeu? Então salva e manda pra quem precisa rir e aprender também.',
  },
  'comediante-polido': {
    gancho: 'Permita-me narrar um episódio que é simultaneamente constrangedor e instrutivo.',
    desenvolvimento: 'O que aconteceu foi, digamos, um desastre elegante. Mas como costumo dizer: de erros refinados nascem lições valiosas. A situação me ensinou algo que livros não ensinam.',
    cta: 'Espero que meu constrangimento tenha sido útil. Compartilhe com quem aprecia aprender rindo.',
  },

  // HIPEMAN
  'hipeman-informal': {
    gancho: 'BORA! Chega de desculpa! Hoje é dia de virar o jogo! 🔥',
    desenvolvimento: 'Escuta, cê tem dois caminhos: continuar reclamando ou levantar e fazer acontecer. Eu escolhi fazer. E adivinha? Mudou TUDO. Agora é sua vez!',
    cta: 'Comenta EU VOU se você tá pronto pra mudar! Sem medo, sem frescura! 🚀',
  },
  'hipeman-coloquial': {
    gancho: 'Esse é o momento. Se não for agora, vai ser quando? Presta atenção!',
    desenvolvimento: 'Eu sei que parece difícil, mas toda grande mudança começa com uma decisão. Você tem capacidade. Você tem potencial. O que falta é dar o primeiro passo com convicção.',
    cta: 'Tá esperando o quê? Comenta aqui sua meta e se comprometa publicamente. Vamos juntos!',
  },
  'hipeman-polido': {
    gancho: 'Este é precisamente o momento de tomar uma decisão transformadora na sua trajetória.',
    desenvolvimento: 'Acredito genuinamente no potencial de cada pessoa que está assistindo isso. O diferencial não é talento — é determinação aliada à estratégia correta. Chegou sua hora.',
    cta: 'Assuma o compromisso com você mesmo. Registre sua meta nos comentários e honre-a.',
  },
}

export function getPreview(relacao?: Relacao, registro?: Registro): PreviewData {
  const key = `${relacao || 'amigo'}-${registro || 'coloquial'}`
  return PREVIEW_MAP[key] || PREVIEW_MAP['amigo-coloquial']
}

export function getRegistroLabel(registro?: Registro): string {
  if (registro === 'informal') return 'Informal'
  if (registro === 'polido') return 'Polido'
  return 'Coloquial'
}

export function getEnergiaLabel(energia?: string): string {
  if (energia === 'alta') return 'Alta'
  if (energia === 'baixa') return 'Baixa'
  return 'Média'
}
