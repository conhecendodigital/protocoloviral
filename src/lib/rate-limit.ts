const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

/**
 * Limitador de taxa em memória (útil para Single Instances ou desenvolvimento local).
 * Em produção distribuída rigorosa, pode resetar por instância serverless.
 * @param userId O ID do usuário autenticado
 * @param maxRequests Máximo de chamadas permitidas por janela
 * @param windowMs O tamanho da janela em milissegundos
 * @returns boolean 'true' se as chamadas forem permitidas, 'false' se estourou a quota.
 */
export function checkRateLimit(userId: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)
  
  if (!entry || now > entry.resetAt) {
    // Primeira entrada ou expirou a janela antiga, reinicia a conta.
    rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs })
    return true
  }
  
  if (entry.count >= maxRequests) {
    // Extrapolou o limite na janela
    return false
  }
  
  entry.count++
  return true
}
