import type { Nivel } from '@/types/gamification'

export const NIVEIS: Nivel[] = [
  { nivel: 1, xp_min: 0,    xp_max: 100,   titulo: 'Iniciante',    cor: '#94a3b8', icone: 'Search' },
  { nivel: 2, xp_min: 100,  xp_max: 300,   titulo: 'Aprendiz',     cor: '#22c55e', icone: 'Sprout' },
  { nivel: 3, xp_min: 300,  xp_max: 600,   titulo: 'Criador',      cor: '#3b82f6', icone: 'Rocket' },
  { nivel: 4, xp_min: 600,  xp_max: 1000,  titulo: 'Expert',       cor: '#8b5cf6', icone: 'Brain' },
  { nivel: 5, xp_min: 1000, xp_max: 1500,  titulo: 'Mestre',       cor: '#f59e0b', icone: 'Crown' },
  { nivel: 6, xp_min: 1500, xp_max: 2500,  titulo: 'Viral Master', cor: '#ef4444', icone: 'Flame' },
  { nivel: 7, xp_min: 2500, xp_max: 10000, titulo: 'Lenda',        cor: '#ec4899', icone: 'Trophy' },
]

export function getNivelByXP(xp: number): Nivel {
  return NIVEIS.find(n => xp >= n.xp_min && xp < n.xp_max) || NIVEIS[NIVEIS.length - 1]
}

export function getProgressoNivel(xp: number): number {
  const nivel = getNivelByXP(xp)
  const xpNoNivel = xp - nivel.xp_min
  const xpTotalNivel = nivel.xp_max - nivel.xp_min
  return Math.round((xpNoNivel / xpTotalNivel) * 100)
}
