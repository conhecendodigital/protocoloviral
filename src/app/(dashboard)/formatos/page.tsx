'use client'

/**
 * formatos/page.tsx
 *
 * Esta página agora usa o componente compartilhado FormatosFeed,
 * eliminando a duplicação de lógica e o anti-pattern de page-imports-page.
 *
 * Exports necessários para compatibilidade (normalizeFormato, Formato) foram
 * movidos para @/components/formatos/FormatosFeed.tsx
 */
export { normalizeFormato } from '@/components/formatos/FormatosFeed'
import { FormatosFeed } from '@/components/formatos/FormatosFeed'

export default function FormatosPage() {
  return <FormatosFeed />
}
