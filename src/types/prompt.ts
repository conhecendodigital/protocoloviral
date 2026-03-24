export type PromptType = 'clareza' | 'persona' | 'ideias' | 'roteiro' | 'vendas'

export interface PromptConfig {
  tipo: PromptType
  numero: number
  titulo: string
  subtitulo: string
  descricao: string
  icone: string
  cor: string
  dependencias: PromptType[]
  campoExtra?: {
    id: string
    label: string
    placeholder: string
  }
}

export const PROMPT_CONFIGS: Record<PromptType, PromptConfig> = {
  clareza: {
    tipo: 'clareza',
    numero: 1,
    titulo: 'Clareza',
    subtitulo: 'Saiba quem você é e o que te diferencia',
    descricao: 'Descubra o que você faz de melhor, como se apresentar e sobre o que falar.',
    icone: '🎯',
    cor: 'sky',
    dependencias: [],
  },
  persona: {
    tipo: 'persona',
    numero: 2,
    titulo: 'Persona',
    subtitulo: 'Entenda quem é seu público',
    descricao: 'Descubra quem são as pessoas que você quer atingir e o que elas precisam.',
    icone: '👥',
    cor: 'violet',
    dependencias: ['clareza'],
  },
  ideias: {
    tipo: 'ideias',
    numero: 3,
    titulo: 'Ideias',
    subtitulo: 'Nunca mais fique sem ideia',
    descricao: '20 ideias de conteúdo feitas sob medida para você.',
    icone: '💡',
    cor: 'amber',
    dependencias: ['clareza', 'persona'],
  },
  roteiro: {
    tipo: 'roteiro',
    numero: 4,
    titulo: 'Roteiro',
    subtitulo: 'Texto pronto para gravar',
    descricao: 'Transforme uma ideia em texto completo, pronto para gravar em vários formatos.',
    icone: '📝',
    cor: 'emerald',
    dependencias: ['persona'],
    campoExtra: {
      id: 'ideia_roteiro',
      label: 'Qual ideia você quer desenvolver?',
      placeholder: 'Cole aqui uma ideia do Prompt 3 ou escreva sua própria ideia...',
    },
  },
  vendas: {
    tipo: 'vendas',
    numero: 5,
    titulo: 'Vendas',
    subtitulo: 'Venda de forma natural',
    descricao: 'Um plano de 14 dias para vender sem parecer vendedor.',
    icone: '💰',
    cor: 'rose',
    dependencias: ['clareza', 'persona'],
    campoExtra: {
      id: 'produto_venda',
      label: 'Qual produto/serviço você quer vender?',
      placeholder: 'Descreva: nome, preço, público, o que entrega...',
    },
  },
}
