'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AdminLogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    document.cookie = "pv_admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/admin;"
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
