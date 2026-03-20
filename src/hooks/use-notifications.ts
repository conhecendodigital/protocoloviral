'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  Notification, 
  NotificationContext, 
  NOTIFICATION_TEMPLATES 
} from '@/data/notifications'

const STORAGE_KEY = 'platform-notifications-read'
const JORNADA_KEY = 'jornada-completed'

function loadReadIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return new Set(JSON.parse(raw))
  } catch { /* ignore */ }
  return new Set()
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

function loadJornadaDone(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(JORNADA_KEY)
    if (raw) return JSON.parse(raw).length
  } catch { /* ignore */ }
  return 0
}

interface UseNotificationsProps {
  completion: number
  hasAvatar: boolean
  userName: string
  onboardingCompleted: boolean
  xp: number
  level: number
  conquistasCount: number
}

export function useNotifications({
  completion,
  hasAvatar,
  userName,
  onboardingCompleted,
  xp,
  level,
  conquistasCount,
}: UseNotificationsProps) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [jornadaDone, setJornadaDone] = useState(0)

  useEffect(() => {
    setReadIds(loadReadIds())
    setJornadaDone(loadJornadaDone())
  }, [])

  const now = new Date()
  const ctx: NotificationContext = useMemo(() => ({
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
  }), [completion, jornadaDone, hasAvatar, userName, onboardingCompleted, xp, level, conquistasCount, now.getDay(), now.getHours()])

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
        timestamp: Date.now() - (i * 60000 * 5), // stagger timestamps
      }))
  }, [ctx, readIds])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = useCallback((id: string) => {
    setReadIds(prev => {
      const next = new Set(prev)
      next.add(id)
      saveReadIds(next)
      return next
    })
  }, [])

  const markAllAsRead = useCallback(() => {
    setReadIds(prev => {
      const next = new Set(prev)
      notifications.forEach(n => next.add(n.id))
      saveReadIds(next)
      return next
    })
  }, [notifications])

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  }
}
