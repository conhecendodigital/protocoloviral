export interface Nivel {
  nivel: number
  xp_min: number
  xp_max: number
  titulo: string
  cor: string
  icone: string
}

export interface Achievement {
  key: string
  name: string
  description: string
  icon: string
  xp: number
}

export interface GamificationState {
  xp: number
  nivel: number
  titulo: string
  conquistas: string[]
  streak: number
}
