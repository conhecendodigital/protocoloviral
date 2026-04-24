'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Notification, TYPE_COLORS, TYPE_LABELS } from '@/data/notifications'
import { Bell, BellOff } from 'lucide-react'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

interface NotificationPanelProps {
  notifications: Notification[]
  unreadCount: number
  onRead: (id: string) => void
  onReadAll: () => void
}

export function NotificationPanel({ 
  notifications, 
  unreadCount, 
  onRead, 
  onReadAll 
}: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen])

  const now = useMemo(() => Date.now(), [notifications])

  const handleNotificationClick = (n: Notification) => {
    onRead(n.id)
    setIsOpen(false)
  }

  const formatTime = (timestamp: number) => {
    const diff = now - timestamp
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Agora'
    if (mins < 60) return `${mins}min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}d`
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`size-9 sm:size-10 rounded-full flex items-center justify-center transition-all border relative ${
          isOpen 
            ? 'bg-[#0ea5e9]/20 text-[#0ea5e9] border-[#0ea5e9]/30' 
            : 'bg-black/5 dark:bg-white/5 text-slate-800 dark:text-white/90 hover:text-slate-900 dark:hover:text-white border-slate-300/10 dark:border-white/10 hover:border-slate-300/20 dark:hover:border-white/20'
        }`}
      >
        <Bell size={20} className="text-xl" />
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 size-5 rounded-full bg-red-500 text-slate-900 dark:text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] max-h-[70vh] rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl shadow-2xl shadow-black/10 dark:shadow-black/50 overflow-hidden z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-[#0ea5e9] text-xl" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notificações</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold bg-[#0ea5e9]/15 text-[#0ea5e9] px-2 py-0.5 rounded-full">
                    {unreadCount} novas
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={onReadAll}
                  className="text-xs text-slate-700 dark:text-white/90 hover:text-[#0ea5e9] transition-colors font-medium"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <BellOff size={36} className="text-4xl text-slate-800 dark:text-white/90 mb-3 block" />
                  <p className="text-sm text-slate-700 dark:text-white/90">Nenhuma notificação no momento.</p>
                </div>
              ) : (
                <div className="divide-y divide-black/5 dark:divide-white/5">
                  {notifications.map((n) => {
                    const typeColor = TYPE_COLORS[n.type]
                    const typeLabel = TYPE_LABELS[n.type]
                    
                    const content = (
                      <div
                        className={`px-5 py-4 flex gap-3.5 transition-colors cursor-pointer group ${
                          n.read 
                            ? 'opacity-60 hover:opacity-80' 
                            : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                        }`}
                        onClick={() => handleNotificationClick(n)}
                      >
                        {/* Icon */}
                        <div 
                          className="size-10 rounded-xl flex items-center justify-center shrink-0 border"
                          style={{ 
                            backgroundColor: `${typeColor}15`,
                            borderColor: `${typeColor}30`,
                          }}
                        >
                          <DynamicIcon name={n.icon} size={18} style={{ color: typeColor }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span 
                              className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                              style={{ 
                                backgroundColor: `${typeColor}15`,
                                color: typeColor,
                              }}
                            >
                              {typeLabel}
                            </span>
                            <span className="text-[10px] text-slate-800 dark:text-white/90 ml-auto shrink-0">
                              {formatTime(n.timestamp)}
                            </span>
                          </div>
                          <h4 className={`text-sm font-bold mb-0.5 truncate ${n.read ? 'text-slate-800 dark:text-white/90' : 'text-slate-900 dark:text-white'}`}>
                            {n.title}
                          </h4>
                          <p className="text-xs text-slate-700 dark:text-white/90 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                        </div>

                        {/* Unread dot */}
                        {!n.read && (
                          <div className="shrink-0 mt-2">
                            <div className="size-2 rounded-full bg-[#0ea5e9] shadow-lg shadow-[#0ea5e9]/50" />
                          </div>
                        )}
                      </div>
                    )

                    if (n.href) {
                      return (
                        <Link key={n.id} href={n.href} className="block">
                          {content}
                        </Link>
                      )
                    }

                    return <div key={n.id}>{content}</div>
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-white/10 shrink-0">
              <p className="text-[10px] text-slate-800 dark:text-white/90 text-center">
                As notificações são geradas com base no seu progresso na plataforma.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
