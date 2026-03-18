export const MENSAGENS_MOTIVACIONAIS = [
  "Clareza é poder. Você está no caminho certo! 🎯",
  "Cada prompt te aproxima do conteúdo perfeito! 💪",
  "Consistência > Perfeição. Continue criando! 🔥",
  "Seu público está esperando por você! 📱",
  "Hoje é um ótimo dia para viralizar! 🚀",
  "Você está construindo algo incrível! 🌟",
  "A prática leva à maestria. Continue! 🏆",
  "Seu diferencial é ser você mesmo! ✨",
  "Conexão gera conversão. Conecte-se! 💬",
  "O melhor conteúdo é o autêntico! 🎬",
]

export function getMensagemMotivacional() {
  return MENSAGENS_MOTIVACIONAIS[Math.floor(Math.random() * MENSAGENS_MOTIVACIONAIS.length)]
}

export const BRAND = {
  name: 'Mapa do Engajamento',
  tagline: 'IA como apoio estratégico, não substituto da criatividade',
  author: '@omatheus.ai',
  colors: {
    primary: '#0ea5e9',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    success: '#10b981',
  },
}
