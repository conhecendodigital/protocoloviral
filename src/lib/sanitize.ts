/**
 * Sanitization utilities for user inputs and prompt injection protection.
 */

/**
 * Maximum allowed length for profile text fields.
 */
export const MAX_FIELD_LENGTH = 5000

/**
 * Maximum allowed length for long-form response fields (resposta1-5).
 */
export const MAX_RESPONSE_LENGTH = 20_000

/**
 * Sanitize a user input string by:
 * 1. Trimming whitespace
 * 2. Removing null bytes
 * 3. Limiting length
 */
export function sanitizeInput(value: string, maxLength: number = MAX_FIELD_LENGTH): string {
  if (!value || typeof value !== 'string') return ''
  return value
    .replace(/\0/g, '') // Remove null bytes
    .trim()
    .slice(0, maxLength)
}

/**
 * Sanitize text that will be interpolated into AI prompts.
 * Removes common prompt injection patterns while preserving normal content.
 */
export function sanitizeForPrompt(value: string): string {
  if (!value || typeof value !== 'string') return '[Não preenchido]'

  let sanitized = value
    .replace(/\0/g, '')
    .trim()

  // Remove common prompt injection patterns
  // These patterns try to override the system prompt
  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions|prompts|rules)/gi,
    /forget\s+(all\s+)?(previous|above|prior)\s+(instructions|prompts|rules)/gi,
    /disregard\s+(all\s+)?(previous|above|prior)\s+(instructions|prompts|rules)/gi,
    /you\s+are\s+now\s+/gi,
    /new\s+instructions?\s*:/gi,
    /system\s*:\s*/gi,
    /\[SYSTEM\]/gi,
    /\[INST\]/gi,
    /<\|system\|>/gi,
    /<\|im_start\|>/gi,
  ]

  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, '[conteúdo removido]')
  }

  return sanitized || '[Não preenchido]'
}

/**
 * Validate file type against allowed MIME types.
 */
export function isAllowedImageType(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  return allowedTypes.includes(file.type)
}

/**
 * Validate file size.
 * @param file - File to check
 * @param maxSizeMB - Maximum size in megabytes (default: 5MB)
 */
export function isFileSizeValid(file: File, maxSizeMB: number = 5): boolean {
  return file.size <= maxSizeMB * 1024 * 1024
}

/**
 * Validate RAG document file type.
 */
export function isAllowedDocumentType(file: File): boolean {
  const allowedTypes = ['application/pdf', 'text/plain']
  const allowedExtensions = ['.pdf', '.txt']
  const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '')
  return allowedTypes.includes(file.type) || allowedExtensions.includes(ext)
}
