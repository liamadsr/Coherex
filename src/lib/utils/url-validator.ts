/**
 * Validates that a URL is safe for redirection to prevent open redirect attacks
 * Only allows relative URLs that don't contain protocol or double slashes
 */
export function isValidRedirectUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }

  // Trim whitespace
  const trimmedUrl = url.trim()
  
  // Reject empty strings
  if (!trimmedUrl) {
    return false
  }

  // Must start with a single forward slash
  if (!trimmedUrl.startsWith('/')) {
    return false
  }

  // Reject URLs with double slashes (could be protocol-relative URLs)
  if (trimmedUrl.includes('//')) {
    return false
  }

  // Reject URLs with protocols
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmedUrl)) {
    return false
  }

  // Reject URLs with @ symbol (could be used for authentication bypass)
  if (trimmedUrl.includes('@')) {
    return false
  }

  // Reject URLs with backslashes (could be used for path traversal)
  if (trimmedUrl.includes('\\')) {
    return false
  }

  return true
}

/**
 * Gets a safe redirect URL, falling back to a default if the URL is invalid
 */
export function getSafeRedirectUrl(
  url: string | null | undefined, 
  defaultUrl: string = '/dashboard'
): string {
  if (isValidRedirectUrl(url)) {
    return url!
  }
  return defaultUrl
}

/**
 * Allowlist of valid redirect paths
 * Use this for extra security in critical auth flows
 */
const ALLOWED_REDIRECT_PATHS = [
  '/dashboard',
  '/agents',
  '/knowledge',
  '/settings',
  '/integrations',
  '/analytics',
  '/profile',
  '/team',
  '/organization',
  '/billing',
  '/api-keys',
  '/logs',
]

/**
 * Validates against an allowlist of redirect paths
 * More restrictive than isValidRedirectUrl
 */
export function isAllowlistedRedirectUrl(url: string | null | undefined): boolean {
  if (!isValidRedirectUrl(url)) {
    return false
  }
  
  // Check if the URL starts with any of the allowed paths
  return ALLOWED_REDIRECT_PATHS.some(path => 
    url === path || url?.startsWith(`${path}/`) || url?.startsWith(`${path}?`)
  )
}

/**
 * Gets a safe redirect URL using allowlist validation
 */
export function getSafeAllowlistedRedirectUrl(
  url: string | null | undefined,
  defaultUrl: string = '/dashboard'
): string {
  if (isAllowlistedRedirectUrl(url)) {
    return url!
  }
  return defaultUrl
}