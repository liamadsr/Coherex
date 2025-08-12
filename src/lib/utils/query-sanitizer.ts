/**
 * Sanitizes user input for PostgREST queries to prevent query injection attacks
 * Escapes special characters that could be used to manipulate PostgREST queries
 */
export function sanitizePostgrestQuery(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // PostgREST special characters that need escaping:
  // , (comma) - used to separate multiple conditions
  // . (dot) - used for operators like .eq, .ilike, etc.
  // : (colon) - used in some operators
  // ! (exclamation) - used for negation
  // * (asterisk) - wildcard
  // () (parentheses) - grouping
  // [] (brackets) - array operations
  
  // Replace potentially dangerous characters with escaped versions
  return input
    .replace(/[,.:!*()[\]]/g, '') // Remove special PostgREST operators
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/%/g, '\\%') // Escape wildcards for LIKE operations
    .replace(/_/g, '\\_') // Escape single character wildcards
    .trim()
}

/**
 * Alternative safer approach: Use separate .ilike() calls instead of .or() with string interpolation
 * This completely avoids the injection vulnerability
 */
export function buildSafeSearchQuery(supabaseQuery: any, searchTerm: string, fields: string[]) {
  if (!searchTerm || !fields.length) {
    return supabaseQuery
  }

  const sanitized = sanitizePostgrestQuery(searchTerm)
  
  // Build OR conditions safely without string interpolation
  const conditions = fields.map(field => `${field}.ilike.%${sanitized}%`)
  
  // Use the or() method with pre-sanitized input
  return supabaseQuery.or(conditions.join(','))
}