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
    subtitulo: 'Descubra seu posicionamento único',
    descricao: 'Defina sua mensagem central, diferencial competitivo e pilares de conteúdo.',
    icone: '🎯',
    cor: 'sky',
    dependencias: [],
  },
  persona: {
    tipo: 'persona',
    numero: 2,
    titulo: 'Persona',
    subtitulo: 'Defina seu cliente ideal',
    descricao: 'Crie um perfil psicológico e comportamental completo do seu público.',
    icone: '👥',
    cor: 'violet',
    dependencias: ['clareza'],
  },
  ideias: {
    tipo: 'ideias',
    numero: 3,
    titulo: 'Ideias',
    subtitulo: 'Gere ideias de conteúdo',
    descricao: '20 ideias personalizadas com o Método NOEIXO para nunca mais travar.',
    icone: '💡',
    cor: 'amber',
    dependencias: ['clareza', 'persona'],
  },
  roteiro: {
    tipo: 'roteiro',
    numero: 4,
    titulo: 'Roteiro',
    subtitulo: 'Crie roteiros completos',
    descricao: 'Transforme uma ideia em conteúdo pronto para gravar em múltiplos formatos.',
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
    subtitulo: 'Venda sem forçar',
    descricao: 'Estratégia de 14 dias para vender com autenticidade e conexão.',
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
