'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getNivelByXP, getProgressoNivel } from '@/data/niveis'
import { ACHIEVEMENTS } from '@/data/achievements'

const supabase = createClient()

export function useGamification(userId: string | undefined, xp: number = 0, conquistas: string[] = []) {
  const [currentXp, setCurrentXp] = useState(xp)
  const [currentConquistas, setCurrentConquistas] = useState<string[]>(conquistas)

  const nivel = getNivelByXP(currentXp)
  const progresso = getProgressoNivel(currentXp)

  const addXp = useCallback(async (amount: number) => {
    if (!userId) return
    try {
      await supabase.rpc('add_xp', { p_user_id: userId, p_amount: amount })
      setCurrentXp(prev => prev + amount)
    } catch (error) {
      console.error('[Gamification] Failed to add XP:', error)
    }
  }, [userId])

  const unlockAchievement = useCallback(async (key: string) => {
    if (!userId) return false
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
  }, [currentConquistas, supabase, userId])

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
