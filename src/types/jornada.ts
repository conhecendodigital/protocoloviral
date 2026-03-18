export interface Estacao {
  id: number
  nome: string
  icone: string
  fase: number
  marco: boolean
  descricao: string
  prompt: string
}

export interface Fase {
  numero: number
  nome: string
  icone: string
  range: string
}

export const FASES: Fase[] = [
  { numero: 1, nome: 'Início', icone: '🌱', range: '1-10' },
  { numero: 2, nome: 'Crescimento', icone: '📈', range: '11-20' },
  { numero: 3, nome: 'Autoridade', icone: '⭐', range: '21-30' },
]
