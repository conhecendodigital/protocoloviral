'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Notification, 
  NotificationContext, 
  NOTIFICATION_TEMPLATES 
} from '@/data/notifications'

const supabase = createClient()

interface UseNotificationsProps {
  completion: number
  hasAvatar: boolean
  userName: string
  onboardingCompleted: boolean
  xp: number
  level: number
  conquistasCount: number
  userId?: string
}

const JORNADA_KEY = 'jornada-completed'

function loadJornadaDone(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(JORNADA_KEY)
    if (raw) return JSON.parse(raw).length
  } catch { /* ignore */ }
  return 0
}

export function useNotifications({
  completion,
  hasAvatar,
  userName,
  onboardingCompleted,
  xp,
  level,
  conquistasCount,
  userId,
}: UseNotificationsProps) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [jornadaDone, setJornadaDone] = useState(0)
  const [loaded, setLoaded] = useState(false)

  // Load read IDs from Supabase
  useEffect(() => {
    if (!userId) return
    
    async function loadFromSupabase() {
      const { data } = await supabase
        .from('profiles')
        .select('notifications_read')
        .eq('id', userId)
        .single()

      if (data?.notifications_read) {
        setReadIds(new Set(data.notifications_read))
      }
      setLoaded(true)
    }

    loadFromSupabase()
    setJornadaDone(loadJornadaDone())
  }, [userId, supabase])

  // Save read IDs to Supabase
  const saveToSupabase = useCallback(async (ids: Set<string>) => {
    if (!userId) return
    await supabase
      .from('profiles')
      .update({ notifications_read: [...ids] })
      .eq('id', userId)
  }, [userId, supabase])

  const ctx: NotificationContext = useMemo(() => {
    const now = new Date()
    return {
      completion,
      jornadaDone,
      jornadaTotal: 30,
      dayOfWeek: now.getDay(),
      hour: now.getHours(),
      hasAvatar,
      userName,
      onboardingCompleted,
      xp,
      level,
      conquistasCount,
    }
  }, [completion, jornadaDone, hasAvatar, userName, onboardingCompleted, xp, level, conquistasCount])

  // Generate notifications from templates based on current context
  const notifications: Notification[] = useMemo(() => {
    return NOTIFICATION_TEMPLATES
      .filter(t => t.condition(ctx))
      .sort((a, b) => b.priority - a.priority)
      .map((t, i) => ({
        id: `${t.type}-${t.title.replace(/\s+/g, '-').toLowerCase()}`,
        type: t.type,
        icon: t.icon,
        title: t.title,
        message: t.message,
        href: t.href,
        read: readIds.has(`${t.type}-${t.title.replace(/\s+/g, '-').toLowerCase()}`),
        timestamp: Date.now() - (i * 60000 * 5),
      }))
  }, [ctx, readIds])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = useCallback((id: string) => {
    setReadIds(prev => {
      const next = new Set(prev)
      next.add(id)
      saveToSupabase(next)
      return next
    })
  }, [saveToSupabase])

  const markAllAsRead = useCallback(() => {
    setReadIds(prev => {
      const next = new Set(prev)
      notifications.forEach(n => next.add(n.id))
      saveToSupabase(next)
      return next
    })
  }, [notifications, saveToSupabase])

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loaded,
  }
}
