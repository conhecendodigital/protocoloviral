'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AdminLogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch {
      // segue para o redirect mesmo se a chamada falhar
    }
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">Sair</span>
    </button>
  )
}
