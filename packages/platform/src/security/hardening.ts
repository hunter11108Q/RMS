import crypto from 'crypto';

export class SecurityHardener {
  /**
   * Sanitizes input to protect against raw XSS injections.
   */
  public static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return input;
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Obfuscates sensitive data (such as bank details or credit card accounts).
   */
  public static maskSensitiveData(value: string, visibleLength = 4): string {
    if (!value) return '';
    if (value.length <= visibleLength) return '*'.repeat(value.length);
    const maskedLength = value.length - visibleLength;
    return '*'.repeat(maskedLength) + value.slice(-visibleLength);
  }

  /**
   * Generates a random cryptographic state token.
   */
  public static generateSecureToken(bytes = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }
}
export default SecurityHardener;
