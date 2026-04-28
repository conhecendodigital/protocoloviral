import { cookies } from 'next/headers'
import crypto from 'crypto'

/**
 * Admin auth via HMAC-signed cookie.
 *
 * Token format: <expiresAtISO>.<base64url-HMAC-SHA256(expiresAtISO)>
 * Secret: process.env.ADMIN_SESSION_SECRET (32+ chars)
 *
 * Sem ADMIN_SESSION_SECRET configurado, todas as funções fail-closed.
 */

export const ADMIN_COOKIE = 'pv_admin_auth'
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000 // 24h

function getSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 16) return null
  return secret
}

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

export function signAdminToken(): string | null {
  const secret = getSecret()
  if (!secret) return null
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString()
  const sig = b64url(crypto.createHmac('sha256', secret).update(expiresAt).digest())
  return `${expiresAt}.${sig}`
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false
  const secret = getSecret()
  if (!secret) return false

  const dot = token.indexOf('.')
  if (dot === -1) return false

  const expiresAt = token.slice(0, dot)
  const sig = token.slice(dot + 1)

  const expectedSig = b64url(crypto.createHmac('sha256', secret).update(expiresAt).digest())
  if (!timingSafeEqual(sig, expectedSig)) return false

  const expMs = Date.parse(expiresAt)
  if (Number.isNaN(expMs) || expMs < Date.now()) return false

  return true
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  return verifyAdminToken(token)
}
