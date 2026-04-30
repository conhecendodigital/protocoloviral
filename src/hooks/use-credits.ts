'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface CreditosMensais {
  id: string
  user_id: string
  credits_total: number
  credits_used: number
  cycle_start: string
  cycle_end: string
}

export function useCredits() {
  const [creditsData, setCreditsData] = useState<CreditosMensais | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchCredits()
  }, [])

  const fetchCredits = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('creditos_mensais')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Record doesn't exist, create it (new user)
          const newCredit = await createInitialCredits(user.id)
          setCreditsData(newCredit)
        } else {
          throw error
        }
      } else {
        // Evaluate cycle auto-reset
        if (new Date() > new Date(data.cycle_end)) {
          const resetData = await handleCycleReset(data.id)
          setCreditsData(resetData)
        } else {
          setCreditsData(data)
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const createInitialCredits = async (userId: string) => {
    // Busca o plano do usuário para definir os créditos iniciais
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_tier')
      .eq('id', userId)
      .single()

    const isFree = !profile || profile.plan_tier === 'free'
    const initialCredits = isFree ? 10 : 150

    const { data, error } = await supabase
      .from('creditos_mensais')
      .insert([{ user_id: userId, credits_total: initialCredits, credits_used: 0 }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  const handleCycleReset = async (id: string) => {
    const cycleEnd = new Date()
    cycleEnd.setDate(cycleEnd.getDate() + 30) // Plus 30 days
    
    const { data, error } = await supabase
      .from('creditos_mensais')
      .update({
        credits_used: 0,
        cycle_start: new Date().toISOString(),
        cycle_end: cycleEnd.toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const deductCredits = async (amount: number = 1): Promise<boolean> => {
    if (!creditsData) return false
    if (!hasCredits(amount)) return false

    const newUsed = creditsData.credits_used + amount

    try {
      const { data, error } = await supabase
        .from('creditos_mensais')
        .update({ credits_used: newUsed })
        .eq('id', creditsData.id)
        .select()
        .single()

      if (error) throw error
      setCreditsData(data)
      return true
    } catch (err: any) {
      console.error('Error deducting credits:', err)
      return false
    }
  }

  const hasCredits = (amount: number = 1): boolean => {
    if (!creditsData) return false
    return (creditsData.credits_total - creditsData.credits_used) >= amount
  }

  const availableCredits = creditsData ? creditsData.credits_total - creditsData.credits_used : 0

  return {
    creditsData,
    availableCredits,
    isLoading,
    error,
    fetchCredits,
    deductCredits,
    hasCredits
  }
}
