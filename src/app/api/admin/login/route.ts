import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { signAdminToken, ADMIN_COOKIE } from '@/lib/admin-auth'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim()
      || headersList.get('x-real-ip')
      || 'unknown'

    const rl = checkRateLimit(`admin-login:${ip}`, 5, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde 1 minuto.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      )
    }

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
      const token = signAdminToken()
      if (!token) {
        console.error('ADMIN_SESSION_SECRET não configurado — não foi possível assinar token admin.')
        return NextResponse.json(
          { error: 'Painel em manutenção ou mal configurado.' },
          { status: 500 }
        )
      }

      const cookieStore = await cookies()
      cookieStore.set(ADMIN_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
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
