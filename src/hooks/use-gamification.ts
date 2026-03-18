'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getNivelByXP, getProgressoNivel } from '@/data/niveis'
import { ACHIEVEMENTS } from '@/data/achievements'

export function useGamification(xp: number = 0, conquistas: string[] = []) {
  const [currentXp, setCurrentXp] = useState(xp)
  const [currentConquistas, setCurrentConquistas] = useState<string[]>(conquistas)
  const supabase = createClient()

  const nivel = getNivelByXP(currentXp)
  const progresso = getProgressoNivel(currentXp)

  const addXp = useCallback(async (userId: string, amount: number) => {
    setCurrentXp(prev => prev + amount)
    try {
      await supabase.rpc('add_xp', { p_user_id: userId, p_amount: amount })
    } catch (e) {
      console.error('Erro ao adicionar XP:', e)
    }
  }, [supabase])

  const unlockAchievement = useCallback(async (userId: string, key: string) => {
    if (currentConquistas.includes(key)) return false

    const achievement = ACHIEVEMENTS[key]
    if (!achievement) return false

    setCurrentConquistas(prev => [...prev, key])
    setCurrentXp(prev => prev + achievement.xp)

    try {
      await supabase.from('achievements').insert({
        user_id: userId,
        achievement_key: key,
      })
      await supabase.rpc('add_xp', { p_user_id: userId, p_amount: achievement.xp })
    } catch (e) {
      console.error('Erro ao desbloquear conquista:', e)
    }

    return true
  }, [currentConquistas, supabase])

  const hasAchievement = useCallback((key: string) => {
    return currentConquistas.includes(key)
  }, [currentConquistas])

  return {
    xp: currentXp,
    nivel,
    progresso,
    conquistas: currentConquistas,
    addXp,
    unlockAchievement,
    hasAchievement,
  }
}
