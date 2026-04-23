import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Crown, Home } from 'lucide-react'
import { AdminLogoutButton } from './logout-button'

export const metadata = {
  title: 'Painel Admin - Protocolo Viral',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('pv_admin_auth')
  const isAuthenticated = authCookie?.value === 'authenticated'

  // Para evitar redicionamento infinito, o layout não bloqueia se não estiver autenticado 
  // caso seja uma rota pública de admin. Porém, o layout envolve tudo em (admin)/admin.
  // Como as rotas filhas podem precisar verificar a autenticação ou o próprio layout pode fazê-lo:
  // Se não estivermos autenticados, redireciona para a tela de login.
  // Nota: Isso assumindo que o login fica em /admin/login. Se estivessemos em /admin/login 
  // já teríamos que tratar diferente. Como o intercept é aqui, fazemos uma verificação baseada no header x-invoke-path 
  // ou simplesmente deixamos o Auth na page.tsx, ou checamos os headers.
  
  // Vamos deixar o layout puro e lidar com o redirect no nível de cada página para facilitar, 
  // ou usar um Header que o usuário veja. Aqui, vamos renderizar o layout do Painel se autenticado,
  // ou renderizar apenas o 'children' se não estiver (para a página de login ocupar a tela).

  if (!isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Header Admin */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg hidden sm:block">Admin Protocolo Viral</h1>
            <h1 className="font-bold text-lg sm:hidden">Admin</h1>
          </div>
          
          <nav className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar ao App</span>
            </Link>
            <div className="w-px h-4 bg-white/10" />
            <AdminLogoutButton />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
