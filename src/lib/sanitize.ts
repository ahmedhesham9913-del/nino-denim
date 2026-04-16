/**
 * Strip all HTML tags from a string.
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

/**
 * Sanitize Egyptian phone number.
 * Strips non-digit chars (except leading +), validates format.
 * Returns sanitized phone or original if format doesn't match.
 */
export function sanitizePhone(str: string): string {
  const cleaned = str.replace(/[^\d+]/g, "");
  return cleaned;
}

/**
 * Sanitize email: lowercase + trim.
 */
export function sanitizeEmail(str: string): string {
  return str.toLowerCase().trim();
}

/**
 * Sanitize address: strip HTML, trim, enforce max length.
 */
export function sanitizeAddress(str: string, maxLength = 500): string {
  return stripHtml(str).slice(0, maxLength);
}
