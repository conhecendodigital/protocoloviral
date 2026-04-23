import { createClient } from '@supabase/supabase-js'

/**
 * Retorna um Supabase Client com permissões de administrador (Service Role).
 * Este client ignora as políticas de Row Level Security (RLS) e não deve ser usado
 * para o app normal do usuário, apenas em rotas do /admin ou background jobs.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
