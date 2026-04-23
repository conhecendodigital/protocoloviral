import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { password } = await req.json()
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      console.error('Variável ADMIN_PASSWORD não configurada no .env.local')
      return NextResponse.json(
        { error: 'Painel em manutenção ou mal configurado.' },
        { status: 500 }
      )
    }

    if (password === adminPassword) {
      const cookieStore = await cookies()
      
      // Define um cookie HttpOnly seguro válido por 24 horas
      cookieStore.set('pv_admin_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/admin',
        maxAge: 60 * 60 * 24 // 1 dia
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Senha incorreta' },
      { status: 401 }
    )
  } catch (error) {
    console.error('[Admin Login Error]', error)
    return NextResponse.json(
      { error: 'Erro ao processar login' },
      { status: 500 }
    )
  }
}
