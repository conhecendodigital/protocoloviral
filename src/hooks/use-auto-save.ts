'use client'

import { useEffect, useRef, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

/** Whitelist of fields the user is allowed to auto-save */
const EDITABLE_FIELDS = new Set([
  'nome_completo', 'avatar_url',
  'nicho', 'assunto', 'formacoes', 'resultado', 'diferencial',
  'publico', 'dor', 'tentou', 'concorrentes', 'proposito',
  'receio', 'tempo', 'naoquer',
  'resposta1', 'resposta2', 'resposta3', 'resposta4', 'resposta5',
  'ideia_roteiro', 'produto_venda',
])

export function useAutoSave(userId: string | undefined) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const saveField = useCallback(async (fieldName: string, value: string) => {
    if (!userId) return false

    // Security: block writes to non-whitelisted fields (xp, nivel, etc.)
    if (!EDITABLE_FIELDS.has(fieldName)) {
      console.warn(`[useAutoSave] Blocked write to non-editable field: "${fieldName}"`)
      return false
    }

    // Security: enforce max length
    const isResponseField = fieldName.startsWith('resposta')
    const maxLen = isResponseField ? 20_000 : 5_000
    const sanitizedValue = typeof value === 'string' ? value.slice(0, maxLen) : value

    try {
      const updateData: Record<string, string> = {}
      updateData[fieldName] = sanitizedValue

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)

      return !error
    } catch {
      return false
    }
  }, [userId, supabase])

  const debouncedSave = useCallback((fieldName: string, value: string, onStatus: (s: 'saving' | 'saved' | 'error') => void) => {
    onStatus('saving')

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(async () => {
      const success = await saveField(fieldName, value)
      onStatus(success ? 'saved' : 'error')
    }, 1000)
  }, [saveField])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return { debouncedSave, saveField }
}
