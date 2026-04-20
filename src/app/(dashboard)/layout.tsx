'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-slate-50 dark:bg-[#000000] text-slate-900 dark:text-slate-100 min-h-screen font-sans">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/5 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-blue-600/5 rounded-full blur-[80px]"></div>
      </div>
      
      <div className="relative z-10 flex h-screen overflow-hidden">
        <Sidebar className="shrink-0" />
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative">
          <Header className="sticky top-0 z-20" />
          <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

